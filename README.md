# Cicirotell CMS

A modern, simple content management system built with Next.js 16, Neon DB, and Cloudflare R2.

## ✨ Features

- 🔐 **Secure Authentication** - NextAuth.js with credential-based login
- 📁 **File Management** - Upload large files directly to Cloudflare R2 using pre-signed URLs
- 🗂️ **Categories** - Organize files into categories
- 📄 **Pages** - Create and manage static pages with featured images
- 📝 **Blog** - Write and publish blog posts with rich content
- 🎨 **Clean Admin UI** - Responsive admin panel built with Tailwind CSS
- 🚀 **Fast & Scalable** - Serverless database with Neon, edge storage with R2
- 📱 **Mobile Friendly** - Responsive design for all devices
- 🔒 **Type Safe** - Full TypeScript support

## 🚀 Quick Start

See [QUICKSTART.md](./QUICKSTART.md) for a step-by-step guide to get up and running in minutes.

## 📖 Documentation

- [QUICKSTART.md](./QUICKSTART.md) - Get started quickly
- [SETUP.md](./SETUP.md) - Detailed setup instructions
- [env.example](./env.example) - Environment variables template

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Neon DB (Serverless Postgres)
- **ORM**: Drizzle ORM
- **Authentication**: NextAuth.js
- **Storage**: Cloudflare R2
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## 📦 Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your credentials

# Push database schema
npm run db:push

# Create admin user (see QUICKSTART.md)
node scripts/hash-password.js your-password

# Start development server
npm run dev
```

Visit http://localhost:3000

## 🎯 Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth endpoints
│   │   ├── admin/        # Admin API routes
│   │   ├── public/       # Public API routes
│   │   └── upload/       # File upload endpoints
│   ├── admin/            # Admin panel
│   │   ├── login/        # Login page
│   │   └── dashboard/    # Admin dashboard
│   ├── blog/             # Public blog pages
│   ├── pages/            # Dynamic pages
│   └── page.tsx          # Homepage
├── lib/
│   ├── db/               # Database schema & connection
│   ├── auth.ts           # NextAuth configuration
│   └── r2.ts             # Cloudflare R2 utilities
├── components/           # React components
├── scripts/              # Utility scripts
└── types/                # TypeScript types
```

## 🔑 Key Features Explained

### File Upload with R2

Files are uploaded directly to Cloudflare R2 using pre-signed URLs:
1. Client requests a pre-signed URL from the API
2. Server generates a unique key and returns a pre-signed URL
3. Client uploads the file directly to R2 (bypassing Next.js size limits)
4. Client saves file metadata to the database

This approach supports large files without hitting Next.js limits.

### Authentication

- Secure credential-based authentication with NextAuth.js
- Passwords hashed with bcrypt
- Protected admin routes with session management
- Role-based access control ready

### Database

- Serverless Postgres with Neon DB
- Type-safe queries with Drizzle ORM
- Automatic migrations
- Drizzle Studio for database management

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
```

## 🌐 API Routes

### Public API
- `GET /api/public/blog` - Get all published blog posts
- `GET /api/public/blog?slug=post-slug` - Get single blog post
- `GET /api/public/pages` - Get all published pages
- `GET /api/public/pages?slug=page-slug` - Get single page

### Admin API (Protected)
- `POST /api/upload/presigned-url` - Get R2 upload URL
- `/api/admin/categories` - Category CRUD
- `/api/admin/files` - File management
- `/api/admin/pages` - Pages CRUD
- `/api/admin/blog` - Blog CRUD

## 🚢 Deployment

### Environment Variables

Set these in your hosting platform:

```env
DATABASE_URL=your-neon-connection-string
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-key
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=your-bucket-name
R2_PUBLIC_URL=https://your-bucket.r2.dev
```

### Build & Deploy

```bash
npm run build
npm run start
```

Deploy to Vercel, Netlify, or any Node.js hosting platform.

## 🤝 Contributing

This is a starter template. Feel free to customize and extend it for your needs!

## 📄 License

MIT

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org)
- [Neon](https://neon.tech)
- [Cloudflare R2](https://www.cloudflare.com/products/r2/)
- [Drizzle ORM](https://orm.drizzle.team)
- [NextAuth.js](https://next-auth.js.org)
- [Tailwind CSS](https://tailwindcss.com)
