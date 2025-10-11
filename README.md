# Digital Math for SAT

A comprehensive Progressive Web Application (PWA) for managing digital math sessions for SAT students. Built with Next.js, Supabase, and Tailwind CSS.

## Features

### Student Features
- **Student Code Login** - Simple authentication using a unique student code
- **Dashboard** - View upcoming sessions with session details and quick access to materials
- **Recorded Sessions** - Browse and watch all previously recorded sessions
- **Session Materials** - Download materials from all available sessions
- **Progress Tracking** - View detailed progress with charts showing completed sessions, remaining sessions, current level, and exam scores
- **Contact Form** - Send messages to administrators

### Admin Features
- **Session Management** - Full CRUD operations for managing sessions (create, edit, delete, publish/unpublish)
- **Student Management** - Add, edit, and remove students from the system
- **Progress Management** - Update student progress data including exam scores
- **Message Inbox** - View all messages submitted by students

### Technical Features
- **PWA Support** - Installable on mobile devices and desktop
- **Responsive Design** - Works seamlessly on all screen sizes
- **Secure Authentication** - Student code-based authentication with Row Level Security
- **Real-time Data** - Powered by Supabase for instant updates
- **Modern UI** - Built with shadcn/ui components and Tailwind CSS

## Tech Stack

- **Framework:** Next.js 13 with App Router
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI)
- **Charts:** Recharts
- **Date Handling:** date-fns
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd digital-math-sat
```

2. Install dependencies:
```bash
npm install
```

3. Environment variables are already configured in `.env`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. The database schema is already set up with the following tables:
   - `students` - Student information and credentials
   - `sessions` - Math session details
   - `progress` - Student progress tracking
   - `messages` - Contact form submissions

5. Sample data has been preloaded with:
   - 5 students (including 1 admin)
   - 3 upcoming sessions
   - 3 progress records with exam scores

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

Build the application:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Login Credentials

### Admin Account
- **Student Code:** `ADMIN001`
- **Name:** John Admin

### Student Accounts
- **Student Code:** `STU001` - Emily Johnson
- **Student Code:** `STU002` - Michael Chen
- **Student Code:** `STU003` - Sarah Williams
- **Student Code:** `STU004` - David Martinez

## Database Schema

### Students Table
- `id` - UUID primary key
- `student_code` - Unique login code
- `full_name` - Student's full name
- `grade` - Grade level
- `age` - Student age
- `email` - Optional email address
- `is_admin` - Admin privileges flag
- `created_at` - Timestamp

### Sessions Table
- `id` - UUID primary key
- `title` - Session title
- `date_time` - Session date and time
- `description` - Session description
- `recorded_url` - Link to recording
- `materials_url` - Link to materials
- `is_published` - Publication status
- `created_at` - Timestamp

### Progress Table
- `id` - UUID primary key
- `student_id` - Foreign key to students
- `sessions_completed` - Number of completed sessions
- `sessions_remaining` - Number of remaining sessions
- `level` - Current skill level
- `exam_scores` - JSON array of exam scores with dates
- `updated_at` - Timestamp

### Messages Table
- `id` - UUID primary key
- `name` - Sender name
- `email` - Optional email
- `message` - Message content
- `timestamp` - Submission time
- `student_id` - Optional foreign key to students

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

- **Students:** Can read their own data; admins can read/write all
- **Sessions:** Anyone can read published sessions; admins have full control
- **Progress:** Students can read their own progress; admins have full control
- **Messages:** Anyone can insert; only admins can read

## PWA Configuration

The app includes:
- `manifest.json` for PWA installation
- Service worker (`sw.js`) for offline support
- Installable on mobile devices and desktop
- Custom app icons and splash screens

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── admin/             # Admin pages
│   ├── contact/           # Contact form
│   ├── dashboard/         # Student dashboard
│   ├── login/             # Login page
│   ├── materials/         # Materials page
│   ├── progress/          # Progress tracking
│   └── recorded-sessions/ # Recorded sessions
├── components/            # React components
│   ├── ui/               # UI components (shadcn/ui)
│   ├── DashboardLayout.tsx
│   └── Sidebar.tsx
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication context
├── lib/                  # Utility functions
│   ├── supabase.ts       # Supabase client
│   ├── utils.ts          # Utility functions
│   └── registerSW.ts     # Service worker registration
└── public/               # Static assets
    ├── manifest.json     # PWA manifest
    ├── sw.js            # Service worker
    └── logo.png         # App logo (placeholder)
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Environment variables are automatically configured
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Digital Ocean
- Self-hosted

## Converting to Mobile App

The PWA can be converted to a native mobile app using:

### PWABuilder
1. Visit [PWABuilder.com](https://www.pwabuilder.com)
2. Enter your deployed app URL
3. Generate Android APK or iOS app

### Capacitor
1. Install Capacitor:
```bash
npm install @capacitor/core @capacitor/cli
npx cap init
```

2. Add platforms:
```bash
npx cap add android
npx cap add ios
```

3. Build and sync:
```bash
npm run build
npx cap sync
```

## Customization

### Logo
Replace `/public/logo.png` with your own logo (recommended size: 512x512px)

### Theme
Modify colors in `tailwind.config.ts` and `app/globals.css`

### Session URLs
Update the placeholder URLs in the sessions table with actual recording and material links

## Support

For issues or questions, please use the Contact form in the application or reach out to the administrator.

## License

This project is licensed under the MIT License.
