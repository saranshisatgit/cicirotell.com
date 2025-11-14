'use client';

import { useState, useEffect } from 'react';
import { Heading } from '@/components/catalyst/heading';
import { Button } from '@/components/catalyst/button';
import { Input } from '@/components/catalyst/input';
import { Textarea } from '@/components/catalyst/textarea';
import { Select } from '@/components/catalyst/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/catalyst/table';
import { Badge } from '@/components/catalyst/badge';
import { Fieldset, Legend, FieldGroup, Field, Label, Description } from '@/components/catalyst/fieldset';
import { Checkbox, CheckboxField } from '@/components/catalyst/checkbox';
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from '@/components/catalyst/dropdown';
import { EllipsisVerticalIcon } from '@heroicons/react/16/solid';

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
        <Heading>Blog Posts</Heading>
        {!showForm && (
          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            Add Post
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6">
          <Fieldset>
            <Legend>{editingPost ? 'Edit Post' : 'Create Post'}</Legend>
            <FieldGroup>
              <Field>
                <Label>Title</Label>
                <Input
                  name="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </Field>
              <Field>
                <Label>Slug</Label>
                <Input
                  name="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="Leave blank to auto-generate"
                />
                <Description>URL-friendly version</Description>
              </Field>
              <Field>
                <Label>Excerpt</Label>
                <Textarea
                  name="excerpt"
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                />
              </Field>
              <Field>
                <Label>Featured Image</Label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-zinc-900 file:text-white hover:file:bg-zinc-800 file:cursor-pointer disabled:opacity-50 dark:text-zinc-400"
                  />
                  {uploading && <Description>Uploading...</Description>}
                  <Description>Or select from existing:</Description>
                  <Select
                    name="featuredImageId"
                    value={formData.featuredImageId}
                    onChange={(e) => setFormData({ ...formData, featuredImageId: e.target.value })}
                  >
                    <option value="">No Image</option>
                    {files.map((file) => (
                      <option key={file.id} value={file.id}>
                        {file.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </Field>
              <CheckboxField>
                <Checkbox
                  name="published"
                  checked={formData.published}
                  onChange={(checked) => setFormData({ ...formData, published: checked })}
                />
                <Label>Published</Label>
              </CheckboxField>
            </FieldGroup>
            <div className="mt-8 flex gap-4">
              <Button type="submit">
                {editingPost ? 'Update Post' : 'Create Post'}
              </Button>
              <Button type="button" plain onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </Fieldset>
        </form>
      )}

      {!showForm && (
        <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Title</TableHeader>
            <TableHeader>Slug</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader></TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell className="font-medium">{post.title}</TableCell>
              <TableCell className="text-zinc-500">{post.slug}</TableCell>
              <TableCell>
                <Badge color={post.published ? 'green' : 'zinc'}>
                  {post.published ? 'Published' : 'Draft'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="-mx-3 -my-1.5 sm:-mx-2.5">
                  <Dropdown>
                    <DropdownButton plain aria-label="More options">
                      <EllipsisVerticalIcon />
                    </DropdownButton>
                    <DropdownMenu anchor="bottom end">
                      <DropdownItem onClick={() => handleEdit(post)}>
                        Edit
                      </DropdownItem>
                      <DropdownItem onClick={() => handleDelete(post.id)}>
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      )}
    </div>
  );
}
