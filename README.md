# Thermogain

A modern React application built with Next.js 15, TypeScript, Shadcn/ui, Prisma, and NextAuth.js.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI**: Shadcn/ui + Tailwind CSS
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
npx prisma generate
npx prisma db push
```

### 5. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
thermogain/
├── app/                    # Next.js App Router pages
│   ├── api/auth/          # NextAuth API routes
│   ├── login/             # Login page
│   └── page.tsx           # Home page
├── components/            # React components
│   └── ui/               # Shadcn/ui components
├── lib/                   # Utilities and configurations
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Utility functions
├── prisma/
│   └── schema.prisma     # Database schema
└── .env                  # Environment variables
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema changes to database

## Authentication

The app uses NextAuth.js v5 with:
- Credentials provider (email/password)
- Prisma adapter for database sessions
- JWT strategy

To create a test user, you'll need to hash a password and insert it directly into the database or create a registration page.

## Deploy on Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

Vercel will automatically detect Next.js and configure the build.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Shadcn/ui Documentation](https://ui.shadcn.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://authjs.dev)
- [Neon Documentation](https://neon.tech/docs)
