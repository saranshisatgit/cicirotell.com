import { db } from '../lib/db';
import { pages } from '../lib/db/schema';

async function createDefaultPages() {
  try {
    console.log('Creating default pages...');

    const defaultPages = [
      {
        title: 'Home',
        slug: 'home',
        content: 'Welcome to our photography collection',
        pageType: 'home',
        showInMenu: true,
        menuOrder: '1',
        published: true,
      },
      {
        title: 'Exhibition',
        slug: 'exhibition',
        content: 'Explore our curated exhibitions and collections',
        pageType: 'standard',
        showInMenu: true,
        menuOrder: '2',
        published: true,
      },
      {
        title: 'Contact',
        slug: 'contact',
        content: 'Get in touch with us',
        pageType: 'standard',
        showInMenu: true,
        menuOrder: '3',
        published: true,
      },
    ];

    for (const page of defaultPages) {
      await db.insert(pages).values(page);
      console.log(`✓ Created page: ${page.title}`);
    }

    console.log('\n✅ Default pages created successfully!');
  } catch (error) {
    console.error('Error creating default pages:', error);
  }
}

createDefaultPages();
