'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: {
    url: string;
    name: string;
  } | null;
  createdAt: string;
}

export default function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/public/blog?limit=3');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/blog/${post.slug}`}
          className="group"
        >
          {/* Featured Image */}
          {post.featuredImage && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg mb-4">
              <Image
                src={post.featuredImage.url}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          )}

          {/* Post Info */}
          <div>
            <h3 className="text-lg font-light text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
              {post.title}
            </h3>
            {post.excerpt && (
              <p className="text-sm text-gray-600 font-light line-clamp-2">
                {post.excerpt}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
