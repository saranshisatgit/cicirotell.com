'use client';

import { useState, useEffect } from 'react';
import { Heading } from '@/components/catalyst/heading';
import { Button } from '@/components/catalyst/button';
import { Input } from '@/components/catalyst/input';
import { Textarea } from '@/components/catalyst/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/catalyst/table';
import { Fieldset, Legend, FieldGroup, Field, Label, Description } from '@/components/catalyst/fieldset';
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from '@/components/catalyst/dropdown';
import { EllipsisVerticalIcon } from '@heroicons/react/16/solid';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        slug: formData.slug.trim() || generateSlug(formData.name),
      };

      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit),
      });

      if (res.ok) {
        setFormData({ name: '', slug: '', description: '' });
        setShowForm(false);
        fetchCategories();
      }
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <Heading>Categories</Heading>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            Add Category
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6">
          <Fieldset>
            <Legend>Create Category</Legend>
            <FieldGroup>
              <Field>
                <Label>Name</Label>
                <Input
                  name="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                <Label>Description</Label>
                <Textarea
                  name="description"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Field>
            </FieldGroup>
            <div className="mt-8 flex gap-4">
              <Button type="submit">Create Category</Button>
              <Button type="button" plain onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </Fieldset>
        </form>
      )}

      {!showForm && (
        <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Slug</TableHeader>
            <TableHeader>Description</TableHeader>
            <TableHeader></TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-zinc-500">{category.slug}</TableCell>
                <TableCell className="text-zinc-500">{category.description || '-'}</TableCell>
                <TableCell>
                  <div className="-mx-3 -my-1.5 sm:-mx-2.5">
                    <Dropdown>
                      <DropdownButton plain aria-label="More options">
                        <EllipsisVerticalIcon />
                      </DropdownButton>
                      <DropdownMenu anchor="bottom end">
                        <DropdownItem onClick={() => handleDelete(category.id)}>
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
