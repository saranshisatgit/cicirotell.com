import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { blogPosts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (slug) {
      // Get single blog post by slug
      const post = await db.query.blogPosts.findFirst({
        where: eq(blogPosts.slug, slug),
        with: {
          featuredImage: true,
          author: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!post || !post.published) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }

      return NextResponse.json(post);
    }

    // Get all published blog posts
    const allPosts = await db.query.blogPosts.findMany({
      where: eq(blogPosts.published, true),
      orderBy: (blogPosts, { desc }) => [desc(blogPosts.publishedAt)],
      with: {
        featuredImage: true,
        author: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(allPosts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}
