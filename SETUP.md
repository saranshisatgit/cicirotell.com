# Cicirotell - Setup Guide

A simple Next.js app with Neon DB, Cloudflare R2, and admin panel for managing content.

## Features

- ✅ **Authentication**: Secure admin login using NextAuth.js with Neon DB
- ✅ **Categories**: Organize files into categories
- ✅ **File Management**: Upload large files directly to Cloudflare R2 using pre-signed URLs
- ✅ **Pages**: Create and manage static pages with featured images
- ✅ **Blog**: Write and publish blog posts
- ✅ **Admin Panel**: Simple, clean interface for content management

## Prerequisites

- Node.js 18+ installed
- Neon DB account (https://neon.tech)
- Cloudflare R2 account (https://cloudflare.com/r2)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Neon Database

1. Create a new project on [Neon](https://neon.tech)
2. Copy your connection string
3. Create `.env.local` file in the root directory

### 3. Configure Environment Variables

Create `.env.local` file:

```env
# Neon Database
DATABASE_URL=postgresql://user:password@host/database

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32

# Cloudflare R2
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=your-bucket-name
R2_PUBLIC_URL=https://your-bucket.r2.dev
```

**To generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Set Up Cloudflare R2

1. Go to Cloudflare Dashboard → R2
2. Create a new bucket
3. Go to "Manage R2 API Tokens"
4. Create a new API token with read & write permissions
5. Copy the Account ID, Access Key ID, and Secret Access Key
6. Enable public access for your bucket (optional, for public file URLs)

### 5. Initialize Database

Push the schema to your Neon database:

```bash
npm run db:push
```

### 6. Create Admin User

You'll need to manually create the first admin user in your database. Run this SQL in your Neon console:

```sql
INSERT INTO users (email, password, name, role)
VALUES (
  'admin@example.com',
  -- Password: 'admin123' (hashed with bcrypt)
  '$2a$10$YourHashedPasswordHere',
  'Admin User',
  'admin'
);
```

**To generate a bcrypt hash for your password:**

```javascript
// Run this in Node.js REPL or create a script
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('your-password', 10);
console.log(hash);
```

Or use an online bcrypt generator (use cost factor 10).

### 7. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000/admin/login to access the admin panel.

## Database Scripts

- `npm run db:generate` - Generate migration files
- `npm run db:migrate` - Run migrations
- `npm run db:push` - Push schema directly to database (development)
- `npm run db:studio` - Open Drizzle Studio to view/edit data

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/    # NextAuth API routes
│   │   ├── admin/                 # Admin API routes
│   │   │   ├── categories/
│   │   │   ├── files/
│   │   │   ├── pages/
│   │   │   └── blog/
│   │   └── upload/                # File upload endpoints
│   ├── admin/
│   │   ├── login/                 # Admin login page
│   │   └── dashboard/             # Admin dashboard
│   │       ├── categories/
│   │       ├── files/
│   │       ├── pages/
│   │       └── blog/
│   └── (frontend pages - to be created)
├── lib/
│   ├── db/
│   │   ├── schema.ts              # Database schema
│   │   └── index.ts               # Database connection
│   ├── auth.ts                    # NextAuth configuration
│   └── r2.ts                      # Cloudflare R2 utilities
└── types/
    └── next-auth.d.ts             # TypeScript types for NextAuth
```

## Usage

### Admin Panel

1. **Login**: Navigate to `/admin/login`
2. **Categories**: Create categories to organize files
3. **Files**: Upload files to Cloudflare R2 (supports large files via pre-signed URLs)
4. **Pages**: Create static pages with featured images
5. **Blog**: Write and publish blog posts

### File Upload Flow

The app uses Cloudflare R2 pre-signed URLs for secure, direct uploads:

1. Client requests a pre-signed URL from `/api/upload/presigned-url`
2. Server generates a unique key and returns a pre-signed URL
3. Client uploads the file directly to R2 using the pre-signed URL
4. Client saves the file metadata to the database via `/api/admin/files`

This approach allows uploading large files without hitting Next.js size limits.

## Next Steps

1. Create frontend pages to display content
2. Add a homepage that uses featured images from pages
3. Create blog listing and detail pages
4. Add rich text editor for content
5. Implement image optimization
6. Add SEO metadata

## Security Notes

- Always use HTTPS in production
- Keep your `.env.local` file secure and never commit it
- Use strong passwords for admin accounts
- Enable CORS restrictions on your R2 bucket
- Regularly update dependencies

## Troubleshooting

**Database connection issues:**
- Verify your DATABASE_URL is correct
- Check if your IP is allowed in Neon's connection settings

**R2 upload failures:**
- Verify R2 credentials are correct
- Check bucket permissions
- Ensure CORS is configured if uploading from browser

**Authentication issues:**
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Clear browser cookies and try again

## Support

For issues or questions, please check:
- [Next.js Documentation](https://nextjs.org/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
