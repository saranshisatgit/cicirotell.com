'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import BlogList from '@/components/BlogList';

interface MenuItem {
  id: string;
  title: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: {
    id: string;
    url: string;
    name: string;
  } | null;
}

interface HomeData {
  page: {
    title: string;
    content: string | null;
    featuredImage: {
      url: string;
      name: string;
    } | null;
    showInMenu: boolean;
  };
  menuPages: MenuItem[];
  categories: Category[];
}

export default function Home() {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const res = await fetch('/api/public/home');
      if (res.ok) {
        const data = await res.json();
        setHomeData(data);
      }
    } catch (error) {
      console.error('Error fetching home page:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-sm text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!homeData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-gray-900 mb-2">Welcome</h1>
          <p className="text-sm text-gray-500">No home page configured</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Menu Bar */}
      {(homeData.menuPages.length > 0 || true) && (
        <div className="border-b border-gray-100 dark:border-gray-800">
          <nav className="container mx-auto px-6 py-6">
            <div className="flex justify-center gap-8">
              {homeData.menuPages.map((page) => (
                <Link
                  key={page.id}
                  href={`/pages/${page.slug}`}
                  className="text-gray-600 dark:text-gray-400 text-xs font-light tracking-widest uppercase hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                >
                  {page.title}
                </Link>
              ))}
              {/* Contact Link */}
              <Link
                href="/contact"
                className="text-gray-600 dark:text-gray-400 text-xs font-light tracking-widest uppercase hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              >
                Contact
              </Link>
            </div>
          </nav>
        </div>
      )}

      {/* Hero Section with Rounded Image */}
      {homeData.page.featuredImage && (
        <div className="container mx-auto px-6 pt-12 pb-16">
          <div className="relative w-full h-[85vh] rounded-2xl overflow-hidden shadow-xl">
            <Image
              src={homeData.page.featuredImage.url}
              alt={homeData.page.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            
            {/* Content Text Overlay - Bottom Left */}
            {homeData.page.content && (
              <div className="absolute bottom-0 left-0 p-8 md:p-12">
                <div className="max-w-2xl">
                  <p className="text-white text-sm md:text-base font-light leading-relaxed tracking-wide drop-shadow-lg">
                    {homeData.page.content}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Categories Grid */}
      {homeData.categories.length > 0 && (
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
            {homeData.categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group relative aspect-square overflow-hidden"
              >
                {category.image ? (
                  <Image
                    src={category.image.url}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100" />
                )}
                
                {/* Category Name Overlay */}
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                  <span className="text-white text-sm font-light tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {category.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Blog Section */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-2xl font-light text-gray-800 dark:text-gray-200 tracking-wide mb-8 text-center">
          Latest Stories
        </h2>
        <BlogList />
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500 tracking-wide">
            © {new Date().getFullYear()} Copyright Cici Rotell
          </p>
        </div>
      </footer>
    </div>
  );
}
