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

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  createdAt: string;
  featuredImage: FeaturedImage | null;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/public/blog?slug=${slug}`);
      if (!res.ok) {
        setError(true);
        return;
      }
      const data = await res.json();
      setPost(data);
    } catch (err) {
      console.error('Error fetching blog post:', err);
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

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-gray-800 dark:text-gray-200 mb-4">
            Post not found
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
      {/* Header with Back Button */}
      <div className="border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 py-6">
          <Link
            href="/"
            className="inline-block text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 tracking-wider uppercase transition-colors"
          >
            ← Back
          </Link>
        </div>
      </div>

      {/* Article */}
      <article className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Featured Image */}
        {post.featuredImage && (
          <div className="relative h-[60vh] w-full mb-12 rounded-2xl overflow-hidden shadow-xl">
            <Image
              src={post.featuredImage.url}
              alt={post.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-light text-gray-800 dark:text-gray-200 tracking-wide mb-4">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-lg text-gray-600 dark:text-gray-400 font-light mb-6">
              {post.excerpt}
            </p>
          )}
          <div className="text-xs text-gray-400 dark:text-gray-500 tracking-wide">
            {new Date(post.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <div className="text-gray-700 dark:text-gray-300 font-light leading-relaxed space-y-4">
            {post.content ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: post.content.replace(/\n/g, '<br />'),
                }}
              />
            ) : (
              <p>No content available.</p>
            )}
          </div>
        </div>

        {/* Back to Blog Link */}
        <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800">
          <Link
            href="/"
            className="inline-block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 tracking-wider uppercase transition-colors"
          >
            ← More Stories
          </Link>
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
