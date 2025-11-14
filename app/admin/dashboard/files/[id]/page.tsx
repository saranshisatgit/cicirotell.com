'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heading } from '@/components/catalyst/heading';
import { Button } from '@/components/catalyst/button';
import { Input } from '@/components/catalyst/input';
import { Textarea } from '@/components/catalyst/textarea';
import { Select } from '@/components/catalyst/select';
import { Badge } from '@/components/catalyst/badge';
import { Fieldset, Legend, FieldGroup, Field, Label, Description } from '@/components/catalyst/fieldset';
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from '@/components/catalyst/dialog';
import { XMarkIcon } from '@heroicons/react/16/solid';
import Image from 'next/image';

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

export default function FileEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [fileId, setFileId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capturedAt: '',
    metadata: '',
    categoryId: '',
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const loadParams = async () => {
      const { id } = await params;
      setFileId(id);
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    if (fileId) {
      fetchFile();
      fetchCategories();
    }
  }, [fileId]);

  const fetchFile = async () => {
    if (!fileId) return;
    
    try {
      const res = await fetch(`/api/admin/files/${fileId}`);
      if (!res.ok) {
        alert('File not found');
        router.push('/admin/dashboard/files');
        return;
      }
      const data = await res.json();
      setFile(data);

      // Parse tags from metadata
      let parsedTags: string[] = [];
      if (data.metadata) {
        try {
          const meta = JSON.parse(data.metadata);
          parsedTags = meta.tags || [];
        } catch (e) {
          // Ignore invalid JSON
        }
      }

      // Load image dimensions
      if (data.mimeType?.startsWith('image/')) {
        const img = document.createElement('img');
        img.onload = () => {
          setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        };
        img.src = data.url;
      }

      setFormData({
        name: data.name,
        location: data.location || '',
        capturedAt: data.capturedAt ? new Date(data.capturedAt).toISOString().split('T')[0] : '',
        metadata: data.metadata || '',
        categoryId: data.category?.id || '',
      });
      setTags(parsedTags);
    } catch (error) {
      console.error('Error fetching file:', error);
      alert('Failed to load file');
      router.push('/admin/dashboard/files');
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

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagInput(value);
    
    if (value.includes(',')) {
      const newTags = value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag && !tags.includes(tag));
      
      if (newTags.length > 0) {
        setTags([...tags, ...newTags]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = tagInput.trim();
      if (trimmed && !tags.includes(trimmed)) {
        setTags([...tags, trimmed]);
        setTagInput('');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      // Build metadata object with tags
      let metadataObj: Record<string, unknown> = {};
      if (formData.metadata) {
        try {
          metadataObj = JSON.parse(formData.metadata);
        } catch (e) {
          // If existing metadata is not valid JSON, start fresh
        }
      }
      metadataObj.tags = tags;
      const metadataString = JSON.stringify(metadataObj);

      const response = await fetch(`/api/admin/files/${file.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          location: formData.location || null,
          capturedAt: formData.capturedAt || null,
          metadata: metadataString,
          categoryId: formData.categoryId || null,
        }),
      });

      if (response.ok) {
        alert('File updated successfully!');
        router.push('/admin/dashboard/files');
      }
    } catch (error) {
      console.error('Error updating file:', error);
      alert('Failed to update file');
    }
  };

  const handleViewFullSize = () => {
    setShowImageDialog(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!file) {
    return <div className="text-center py-8">File not found</div>;
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-6">
        <Button plain onClick={() => router.push('/admin/dashboard/files')}>
          ← Back to Files
        </Button>
      </div>

      <Heading className="mb-6">Edit File</Heading>

      <form onSubmit={handleSubmit}>
        <Fieldset>
          <Legend>File Metadata</Legend>
          
          {/* Image Preview */}
          {file.mimeType?.startsWith('image/') && (
            <div className="mb-6 flex justify-center">
              <div className="relative cursor-pointer" onClick={handleViewFullSize}>
                <Image
                  src={file.url}
                  width={200}
                  height={200}
                  alt={file.name}
                  className="max-w-md max-h-64 rounded-lg shadow-lg object-contain hover:opacity-90 transition-opacity"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewFullSize();
                  }}
                  className="absolute top-2 right-2 px-2 py-1 text-xs bg-black/50 text-white rounded hover:bg-black/70 backdrop-blur-sm transition-colors"
                >
                  View Full Size
                </button>
              </div>
            </div>
          )}
          
          <FieldGroup>
            <Field>
              <Label>File Name</Label>
              <Input
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Field>
            <Field>
              <Label>Location</Label>
              <Input
                name="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Paris, France"
              />
              <Description>Where the photo was taken</Description>
            </Field>
            <Field>
              <Label>Captured At</Label>
              <Input
                name="capturedAt"
                type="date"
                value={formData.capturedAt}
                onChange={(e) => setFormData({ ...formData, capturedAt: e.target.value })}
              />
              <Description>When the photo was taken</Description>
            </Field>
            <Field>
              <Label>Category</Label>
              <Select
                name="categoryId"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              >
                <option value="">No Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field>
              <Label>Tags</Label>
              <div className="space-y-3">
                <Input
                  name="tagInput"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyPress={handleTagKeyPress}
                  placeholder="Type tags separated by commas (e.g., canon, portrait, outdoor)"
                />
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} color="zinc" className="inline-flex items-center gap-1.5">
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-zinc-900 dark:hover:text-white"
                          aria-label={`Remove ${tag} tag`}
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <Description>Type tags and press comma or Enter to add. Click X to remove.</Description>
              </div>
            </Field>
            <Field>
              <Label>Additional Metadata (JSON)</Label>
              <Textarea
                name="metadata"
                rows={3}
                value={formData.metadata}
                onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
                placeholder='{"camera": "Canon EOS R5", "lens": "RF 24-70mm", "iso": 400}'
              />
              <Description>Optional: EXIF data or custom metadata in JSON format</Description>
            </Field>
          </FieldGroup>
          <div className="mt-8 flex gap-4">
            <Button type="submit">Update File</Button>
            <Button type="button" plain onClick={() => router.push('/admin/dashboard/files')}>
              Cancel
            </Button>
          </div>
        </Fieldset>
      </form>

      {/* Full Size Image Dialog */}
      {file && (
        <Dialog open={showImageDialog} onClose={() => setShowImageDialog(false)} size="5xl">
          <DialogTitle>{file.name}</DialogTitle>
          <DialogDescription>
            {imageDimensions && (
              <>
                Original dimensions: {imageDimensions.width} × {imageDimensions.height}px
                {(imageDimensions.width > 1200 || imageDimensions.height > 800) && (
                  <span className="block mt-1 text-amber-600 dark:text-amber-400">
                    ⚠️ This image is larger than the viewport and has been scaled to fit
                  </span>
                )}
              </>
            )}
          </DialogDescription>
          <DialogBody>
            <div className="flex justify-center items-center">
              <Image
                src={file.url}
                width={imageDimensions?.width || 800}
                height={imageDimensions?.height || 600}
                alt={file.name}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </DialogBody>
          <DialogActions>
            <Button plain onClick={() => setShowImageDialog(false)}>
              Close
            </Button>
            <Button href={file.url} target="_blank" rel="noopener noreferrer">
              Open in New Tab
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}
