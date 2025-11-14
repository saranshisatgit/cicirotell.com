'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heading } from '@/components/catalyst/heading';
import { Button } from '@/components/catalyst/button';
import { Select } from '@/components/catalyst/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/catalyst/table';
import { Fieldset, Legend, FieldGroup, Field, Label, Description } from '@/components/catalyst/fieldset';
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from '@/components/catalyst/dropdown';
import { EllipsisVerticalIcon } from '@heroicons/react/16/solid';

interface Category {
  id: string;
  name: string;
}

interface File {
  id: string;
  name: string;
  url: string;
  size: string | null;
  mimeType: string | null;
  category: Category | null;
  location: string | null;
  capturedAt: Date | null;
  metadata: string | null;
  createdAt: Date;
}

export default function FilesPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchFiles();
    fetchCategories();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/admin/files');
      const data = await res.json();
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      // Step 1: Get presigned URL
      const presignedRes = await fetch('/api/upload/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: selectedFile.name,
          contentType: selectedFile.type,
        }),
      });

      const { presignedUrl, key, publicUrl } = await presignedRes.json();

      // Step 2: Upload to R2
      await fetch(presignedUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type,
        },
      });

      // Step 3: Save file record to database
      await fetch('/api/admin/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedFile.name,
          url: publicUrl,
          key,
          size: selectedFile.size.toString(),
          mimeType: selectedFile.type,
          categoryId: selectedCategory || null,
        }),
      });

      setSelectedFile(null);
      setSelectedCategory('');
      fetchFiles();
      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await fetch(`/api/admin/files?id=${id}`, { method: 'DELETE' });
      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="px-4 sm:px-0">
      <Heading>Files</Heading>

      <div className="mt-6 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-8 bg-zinc-50 dark:bg-zinc-900/50">
        <Fieldset>
          <Legend>Upload File</Legend>
          <FieldGroup>
            <Field>
              <Label>Select File</Label>
              <input
                type="file"
                onChange={handleFileSelect}
                className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-zinc-900 file:text-white hover:file:bg-zinc-800 file:cursor-pointer dark:text-zinc-400"
              />
            </Field>
            <Field>
              <Label>Category</Label>
              <Select
                name="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">No Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
              <Description>Optional - assign file to a category</Description>
            </Field>
          </FieldGroup>
          <div className="mt-8">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload File'}
            </Button>
          </div>
        </Fieldset>
      </div>

      <Table className="mt-8">
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Category</TableHeader>
            <TableHeader>Size</TableHeader>
            <TableHeader>Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.id}>
              <TableCell className="font-medium">
                {file.name}
              </TableCell>
              <TableCell>
                {file.category?.name || '-'}
              </TableCell>
              <TableCell>
                {file.size ? `${(parseInt(file.size) / 1024).toFixed(2)} KB` : '-'}
              </TableCell>
              <TableCell>
                <div className="-mx-3 -my-1.5 sm:-mx-2.5">
                  <Dropdown>
                    <DropdownButton plain aria-label="More options">
                      <EllipsisVerticalIcon />
                    </DropdownButton>
                    <DropdownMenu anchor="bottom end">
                      <DropdownItem onClick={() => router.push(`/admin/dashboard/files/${file.id}`)}>
                        Edit
                      </DropdownItem>
                      <DropdownItem onClick={() => handleDelete(file.id)}>
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
    </div>
  );
}
