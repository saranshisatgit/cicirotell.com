'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface FeaturedImage {
  id: string;
  name: string;
  url: string;
}

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  featuredImage: FeaturedImage | null;
}

export default function CustomPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchPage = async () => {
    try {
      const res = await fetch(`/api/public/pages?slug=${slug}`);
      if (!res.ok) {
        setError(true);
        return;
      }
      const data = await res.json();
      setPage(data);
    } catch (err) {
      console.error('Error fetching page:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-sm text-gray-400 dark:text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-gray-800 dark:text-gray-200 mb-2">
            Page not found
          </h1>
          <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header with Back Link */}
      <div className="border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 py-8">
          <Link
            href="/"
            className="inline-block text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 tracking-wider uppercase mb-4 transition-colors"
          >
            ← Back
          </Link>
          <h1 className="text-3xl md:text-4xl font-light text-gray-800 dark:text-gray-200 tracking-wide">
            {page.title}
          </h1>
        </div>
      </div>

      {/* Featured Image */}
      {page.featuredImage && (
        <div className="container mx-auto px-6 py-12">
          <div className="relative h-[60vh] w-full rounded-lg overflow-hidden shadow-lg">
            <Image
              src={page.featuredImage.url}
              alt={page.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* Content */}
      <article className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-lg prose-zinc dark:prose-invert max-w-none">
            {page.content ? (
              <div
                className="text-gray-700 dark:text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: page.content.replace(/\n/g, '<br />'),
                }}
              />
            ) : (
              <p className="text-gray-500 dark:text-gray-400 font-light">No content available.</p>
            )}
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8 mt-16">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500 tracking-wide">
            © {new Date().getFullYear()} Copyright Cici Rotell
          </p>
        </div>
      </footer>
    </div>
  );
}
