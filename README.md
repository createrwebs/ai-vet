# AI Vet - Veterinary Clinic Management System

A comprehensive, AI-powered veterinary clinic management software built with Next.js, TypeScript, and Tailwind CSS. This system provides veterinary professionals with tools to manage pets, owners, appointments, medical reports, and access AI-powered veterinary assistance.

## 🐾 Features

### 🔐 Authentication & Security
- **Secure Login System**: Professional authentication with email/password
- **Protected Routes**: All sensitive pages require authentication
- **Session Management**: Persistent login state with secure cookies
- **Role-based Access**: Veterinarian, Admin, Staff, and Receptionist roles

### 🎨 Modern User Interface
- **Vertical Sidebar Navigation**: Professional left sidebar layout optimized for veterinary workflows
- **Responsive Design**: Mobile-first design with collapsible sidebar for mobile devices
- **Clean Dashboard**: Modern card-based layout with statistics and quick actions
- **Consistent Navigation**: Unified sidebar across all protected pages

### Core Management
- **Pet Management**: Complete pet records with species, breed, medical history, vaccinations, and owner information
- **Owner Management**: Track pet owners with contact details and multiple pets per owner
- **Appointment Scheduling**: Advanced appointment booking system with time slot management for checkups, vaccinations, surgeries, grooming, and more
- **Medical Reports**: Comprehensive reporting system for lab results, diagnostics, treatment records, and vaccination records

### AI-Powered Assistance
- **Veterinary AI Assistant**: Intelligent chatbot for symptom analysis, treatment suggestions, and veterinary research
- **Smart Recommendations**: AI-driven insights for pet care and treatment planning
- **Drug Interaction Checking**: Automated medication safety verification for pets
- **Medical Image Analysis**: AI-powered X-ray, ultrasound, and diagnostic image analysis
- **Risk Assessment**: AI-based health risk prediction for pets

### User Experience
- **Intuitive Navigation**: Vertical sidebar with clear icons and labels
- **Quick Actions**: Easy access to add pets, schedule appointments, and generate reports
- **Mobile Optimized**: Responsive design that works on all devices
- **Multi-language Support**: Internationalization ready

## 🛠️ Technology Stack

### Core Framework
- **Next.js**: 15.5.0 (with App Router)
- **React**: 19.2.1
- **TypeScript**: ^5
- **Build Tool**: Turbopack (built into Next.js 15)

### Authentication & Database
- **NextAuth.js**: ^4.24.13
- **Mongoose**: ^9.0.0
- **MongoDB**: ^6.18.0
- **@auth/mongodb-adapter**: ^3.10.0
- **bcryptjs**: ^3.0.2

### UI & Styling
- **Tailwind CSS**: ^4
- **Lucide React**: ^0.555.0
- **React Hot Toast**: ^2.6.0

### Additional Libraries
- **next-intl**: ^4.3.6 (internationalization)
- **html2canvas**: ^1.4.1
- **jspdf**: ^3.0.2
- **cookies-next**: ^6.1.0

## 📁 Project Structure

```
ai-vet/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Main Dashboard (Protected)
│   ├── login/                   # Authentication
│   ├── pets/                    # Pet Management (Protected)
│   │   ├── page.tsx            # Pets List
│   │   ├── new/                # Add New Pet
│   │   └── [id]/               # Pet Details & Edit
│   ├── appointments/            # Appointment Management (Protected)
│   ├── reports/                 # Medical Reports (Protected)
│   ├── ai-assistant/            # AI Veterinary Assistant (Protected)
│   ├── ai-treatment-recommendations/
│   ├── ai-drug-interaction/
│   ├── ai-medical-image/
│   ├── ai-risk-assessment/
│   ├── ai-health-trends/
│   ├── ai-health-analytics/
│   ├── components/              # Reusable Components
│   └── api/                     # API Routes
│       ├── pets/               # Pet CRUD operations
│       ├── appointments/       # Appointment management
│       ├── reports/            # Report management
│       └── ai/                 # AI service endpoints
├── models/                      # MongoDB Models
│   ├── Pet.ts                  # Pet schema (species, breed, owner, vaccinations)
│   ├── Appointment.ts          # Appointment schema
│   ├── Report.ts               # Medical report schema
│   └── User.ts                 # User schema (veterinarian, staff)
├── lib/                         # Utilities
├── messages/                    # i18n translations
└── scripts/                     # Utility scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB database (local or cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-vet
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` and add your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-vet
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   ```

4. **Seed the database**
   ```bash
   npm run seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### 🔐 Login Credentials

**Demo Account:**
- **Email**: `vet@aivet.com`
- **Password**: `password123`

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production with Turbopack
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with sample data

## 🎯 Key Pages

### Dashboard (`/`)
- Overview of clinic statistics
- Recent activity feed
- Upcoming appointments
- Quick actions

### Pets (`/pets`)
- Pet directory with search and filtering by species
- Pet status management (active, inactive, deceased)
- Quick access to pet records
- Owner contact information

### Appointments (`/appointments`)
- Daily appointment schedule
- Appointment types: Consultation, Checkup, Vaccination, Surgery, Grooming, Dental, Emergency
- Status tracking (scheduled, confirmed, in-progress, completed, cancelled, no-show)
- Doctor assignment

### Medical Reports (`/reports`)
- Lab results, diagnostics, treatment records
- Vaccination records
- Priority-based organization
- PDF generation and download

### AI Assistant (`/ai-assistant`)
- Veterinary query assistance
- Pet symptom analysis
- Treatment research
- Drug interaction checking

## 🐾 Pet Species Supported

- 🐕 Dogs
- 🐱 Cats
- 🦜 Birds
- 🐰 Rabbits
- 🐹 Hamsters
- 🐠 Fish
- 🦎 Reptiles
- 🐴 Horses
- Other exotic pets

## 🔧 Configuration

### MongoDB Connection
The system uses MongoDB for data storage. Configure your connection string in `.env.local`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-vet
```

### AI Models
Configure AI models in the AI Settings page for features like:
- Symptom analysis
- Treatment recommendations
- Drug interaction checking
- Medical image analysis

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full sidebar with expanded navigation
- **Tablet**: Adaptive sidebar with touch-friendly controls
- **Mobile**: Collapsible sidebar with mobile-optimized layout

## 🔒 Security Features

- **Authentication Required**: All sensitive pages protected
- **Form Validation**: Client and server-side validation
- **Secure Routing**: Protected route implementation
- **Session Management**: Secure cookie handling
- **Middleware Protection**: Server-level route protection

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

### Other Platforms
The application can be deployed to any platform that supports Node.js:
- Netlify
- AWS
- Google Cloud
- DigitalOcean

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ for veterinary professionals
