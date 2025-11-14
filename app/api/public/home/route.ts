import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pages, files } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET() {
  try {
    // Get the home page
    const homePage = await db.query.pages.findFirst({
      where: and(
        eq(pages.pageType, 'home'),
        eq(pages.published, true)
      ),
      with: {
        featuredImage: true,
      },
    });

    if (!homePage) {
      return NextResponse.json({ error: 'Home page not found' }, { status: 404 });
    }

    // Get menu pages if showInMenu is enabled
    let menuPages: any[] = [];
    if (homePage.showInMenu) {
      menuPages = await db.query.pages.findMany({
        where: and(
          eq(pages.published, true),
          eq(pages.pageType, 'standard')
        ),
        columns: {
          id: true,
          title: true,
          slug: true,
          menuOrder: true,
        },
        orderBy: (pages, { asc }) => [asc(pages.menuOrder)],
      });
    }

    // Get all categories with their featured images
    const allCategories = await db.query.categories.findMany({
      orderBy: (categories, { asc }) => [asc(categories.name)],
    });

    // Get files for each category
    const categoriesWithImages = await Promise.all(
      allCategories.map(async (category) => {
        const categoryFiles = await db.query.files.findMany({
          where: eq(files.categoryId, category.id),
          limit: 1,
          orderBy: (files, { desc }) => [desc(files.createdAt)],
        });

        return {
          ...category,
          image: categoryFiles[0] || null,
        };
      })
    );

    return NextResponse.json({
      page: homePage,
      menuPages,
      categories: categoriesWithImages,
    });
  } catch (error) {
    console.error('Error fetching home page:', error);
    return NextResponse.json(
      { error: 'Failed to fetch home page' },
      { status: 500 }
    );
  }
}
