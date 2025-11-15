'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop } from '@headlessui/react';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/catalyst/button';

interface File {
  id: string;
  name: string;
  url: string;
  mimeType: string | null;
}

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (fileId: string) => void;
  selectedFileId?: string | null;
  title?: string;
}

export default function MediaModal({
  isOpen,
  onClose,
  onSelect,
  selectedFileId,
  title = 'Select Media',
}: MediaModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(selectedFileId || null);

  useEffect(() => {
    if (isOpen) {
      fetchFiles();
      setSelectedId(selectedFileId || null);
    }
  }, [isOpen, selectedFileId]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/files');
      if (res.ok) {
        const data = await res.json();
        // Filter only images
        const imageFiles = data.filter((file: File) => 
          file.mimeType?.startsWith('image/')
        );
        setFiles(imageFiles);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (fileId: string) => {
    setSelectedId(fileId);
  };

  const handleConfirm = () => {
    if (selectedId) {
      onSelect(selectedId);
      onClose();
    }
  };

  const handleClear = () => {
    setSelectedId(null);
    onSelect('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/50" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-5xl rounded-lg bg-white dark:bg-zinc-900 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
            <DialogTitle className="text-lg font-medium text-zinc-900 dark:text-white">
              {title}
            </DialogTitle>
            <button
              onClick={onClose}
              className="rounded-md p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-zinc-500" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-sm text-zinc-500">Loading images...</div>
              </div>
            ) : files.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-sm text-zinc-500">No images available</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {files.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => handleSelect(file.id)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedId === file.id
                        ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2'
                        : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                    }`}
                  >
                    <Image
                      src={file.url}
                      alt={file.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover"
                    />
                    {selectedId === file.id && (
                      <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                        <CheckCircleIcon className="h-8 w-8 text-blue-500 bg-white rounded-full" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-xs text-white truncate">{file.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 px-6 py-4">
            <Button
              plain
              onClick={handleClear}
              disabled={!selectedId && !selectedFileId}
            >
              Clear Selection
            </Button>
            <div className="flex gap-2">
              <Button plain onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleConfirm} disabled={!selectedId}>
                Select Image
              </Button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
