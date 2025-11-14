'use client';

import { useState, useEffect } from 'react';
import { Heading, Subheading } from '@/components/catalyst/heading';
import { Button } from '@/components/catalyst/button';
import { Input } from '@/components/catalyst/input';
import { Select } from '@/components/catalyst/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/catalyst/table';
import { Badge } from '@/components/catalyst/badge';
import { Fieldset, Legend, FieldGroup, Field, Label, Description } from '@/components/catalyst/fieldset';
import { Textarea } from '@/components/catalyst/textarea';
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from '@/components/catalyst/dropdown';
import { Checkbox, CheckboxField, CheckboxGroup } from '@/components/catalyst/checkbox';
import { EllipsisVerticalIcon } from '@heroicons/react/16/solid';

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
  pageType: string;
  showInMenu: boolean;
  menuOrder: string;
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
      pageType: page.pageType || 'standard',
      featuredImageId: page.featuredImage?.id || '',
      showInMenu: page.showInMenu || false,
      menuOrder: page.menuOrder || '0',
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <Heading>Pages</Heading>
        {!showForm && (
          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            Add Page
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6">
          <Fieldset>
            <Legend>{editingPage ? 'Edit Page' : 'Create Page'}</Legend>
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
                  placeholder="Leave blank to auto-generate from title"
                />
                <Description>URL-friendly version of the title</Description>
              </Field>
              <Field>
                <Label>Page Type</Label>
                <Select
                  name="pageType"
                  value={formData.pageType}
                  onChange={(e) => setFormData({ ...formData, pageType: e.target.value })}
                >
                  <option value="standard">Standard Page</option>
                  <option value="home">Home Page</option>
                </Select>
              </Field>
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
                      className="block w-full px-3 py-1.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-md"
                      value={formData.menuOrder}
                      onChange={(e) => setFormData({ ...formData, menuOrder: e.target.value })}
                      placeholder="0"
                    />
                    <p className="mt-1 text-xs text-gray-500">Lower numbers appear first</p>
                  </div>
                )}
              </div>
            )}
              <Field>
                <Label>Content</Label>
                <Textarea
                  name="content"
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </Field>
              <Field>
                <Label>Featured Image</Label>
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
                {editingPage ? 'Update Page' : 'Create Page'}
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
          {pages.map((page) => (
            <TableRow key={page.id}>
              <TableCell className="font-medium">{page.title}</TableCell>
              <TableCell className="text-zinc-500">{page.slug}</TableCell>
              <TableCell>
                <Badge color={page.published ? 'green' : 'zinc'}>
                  {page.published ? 'Published' : 'Draft'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="-mx-3 -my-1.5 sm:-mx-2.5">
                  <Dropdown>
                    <DropdownButton plain aria-label="More options">
                      <EllipsisVerticalIcon />
                    </DropdownButton>
                    <DropdownMenu anchor="bottom end">
                      <DropdownItem onClick={() => handleEdit(page)}>
                        Edit
                      </DropdownItem>
                      <DropdownItem onClick={() => handleDelete(page.id)}>
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
