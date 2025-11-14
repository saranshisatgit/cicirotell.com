# Quick Start Guide

Get your Cicirotell CMS up and running in minutes!

## Prerequisites

- Node.js 18+ installed
- A Neon DB account (free tier available)
- A Cloudflare account with R2 enabled

## Step 1: Environment Setup

Create a `.env.local` file in the root directory:

```env
# Neon Database
DATABASE_URL=postgresql://user:password@host/database

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-this-with-command-below

# Cloudflare R2
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=your-bucket-name
R2_PUBLIC_URL=https://your-bucket.r2.dev
```

### Generate NEXTAUTH_SECRET

Run this command in your terminal:

```bash
openssl rand -base64 32
```

Copy the output and paste it as your `NEXTAUTH_SECRET`.

## Step 2: Get Neon Database URL

1. Go to [neon.tech](https://neon.tech) and sign up/login
2. Create a new project
3. Copy the connection string from the dashboard
4. Paste it as your `DATABASE_URL` in `.env.local`

## Step 3: Set Up Cloudflare R2

1. Go to your Cloudflare dashboard
2. Navigate to R2 Object Storage
3. Create a new bucket (e.g., "cicirotell-files")
4. Go to "Manage R2 API Tokens"
5. Create a new API token with "Object Read & Write" permissions
6. Copy the following values to `.env.local`:
   - Account ID → `R2_ACCOUNT_ID`
   - Access Key ID → `R2_ACCESS_KEY_ID`
   - Secret Access Key → `R2_SECRET_ACCESS_KEY`
   - Bucket name → `R2_BUCKET_NAME`

### Enable Public Access (Optional)

To make uploaded files publicly accessible:

1. Go to your bucket settings
2. Enable "Public Access"
3. Copy the public URL → `R2_PUBLIC_URL`

Or use a custom domain for your R2 bucket.

## Step 4: Initialize Database

Push the database schema to Neon:

```bash
npm run db:push
```

This will create all the necessary tables in your database.

## Step 5: Create Admin User

### Option A: Using the Script (Recommended)

Generate a password hash:

```bash
node scripts/hash-password.js your-password
```

This will output SQL that you can copy and run in your Neon SQL editor.

### Option B: Manual SQL

Go to your Neon dashboard → SQL Editor and run:

```sql
INSERT INTO users (email, password, name, role)
VALUES (
  'admin@example.com',
  '$2a$10$YourHashedPasswordHere',  -- Replace with hash from script
  'Admin User',
  'admin'
);
```

## Step 6: Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Step 7: Login to Admin Panel

1. Go to http://localhost:3000/admin/login
2. Enter your admin email and password
3. You're in! 🎉

## What's Next?

### Create Your First Content

1. **Categories**: Create categories to organize your files
   - Go to Admin → Categories
   - Click "Add Category"
   - Example: "Images", "Documents", "Videos"

2. **Upload Files**: Upload images and files to Cloudflare R2
   - Go to Admin → Files
   - Select a file and category
   - Click "Upload File"
   - Files are stored in R2 with unique keys

3. **Create a Page**: Build a static page
   - Go to Admin → Pages
   - Click "Add Page"
   - Add title, slug, content
   - Assign a featured image
   - Publish when ready

4. **Write a Blog Post**: Create your first article
   - Go to Admin → Blog
   - Click "Add Post"
   - Add title, slug, excerpt, content
   - Assign a featured image
   - Publish when ready

### View Your Content

- **Homepage**: http://localhost:3000
- **Blog List**: http://localhost:3000/blog
- **Blog Post**: http://localhost:3000/blog/your-slug
- **Custom Page**: http://localhost:3000/pages/your-slug

## Common Issues

### Database Connection Failed

- Check your `DATABASE_URL` is correct
- Verify your IP is allowed in Neon settings
- Make sure the database exists

### R2 Upload Failed

- Verify all R2 credentials are correct
- Check bucket permissions
- Ensure the bucket exists

### Login Not Working

- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies and try again
- Verify the user exists in the database

### Images Not Displaying

- Check `R2_PUBLIC_URL` is correct
- Verify public access is enabled on your bucket
- Check the file URL in the database

## Production Deployment

When deploying to production:

1. Update `NEXTAUTH_URL` to your production domain
2. Use environment variables in your hosting platform
3. Enable HTTPS (required for NextAuth)
4. Set up a custom domain for R2 (optional)
5. Run `npm run build` to build for production

## Database Management

### View Database

Open Drizzle Studio to view/edit data:

```bash
npm run db:studio
```

### Generate Migrations

If you modify the schema:

```bash
npm run db:generate
```

### Apply Migrations

```bash
npm run db:migrate
```

## Need Help?

- Check `SETUP.md` for detailed documentation
- Review the code in `lib/`, `app/api/`, and `app/admin/`
- All API routes are in `app/api/`
- Admin UI is in `app/admin/dashboard/`

## Features Overview

✅ **Authentication**: Secure admin login with NextAuth.js  
✅ **File Management**: Upload to Cloudflare R2 with pre-signed URLs  
✅ **Categories**: Organize files into categories  
✅ **Pages**: Create static pages with featured images  
✅ **Blog**: Write and publish blog posts  
✅ **Public API**: Fetch published content for frontend  
✅ **Responsive UI**: Mobile-friendly admin panel  
✅ **TypeScript**: Full type safety  

Happy building! 🚀
