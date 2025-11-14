'use client';

import { useState, useEffect } from 'react';

interface File {
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
  published: boolean;
  featuredImage: File | null;
}

export default function BlogManagement() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImageId: '',
    published: false,
  });

  useEffect(() => {
    fetchPosts();
    fetchFiles();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/admin/blog');
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
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
      const url = '/api/admin/blog';
      const method = editingPost ? 'PUT' : 'POST';
      
      const dataToSubmit = {
        ...formData,
        slug: formData.slug.trim() || generateSlug(formData.title),
      };
      
      const body = editingPost
        ? { ...dataToSubmit, id: editingPost.id }
        : dataToSubmit;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        resetForm();
        fetchPosts();
      }
    } catch (error) {
      console.error('Error saving blog post:', error);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content || '',
      featuredImageId: post.featuredImage?.id || '',
      published: post.published,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      await fetch(`/api/admin/blog?id=${id}`, { method: 'DELETE' });
      fetchPosts();
    } catch (error) {
      console.error('Error deleting blog post:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featuredImageId: '',
      published: false,
    });
    setEditingPost(null);
    setShowForm(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Get presigned URL
      const presignedRes = await fetch('/api/upload/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      });

      const { url, key } = await presignedRes.json();

      // Upload to R2
      await fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      // Save file metadata
      const fileRes = await fetch('/api/admin/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: file.name,
          key,
          size: file.size.toString(),
          mimeType: file.type,
        }),
      });

      const newFile = await fileRes.json();
      setFormData({ ...formData, featuredImageId: newFile.id });
      fetchFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Blog Posts</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
        >
          {showForm ? 'Cancel' : 'Add Post'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingPost ? 'Edit Post' : 'Create Post'}
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
                placeholder="Leave blank to auto-generate"
              />
              <p className="mt-1 text-xs text-gray-500">URL-friendly version</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Excerpt</label>
              <textarea
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={2}
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content (Markdown supported)</label>
              <textarea
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                rows={12}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your blog post content here. You can use markdown formatting..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Supports: **bold**, *italic*, # headings, - lists, [links](url), ![images](url)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
              <div className="space-y-3">
                <div>
                  <label className="block">
                    <span className="sr-only">Choose file</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-900 file:text-white hover:file:bg-gray-800 file:cursor-pointer disabled:opacity-50"
                    />
                  </label>
                  {uploading && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
                </div>
                <div className="text-xs text-gray-500">Or select from existing:</div>
                <select
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
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
                {editingPost ? 'Update Post' : 'Create Post'}
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
            {posts.map((post) => (
              <tr key={post.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {post.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {post.slug}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      post.published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(post)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
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
