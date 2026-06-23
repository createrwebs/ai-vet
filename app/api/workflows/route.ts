import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { MongoClient } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const workflowData = await request.json();
    
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db();
    const workflowsCollection = db.collection('workflows');
    
    // Add creation timestamp
    const workflow = {
      ...workflowData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await workflowsCollection.insertOne(workflow);
    await client.close();
    
    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
      message: 'Workflow saved successfully'
    });
  } catch (error) {
    console.error('Error saving workflow:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save workflow' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');
    
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db();
    const workflowsCollection = db.collection('workflows');
    
    let query: any = {};
    if (patientId) query.patientId = patientId;
    if (status) query.status = status;
    
    const workflows = await workflowsCollection
      .find(query)
      .sort({ updatedAt: -1 })
      .toArray();
    
    await client.close();
    
    return NextResponse.json({
      success: true,
      workflows: workflows.map(workflow => ({
        ...workflow,
        id: workflow._id.toString()
      }))
    });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workflows' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const workflowData = await request.json();
    const { id, ...updateData } = workflowData;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Workflow ID is required' },
        { status: 400 }
      );
    }
    
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db();
    const workflowsCollection = db.collection('workflows');
    
    const result = await workflowsCollection.updateOne(
      { _id: id },
      { 
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      }
    );
    
    await client.close();
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Workflow not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Workflow updated successfully'
    });
  } catch (error) {
    console.error('Error updating workflow:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update workflow' },
      { status: 500 }
    );
  }
}
