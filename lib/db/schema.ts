import { pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table for authentication
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name'),
  role: text('role').notNull().default('admin'), // admin role
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Categories table
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Files table for Cloudflare R2 uploads
export const files = pgTable('files', {
  id: uuid('id').defaultRandom().primaryKey(),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  url: text('url').notNull(), // R2 URL
  key: text('key').notNull(), // R2 object key
  size: text('size'), // File size in bytes
  mimeType: text('mime_type'),
  uploadedBy: uuid('uploaded_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Pages table
export const pages = pgTable('pages', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content'),
  pageType: text('page_type').default('standard').notNull(), // 'standard' or 'home'
  featuredImageId: uuid('featured_image_id').references(() => files.id),
  showInMenu: boolean('show_in_menu').default(false).notNull(),
  menuOrder: text('menu_order').default('0'),
  published: boolean('published').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Blog posts table
export const blogPosts = pgTable('blog_posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content'),
  featuredImageId: uuid('featured_image_id').references(() => files.id),
  published: boolean('published').default(false).notNull(),
  publishedAt: timestamp('published_at'),
  authorId: uuid('author_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  files: many(files),
}));

export const filesRelations = relations(files, ({ one }) => ({
  category: one(categories, {
    fields: [files.categoryId],
    references: [categories.id],
  }),
  uploadedByUser: one(users, {
    fields: [files.uploadedBy],
    references: [users.id],
  }),
}));

export const pagesRelations = relations(pages, ({ one }) => ({
  featuredImage: one(files, {
    fields: [pages.featuredImageId],
    references: [files.id],
  }),
}));

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  featuredImage: one(files, {
    fields: [blogPosts.featuredImageId],
    references: [files.id],
  }),
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  uploadedFiles: many(files),
  blogPosts: many(blogPosts),
}));
