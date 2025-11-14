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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Page not found
          </h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="inline-block mb-8 text-blue-600 hover:text-blue-800"
        >
          ← Back to Home
        </Link>

        {page.featuredImage && (
          <div className="relative h-96 w-full mb-8 rounded-lg overflow-hidden">
            <Image
              src={page.featuredImage.url}
              alt={page.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">{page.title}</h1>
        </header>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="prose prose-lg max-w-none">
            {page.content ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: page.content.replace(/\n/g, '<br />'),
                }}
              />
            ) : (
              <p className="text-gray-600">No content available.</p>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
