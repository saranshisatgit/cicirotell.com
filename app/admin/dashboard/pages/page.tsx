'use client';

import { useState, useEffect } from 'react';

interface File {
  id: string;
  name: string;
  url: string;
}

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  published: boolean;
  featuredImage: File | null;
}

export default function PagesManagement() {
  const [pages, setPages] = useState<Page[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    pageType: 'standard',
    featuredImageId: '',
    showInMenu: false,
    menuOrder: '0',
    published: false,
  });

  useEffect(() => {
    fetchPages();
    fetchFiles();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await fetch('/api/admin/pages');
      const data = await res.json();
      setPages(data);
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/admin/files');
      const data = await res.json();
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = '/api/admin/pages';
      const method = editingPage ? 'PUT' : 'POST';
      
      // Auto-generate slug if empty
      const dataToSubmit = {
        ...formData,
        slug: formData.slug.trim() || generateSlug(formData.title),
      };
      
      const body = editingPage
        ? { ...dataToSubmit, id: editingPage.id }
        : dataToSubmit;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        resetForm();
        fetchPages();
      }
    } catch (error) {
      console.error('Error saving page:', error);
    }
  };

  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content || '',
      pageType: 'standard',
      featuredImageId: page.featuredImage?.id || '',
      showInMenu: false,
      menuOrder: '0',
      published: page.published,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      await fetch(`/api/admin/pages?id=${id}`, { method: 'DELETE' });
      fetchPages();
    } catch (error) {
      console.error('Error deleting page:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      pageType: 'standard',
      featuredImageId: '',
      showInMenu: false,
      menuOrder: '0',
      published: false,
    });
    setEditingPage(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Pages</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
        >
          {showForm ? 'Cancel' : 'Add Page'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingPage ? 'Edit Page' : 'Create Page'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Slug</label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="Leave blank to auto-generate from title"
              />
              <p className="mt-1 text-xs text-gray-500">URL-friendly version of the title</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Page Type</label>
              <select
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.pageType}
                onChange={(e) => setFormData({ ...formData, pageType: e.target.value })}
              >
                <option value="standard">Standard Page</option>
                <option value="home">Home Page</option>
              </select>
            </div>
            {formData.pageType === 'home' && (
              <div className="bg-gray-50 p-4 rounded-md space-y-3">
                <p className="text-xs font-medium text-gray-700">Home Page Settings</p>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showInMenu"
                    className="h-4 w-4 border-gray-300 rounded"
                    checked={formData.showInMenu}
                    onChange={(e) => setFormData({ ...formData, showInMenu: e.target.checked })}
                  />
                  <label htmlFor="showInMenu" className="ml-2 block text-xs text-gray-900">
                    Show other pages in menu bar (hovering on hero image)
                  </label>
                </div>
                {formData.showInMenu && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Menu Order</label>
                    <input
                      type="text"
                      className="block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                      value={formData.menuOrder}
                      onChange={(e) => setFormData({ ...formData, menuOrder: e.target.value })}
                      placeholder="0"
                    />
                    <p className="mt-1 text-xs text-gray-500">Lower numbers appear first</p>
                  </div>
                )}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Content</label>
              <textarea
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={6}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Featured Image</label>
              <select
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.featuredImageId}
                onChange={(e) => setFormData({ ...formData, featuredImageId: e.target.value })}
              >
                <option value="">No Image</option>
                {files.map((file) => (
                  <option key={file.id} value={file.id}>
                    {file.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="published"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              />
              <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
                Published
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
              >
                {editingPage ? 'Update Page' : 'Create Page'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pages.map((page) => (
              <tr key={page.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {page.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {page.slug}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      page.published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {page.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(page)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(page.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
