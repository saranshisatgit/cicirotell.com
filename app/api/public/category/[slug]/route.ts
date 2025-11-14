import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { categories, files } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get category by slug
    const category = await db.query.categories.findFirst({
      where: eq(categories.slug, slug),
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Get all files in this category
    const categoryFiles = await db.query.files.findMany({
      where: eq(files.categoryId, category.id),
      orderBy: (files, { desc }) => [desc(files.createdAt)],
    });

    return NextResponse.json({
      category,
      files: categoryFiles,
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}
