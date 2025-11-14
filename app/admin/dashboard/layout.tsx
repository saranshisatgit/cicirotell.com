'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-12">
            <div className="flex">
              <div className="shrink-0 flex items-center">
                <h1 className="text-sm font-medium">Admin</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-6">
                <Link
                  href="/admin/dashboard"
                  className="border-transparent text-gray-600 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-xs font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/dashboard/categories"
                  className="border-transparent text-gray-600 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-xs font-medium transition-colors"
                >
                  Categories
                </Link>
                <Link
                  href="/admin/dashboard/files"
                  className="border-transparent text-gray-600 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-xs font-medium transition-colors"
                >
                  Files
                </Link>
                <Link
                  href="/admin/dashboard/pages"
                  className="border-transparent text-gray-600 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-xs font-medium transition-colors"
                >
                  Pages
                </Link>
                <Link
                  href="/admin/dashboard/blog"
                  className="border-transparent text-gray-600 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-xs font-medium transition-colors"
                >
                  Blog
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-600">{session.user?.email}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/admin/login' })}
                className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
