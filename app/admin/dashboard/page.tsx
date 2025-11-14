'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Stats {
  categories: number;
  files: number;
  blogs: number;
}

interface RecentFile {
  id: string;
  name: string;
  url: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ categories: 0, files: 0, blogs: 0 });
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const [categoriesRes, filesRes, blogsRes] = await Promise.all([
        fetch('/api/admin/categories'),
        fetch('/api/admin/files'),
        fetch('/api/admin/blog'),
      ]);

      const categories = await categoriesRes.json();
      const files = await filesRes.json();
      const blogs = await blogsRes.json();

      setStats({
        categories: categories.length,
        files: files.length,
        blogs: blogs.length,
      });

      // Get recent 3 files
      setRecentFiles(files.slice(0, 3));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="px-4 sm:px-0 text-sm text-gray-500">Loading...</div>;
  }

  return (
    <div className="px-4 sm:px-0">
      <h2 className="text-2xl font-light text-gray-900 mb-6">Overview</h2>
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg p-6">
          <div className="text-sm font-light text-gray-500">Categories</div>
          <div className="mt-2 text-3xl font-light text-gray-900">{stats.categories}</div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg p-6">
          <div className="text-sm font-light text-gray-500">Total Files</div>
          <div className="mt-2 text-3xl font-light text-gray-900">{stats.files}</div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg p-6">
          <div className="text-sm font-light text-gray-500">Blog Posts</div>
          <div className="mt-2 text-3xl font-light text-gray-900">{stats.blogs}</div>
        </div>
      </div>

      {/* Recent Files */}
      {recentFiles.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-light text-gray-900">Recent Files</h3>
            <Link href="/admin/dashboard/files" className="text-sm text-gray-600 hover:text-gray-900">
              See more →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {recentFiles.map((file) => (
              <div key={file.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={file.url}
                  alt={file.name}
                  fill
                  sizes="(max-width: 768px) 33vw, 200px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
