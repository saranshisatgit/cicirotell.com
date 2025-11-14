'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface CategoryFile {
  id: string;
  name: string;
  url: string;
  size: string | null;
  mimeType: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface CategoryData {
  category: Category;
  files: CategoryFile[];
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [categoryData, setCategoryData] = useState<CategoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchCategory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchCategory = async () => {
    try {
      const res = await fetch(`/api/public/category/${slug}`);
      if (!res.ok) {
        setError(true);
        return;
      }
      const data = await res.json();
      console.log('Category data received:', data);
      console.log('Number of files:', data.files?.length);
      console.log('File URLs:', data.files?.map((f: any) => f.url));
      setCategoryData(data);
    } catch (err) {
      console.error('Error fetching category:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-sm text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error || !categoryData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-gray-900 mb-2">Category not found</h1>
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-6 py-8">
          <Link
            href="/"
            className="inline-block text-xs text-gray-600 hover:text-gray-900 tracking-wider uppercase mb-4 transition-colors"
          >
            ← Back
          </Link>
          <h1 className="text-3xl md:text-4xl font-light text-gray-900 tracking-wide">
            {categoryData.category.description || categoryData.category.name}
          </h1>
        </div>
      </div>

      {/* Photos Grid */}
      {categoryData.files.length > 0 ? (
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categoryData.files.map((file) => {
              console.log('Rendering image:', file.url, 'Name:', file.name);
              return (
                <div
                  key={file.id}
                  className="group relative aspect-square overflow-hidden rounded-lg shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <Image
                    src={file.url}
                    alt={file.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    onLoad={() => {
                      console.log('Image loaded successfully:', file.url);
                    }}
                    onError={(e) => {
                      console.error('Image failed to load:', file.url);
                      console.error('Image element:', e.currentTarget);
                    }}
                  />
                  
                  {/* Hover Overlay - only visible on hover */}
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none" />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-6 py-24 text-center">
          <p className="text-sm text-gray-500 font-light">No photos in this category yet</p>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 mt-16">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs text-gray-400 tracking-wide">
            © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
