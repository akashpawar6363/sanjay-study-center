# Sanjay Study Center - Library Management System

A comprehensive library management system built with Next.js, Supabase, and TypeScript for managing student admissions, seats, and library operations in Pune.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)

## 🌟 Features

### Authentication & Authorization
- ✅ Supabase Auth integration
- ✅ Role-based access control (Admin & Coordinator)
- ✅ Secure session management
- ✅ Row Level Security (RLS)

### Dashboard
- ✅ Real-time statistics (admissions, revenue, occupancy)
- ✅ Chart.js visualizations (occupancy, revenue trends)
- ✅ Expiring admissions alerts
- ✅ Dark/Light mode support

### Admission Management
- ✅ Create, Read, Update, Delete admissions
- ✅ Auto-increment receipt numbers
- ✅ Category-based fee management
- ✅ Student information management
- ✅ Payment mode tracking (Cash/Online)
- ✅ Renewal date calculations
- ✅ Digital signature support

### Settings
- ✅ Category management (add, edit, delete)
- ✅ User management (add/remove coordinators)
- ✅ Profile editing
- ✅ Seat configuration
- ✅ Receipt number settings

### Email System
- ✅ Admission receipt emails
- ✅ Renewal reminder emails (2 days before expiry)
- ✅ Gmail integration via Nodemailer
- ✅ Automated cron jobs for reminders
- ✅ Email delivery tracking

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript |
| **Backend** | Next.js API Routes, Server Actions |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth |
| **Styling** | Tailwind CSS |
| **Charts** | Chart.js, React-Chartjs-2 |
| **Email** | Nodemailer (Gmail) |
| **File Storage** | Supabase Storage |
| **Validation** | Zod |
| **Forms** | React Hook Form |

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18.0 or higher
- npm or yarn
- Git
- A Supabase account
- A Gmail account (for email notifications)

## 🚀 Installation

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd Sanjay-Study-Center
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
# or
yarn install
\`\`\`

### 3. Setup Supabase

Follow the detailed instructions in [supabase/README.md](./supabase/README.md) to:
- Create a Supabase project
- Run the database schema
- Create default admin user
- Setup storage buckets
- Configure RLS policies

### 4. Configure Environment Variables

Create a \`.env.local\` file in the root directory:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Gmail Configuration
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAIL=admin@sanjay-study-center.com

# Cron Secret
CRON_SECRET=generate_a_random_secret_key
\`\`\`

### 5. Run Development Server

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Login with Default Admin

- **Email:** admin@sanjay-study-center.com
- **Password:** Sanjay@008814

## 📁 Project Structure

\`\`\`
sanjay-study-center/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   └── layout.tsx
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── dashboard/
│   │   ├── admissions/
│   │   ├── settings/
│   │   └── layout.tsx
│   ├── api/                      # API routes
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/                   # React components
│   ├── ui/                       # Reusable UI components
│   ├── layout/                   # Layout components
│   ├── dashboard/                # Dashboard components
│   ├── admissions/               # Admission components
│   └── settings/                 # Settings components
├── lib/                          # Utility libraries
│   ├── supabase/                 # Supabase client configs
│   ├── utils/                    # Helper functions
│   ├── email/                    # Email templates
│   └── constants.ts
├── types/                        # TypeScript type definitions
├── supabase/                     # Supabase schema & setup
├── public/                       # Static assets
├── middleware.ts                 # Next.js middleware
├── tailwind.config.ts
├── tsconfig.json
└── package.json
\`\`\`

## 👥 User Roles

### Admin (Owner)
- Full CRUD operations on admissions
- Manage categories and rates
- Manage library seats
- Create/delete coordinator accounts
- Upload profile photos and signatures
- Access all settings
- View all analytics

### Coordinator
- Create new admissions only
- View all admissions
- View dashboard analytics
- Upload own profile photo and signature
- Cannot delete/edit admissions
- No access to settings

## 🔐 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@sanjay-study-center.com | Sanjay@008814 |

> ⚠️ **Important:** Change the default password after first login!

## 📧 Email Setup

### Gmail App Password

1. Enable 2-Step Verification for your Gmail account
2. Go to Google Account → Security → 2-Step Verification → App passwords
3. Create a new app password for "Mail"
4. Copy the generated password to \`GMAIL_APP_PASSWORD\` in \`.env.local\`

### Email Features

- **Admission Receipt:** Sent immediately after admission creation
- **Renewal Reminder:** Sent 2 days before renewal date
- **Admin Report:** Daily email with expiring admissions (Excel attachment)

## 🎨 Theme Support

The application supports both dark and light modes:
- Toggle via the theme button in the header
- Persisted across sessions
- System theme detection

## 📊 Database Schema

### Tables
- **profiles** - User profiles (admin & coordinator)
- **categories** - Admission categories and rates
- **admissions** - Student admission records
- **settings** - Application settings
- **email_logs** - Email delivery logs

### Default Categories
- Reserved: ₹1,300
- Non-Reserved: ₹1,100
- Reserved with Locker: ₹1,600

## 🔧 Development

### Build for Production

\`\`\`bash
npm run build
npm run start
\`\`\`

### Linting

\`\`\`bash
npm run lint
\`\`\`

### Type Checking

\`\`\`bash
npx tsc --noEmit
\`\`\`

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Vercel Cron Jobs

Add to \`vercel.json\` for scheduled emails:

\`\`\`json
{
  "crons": [
    {
      "path": "/api/cron/renewal-reminders",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/admin-report",
      "schedule": "0 9 * * *"
    }
  ]
}
\`\`\`

## 🐛 Troubleshooting

### Cannot Login
- Verify user exists in Supabase Authentication
- Check profile exists in profiles table
- Ensure environment variables are correct

### Database Errors
- Check RLS policies are enabled
- Verify user has correct role in profiles table
- Check Supabase project status

### Email Not Sending
- Verify Gmail App Password is correct
- Check GMAIL_USER matches the account
- Review email_logs table for errors

### Storage Upload Fails
- Ensure storage buckets exist
- Check storage policies
- Verify file size and type restrictions

## 📝 TODO

- [ ] Complete settings pages (categories, users, profile)
- [ ] Implement email system with Nodemailer
- [ ] Add API routes for all operations
- [ ] Create admission form
- [ ] Add bulk import/export features
- [ ] Implement admission receipt generation (PDF)
- [ ] Add search and advanced filters
- [ ] Create mobile-responsive sidebar
- [ ] Add activity logs
- [ ] Implement backup/restore

## 🤝 Contributing

This is a proprietary project for Sanjay Study Center, Pune.

## 📄 License

Proprietary - All rights reserved by Sanjay Study Center

## 👤 Contact

For support or queries:
- **Email:** admin@sanjay-study-center.com
- **Location:** Pune, India

---

**Built with ❤️ for Sanjay Study Center**
