'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Dialog, DialogPanel, DialogBackdrop } from '@headlessui/react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

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
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

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
      console.log('File URLs:', data.files?.map((f: { url: string }) => f.url));
      setCategoryData(data);
    } catch (err) {
      console.error('Error fetching category:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const openImage = (index: number) => {
    setSelectedImageIndex(index);
    if (categoryData?.files[index]) {
      const img = document.createElement('img');
      img.onload = () => {
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = categoryData.files[index].url;
    }
  };

  const closeImage = () => {
    setSelectedImageIndex(null);
    setImageDimensions(null);
  };

  const goToPrevious = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      openImage(selectedImageIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedImageIndex !== null && categoryData && selectedImageIndex < categoryData.files.length - 1) {
      openImage(selectedImageIndex + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-sm text-gray-400 dark:text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !categoryData) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-gray-800 dark:text-gray-200 mb-2">Category not found</h1>
          <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 py-8">
          <Link
            href="/"
            className="inline-block text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 tracking-wider uppercase mb-4 transition-colors"
          >
            ← Back
          </Link>
          <h1 className="text-3xl md:text-4xl font-light text-gray-800 dark:text-gray-200 tracking-wide">
            {categoryData.category.description || categoryData.category.name}
          </h1>
        </div>
      </div>

      {/* Photos Grid */}
      {categoryData.files.length > 0 ? (
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categoryData.files.map((file, index) => {
              console.log('Rendering image:', file.url, 'Name:', file.name);
              return (
                <div
                  key={file.id}
                  onClick={() => openImage(index)}
                  className="group relative aspect-square overflow-hidden rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
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
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8 mt-16">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500 tracking-wide">
            © {new Date().getFullYear()} Copyright Cici Rotell
          </p>
        </div>
      </footer>

      {/* Image Dialog */}
      {selectedImageIndex !== null && categoryData && (
        <Dialog open={true} onClose={closeImage} className="relative z-50">
          <DialogBackdrop className="fixed inset-0 bg-black/90" />
          
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel className="relative w-full h-full flex items-center justify-center">
              {/* Close Button */}
              <button
                onClick={closeImage}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>

              {/* Previous Button */}
              {selectedImageIndex > 0 && (
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeftIcon className="h-8 w-8 text-white" />
                </button>
              )}

              {/* Next Button */}
              {selectedImageIndex < categoryData.files.length - 1 && (
                <button
                  onClick={goToNext}
                  className="absolute right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRightIcon className="h-8 w-8 text-white" />
                </button>
              )}

              {/* Image Container */}
              <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center">
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={categoryData.files[selectedImageIndex].url}
                    alt={categoryData.files[selectedImageIndex].name}
                    width={imageDimensions?.width || 1200}
                    height={imageDimensions?.height || 800}
                    className="max-w-full max-h-[80vh] object-contain"
                    priority
                  />
                </div>
                
                {/* Image Info */}
                <div className="mt-4 text-center">
                  <p className="text-sm text-white/80">
                    {categoryData.files[selectedImageIndex].name}
                  </p>
                  {imageDimensions && (
                    <p className="text-xs text-white/60 mt-1">
                      Original: {imageDimensions.width} × {imageDimensions.height}px
                      {(imageDimensions.width > 1400 || imageDimensions.height > 900) && (
                        <span className="block mt-1 text-amber-400">
                          ⚠️ Image scaled to fit screen
                        </span>
                      )}
                    </p>
                  )}
                  <p className="text-xs text-white/60 mt-1">
                    {selectedImageIndex + 1} / {categoryData.files.length}
                  </p>
                </div>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </div>
  );
}
