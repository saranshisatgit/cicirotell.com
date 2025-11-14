import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (slug) {
      // Get single page by slug
      const page = await db.query.pages.findFirst({
        where: eq(pages.slug, slug),
        with: {
          featuredImage: true,
        },
      });

      if (!page || !page.published) {
        return NextResponse.json({ error: 'Page not found' }, { status: 404 });
      }

      return NextResponse.json(page);
    }

    // Get all published pages
    const allPages = await db.query.pages.findMany({
      where: eq(pages.published, true),
      orderBy: (pages, { desc }) => [desc(pages.createdAt)],
      with: {
        featuredImage: true,
      },
    });

    return NextResponse.json(allPages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}
