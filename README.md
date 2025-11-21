# ThermoGain

A modern React application for intelligent thermal management, built with Next.js 16, TypeScript, Shadcn/ui, Prisma, and NextAuth.js.

## Tech Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Language**: TypeScript
- **UI**: Shadcn/ui + Tailwind CSS v4
- **Database**: Neon PostgreSQL (serverless)
- **Authentication**: NextAuth.js v5
- **ORM**: Prisma
- **Deployment**: Vercel

## Getting Started

### 1. Clone and install dependencies

```bash
npm install
```

### 2. Setup Neon Database

1. Create a database on [Neon](https://console.neon.tech)
2. Copy your connection string
3. Update the `.env` file with your database credentials:

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:password@host/dbname?sslmode=require"
```

### 3. Generate NextAuth secret

```bash
openssl rand -base64 32
```

Add it to your `.env` file:

```env
NEXTAUTH_SECRET="your-generated-secret"
```

### 4. Run database migrations

```bash
npx prisma db push
```

### 5. Seed the database with a test user

```bash
npm run db:seed
```

This will create a test user:
- **Email**: `admin@thermogain.com`
- **Password**: `admin123`

⚠️ Change the password after first login!

### 6. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
thermogain/
├── app/                        # Next.js 16 App Router
│   ├── (auth)/                # Auth route group
│   │   ├── login/             # Login page
│   │   └── layout.tsx         # Auth layout
│   ├── (main)/                # Protected routes group
│   │   ├── page.tsx           # Dashboard/Home
│   │   └── layout.tsx         # Main layout with nav
│   ├── api/auth/              # NextAuth API routes
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles
├── components/                 # React components
│   └── ui/                    # Shadcn/ui components
├── lib/                        # Utilities and configurations
│   ├── auth.ts                # NextAuth configuration
│   ├── prisma.ts              # Prisma client
│   └── utils.ts               # Utility functions
├── prisma/
│   └── schema.prisma          # Database schema
└── .env                       # Environment variables
```

### Route Groups Explained

Next.js 16 uses **route groups** (folders in parentheses) to organize routes without affecting the URL:

- `(auth)` - Contains authentication-related pages with custom styling
- `(main)` - Contains protected pages with authentication check and navigation

This structure provides:
- Better code organization
- Shared layouts per group
- Cleaner URL structure (parentheses don't appear in URLs)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:seed` - Seed database with test user
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema changes to database

## Authentication

The app uses NextAuth.js v5 with:
- Credentials provider (email/password)
- Prisma adapter for database sessions
- JWT strategy

### Default Test User

After running `npm run db:seed`, you can login with:
- **Email**: admin@thermogain.com
- **Password**: admin123

## Deploy on Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL` - Your Neon pooled connection string
   - `DIRECT_URL` - Your Neon direct connection string
   - `NEXTAUTH_SECRET` - Generated secret (use `openssl rand -base64 32`)
   - `NEXTAUTH_URL` - Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
4. Deploy

Vercel will automatically:
- Detect Next.js and configure the build
- Run `prisma generate` via postinstall script
- Build with Turbopack

After deployment, run the seed script to create a test user:
```bash
# In Vercel console or locally with production DATABASE_URL
npm run db:seed
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Shadcn/ui Documentation](https://ui.shadcn.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://authjs.dev)
- [Neon Documentation](https://neon.tech/docs)
