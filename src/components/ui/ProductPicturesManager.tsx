'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GripVertical, Trash2, Download, Upload, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PictureItem {
  id: string;
  pictureId: number;
  index: number;
  url: string;
  isMain: boolean;
  variants: string;
  colors: string;
}

interface ApiPicture {
  id: number;
  index: number;
  variants: Array<{ id: number; name: string }>;
  colors: any[];
}

interface ProductPicturesManagerProps {
  initialPictures?: PictureItem[];
  apiPictures?: ApiPicture[];
  primaryPictureId?: number;
  onChange?: (pictures: PictureItem[]) => void;
  productId?: string | number;
  onUpload?: (file: File) => Promise<void>;
  onDelete?: (pictureId: number) => Promise<void>;
}

// Helper function to construct image URL
const getProductImageUrl = (productId: string | number, pictureIndex: number): string => {
  if (!productId) return '';
  return `https://static2.promotionalproductinc.com/p2/src/${productId}/${pictureIndex}.webp`;
};

export const ProductPicturesManager: React.FC<ProductPicturesManagerProps> = ({
  initialPictures = [],
  apiPictures = [],
  primaryPictureId,
  onChange,
  productId,
  onUpload,
  onDelete,
}) => {
  const [pictures, setPictures] = useState<PictureItem[]>(initialPictures);
  const [selectedForRemoval, setSelectedForRemoval] = useState<Set<string>>(new Set());
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize pictures from API data
  useEffect(() => {
    if (apiPictures && apiPictures.length > 0 && productId) {
      const mappedPictures: PictureItem[] = apiPictures.map((pic) => ({
        id: pic.id.toString(),
        pictureId: pic.id,
        index: pic.index,
        url: getProductImageUrl(productId, pic.index),
        isMain: pic.id === primaryPictureId,
        variants: pic.variants.map(v => v.name).filter(Boolean).join(', '),
        colors: pic.colors && pic.colors.length > 0 ? pic.colors.map((c: any) => c.name).join(', ') : '',
      }));
      setPictures(mappedPictures);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiPictures, primaryPictureId, productId]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // If onUpload callback is provided, use API upload
    if (onUpload) {
      for (const file of Array.from(files)) {
        try {
          await onUpload(file);
        } catch (error) {
          console.error('Failed to upload image:', error);
        }
      }
    } else {
      // Fallback to local preview
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newPicture: PictureItem = {
            id: Date.now().toString() + Math.random(),
            pictureId: Date.now(),
            index: pictures.length + 1,
            url: event.target?.result as string,
            isMain: pictures.length === 0,
            variants: '',
            colors: '',
          };

          const updatedPictures = [...pictures, newPicture];
          setPictures(updatedPictures);
          onChange?.(updatedPictures);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleAddManual = () => {
    handleUploadClick();
  };

  const handleRemoveSelected = async () => {
    if (selectedForRemoval.size === 0) return;

    if (confirm(`Are you sure you want to remove ${selectedForRemoval.size} picture(s)?`)) {
      // If onDelete callback is provided, use API delete
      if (onDelete) {
        for (const pictureId of Array.from(selectedForRemoval)) {
          const picture = pictures.find(p => p.id === pictureId);
          if (picture) {
            try {
              await onDelete(picture.pictureId);
            } catch (error) {
              console.error('Failed to delete image:', error);
            }
          }
        }
      } else {
        // Fallback to local removal
        const updatedPictures = pictures.filter(pic => !selectedForRemoval.has(pic.id));
        setPictures(updatedPictures);
        onChange?.(updatedPictures);
      }
      setSelectedForRemoval(new Set());
    }
  };

  const toggleMainPicture = (id: string) => {
    const updatedPictures = pictures.map(pic => ({
      ...pic,
      isMain: pic.id === id,
    }));
    setPictures(updatedPictures);
    onChange?.(updatedPictures);
  };

  const updateField = (id: string, field: 'variants' | 'colors', value: string) => {
    const updatedPictures = pictures.map(pic =>
      pic.id === id ? { ...pic, [field]: value } : pic
    );
    setPictures(updatedPictures);
    onChange?.(updatedPictures);
  };

  const toggleSelectForRemoval = (id: string) => {
    const newSet = new Set(selectedForRemoval);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedForRemoval(newSet);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newPictures = [...pictures];
    const draggedItem = newPictures[draggedIndex];
    newPictures.splice(draggedIndex, 1);
    newPictures.splice(index, 0, draggedItem);

    setPictures(newPictures);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    onChange?.(pictures);
  };

  const handleDownload = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `product-image-${index}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openPreview = (url: string) => {
    setPreviewImage(url);
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-indigo-600" />
        Pictures
      </h3>

      {/* Action Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            onClick={handleUploadClick}
            variant="secondary"
            size="sm"
            icon={Upload}
          >
            UPLOAD
          </Button>
          <span className="text-xs text-gray-500 italic">Drag and drop available</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleAddManual}
            variant="secondary"
            size="sm"
          >
            ADD
          </Button>
          <Button
            onClick={handleRemoveSelected}
            variant="secondary"
            size="sm"
            disabled={selectedForRemoval.size === 0}
            className="text-gray-500"
          >
            REMOVE {selectedForRemoval.size} PICTURE(S)
          </Button>
        </div>
      </div>

      {/* Pictures List */}
      <div className="border border-gray-300 rounded-lg p-4 space-y-4 max-h-[600px] overflow-y-auto bg-gray-50">
        {pictures.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-500 text-sm">No pictures uploaded yet</p>
            <p className="text-gray-400 text-xs mt-1">Upload images to get started</p>
          </div>
        ) : (
          pictures.map((picture, index) => (
            <div
              key={picture.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-start gap-3 p-3 bg-white border rounded-lg transition-all duration-200 ${
                draggedIndex === index ? 'opacity-50 scale-95' : 'opacity-100'
              } hover:border-gray-400`}
            >
              {/* Drag Handle */}
              <div className="pt-8">
                <GripVertical className="w-5 h-5 text-gray-400 cursor-grab active:cursor-grabbing" />
              </div>

              {/* Main Radio */}
              <div className="pt-8 flex-shrink-0">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mainPicture"
                    checked={picture.isMain}
                    onChange={() => toggleMainPicture(picture.id)}
                    className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-xs font-medium text-gray-700">Main</span>
                </label>
              </div>

              {/* Image Preview */}
              <div className="flex-shrink-0">
                <div
                  onClick={() => openPreview(picture.url)}
                  className="w-32 h-32 border-2 border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:border-blue-400 transition-all duration-200"
                >
                  <img
                    src={picture.url}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => handleDownload(picture.url, index + 1)}
                  className="flex items-center gap-1 mt-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Download className="w-3 h-3" />
                  Download
                </button>
              </div>

              {/* Input Fields */}
              <div className="flex-1 grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Variants</label>
                  <input
                    type="text"
                    value={picture.variants}
                    onChange={(e) => updateField(picture.id, 'variants', e.target.value)}
                    placeholder="Variants"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Colors</label>
                  <input
                    type="text"
                    value={picture.colors}
                    onChange={(e) => updateField(picture.id, 'colors', e.target.value)}
                    placeholder="Colors"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Delete Checkbox */}
              <div className="pt-8 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={selectedForRemoval.has(picture.id)}
                  onChange={() => toggleSelectForRemoval(picture.id)}
                  className="w-4 h-4 text-red-600 focus:ring-2 focus:ring-red-500 rounded"
                  title="Select for removal"
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
          onClick={closePreview}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <button
              onClick={closePreview}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-sm font-medium"
            >
              ✕ Close
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};
