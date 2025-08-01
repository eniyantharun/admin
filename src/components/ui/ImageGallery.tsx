import React, { useState } from "react";
import { Plus, X, ImageIcon, Upload, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ImageViewer } from "@/components/ui/ImageViewer";
import { showToast } from "@/components/ui/toast";

interface ImageGalleryProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  title?: string;
  maxImages?: number;
  editable?: boolean;
  className?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onImagesChange,
  title = "Images",
  maxImages = 10,
  editable = true,
  className = "",
}) => {
  const [showModal, setShowModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setShowModal(true);
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
    showToast.success("Image removed successfully");
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) {
      showToast.error("Please enter a valid image URL");
      return;
    }

    if (images.length >= maxImages) {
      showToast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    if (images.includes(newImageUrl)) {
      showToast.error("This image is already added");
      return;
    }

    const img = new Image();
    img.onload = () => {
      onImagesChange([...images, newImageUrl]);
      setNewImageUrl("");
      setShowAddForm(false);
      showToast.success("Image added successfully");
    };
    img.onerror = () => {
      showToast.error("Invalid image URL or image could not be loaded");
    };
    img.src = newImageUrl;
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);

    onImagesChange(newImages);
    setDraggedIndex(null);
    showToast.success("Images reordered");
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 text-sm">{title}</h4>
        {editable && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {images.length}/{maxImages}
            </span>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              variant="secondary"
              size="sm"
              icon={Plus}
              className="h-6"
              disabled={images.length >= maxImages}
            >
              Add Image
            </Button>
          </div>
        )}
      </div>

      {showAddForm && editable && (
        <Card className="p-3 bg-blue-50 border-blue-200">
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Enter image URL (https://example.com/image.jpg)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <Button
                onClick={handleAddImage}
                variant="primary"
                size="sm"
                icon={Upload}
                disabled={!newImageUrl.trim()}
              >
                Add
              </Button>
              <Button
                onClick={() => {
                  setShowAddForm(false);
                  setNewImageUrl("");
                }}
                variant="secondary"
                size="sm"
                icon={X}
                iconOnly
              />
            </div>
            <p className="text-xs text-blue-600">
              Supported formats: JPG, PNG, GIF, WebP. Maximum {maxImages}{" "}
              images.
            </p>
          </div>
        </Card>
      )}

      {images.length === 0 ? (
        <Card className="p-6 text-center border-dashed border-2 border-gray-300">
          <ImageIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 mb-2">No images added yet</p>
          {editable && (
            <Button
              onClick={() => setShowAddForm(true)}
              variant="secondary"
              size="sm"
              icon={Plus}
            >
              Add First Image
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className={`relative group cursor-pointer transition-all duration-200 ${
                draggedIndex === index
                  ? "opacity-50 scale-95"
                  : "hover:scale-105"
              }`}
              draggable={editable}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shadow-sm group-hover:shadow-md transition-shadow duration-200">
                <img
                  src={image}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleImageClick(index);
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDlWN0MyMSA1Ljg5IDIwLjEgNSAxOSA1SDVDMy45IDUgMyA1Ljg5IDMgN1Y5TTIxIDlWMTlDMjEgMjAuMTEgMjAuMSAyMSAxOSAyMUg1QzMuOSAyMSAzIDIwLjExIDMgMTlWOU0yMSA5SDE5TTMgOUg1IiBzdHJva2U9IiM5Q0E3QjgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik05IDEzSDEwTDEyIDExTDE1IDEzLjVMMTggMTBIMjEiIHN0cm9rZT0iIzlDQTdCOCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+";
                  }}
                />
              </div>

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 rounded-lg flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleImageClick(index);
                    }}
                    variant="secondary"
                    size="sm"
                    icon={Eye}
                    iconOnly
                    className="bg-white/90 border-gray-200 text-gray-700 hover:bg-white shadow-lg"
                  />
                  {editable && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleRemoveImage(index);
                      }}
                      variant="danger"
                      size="sm"
                      icon={X}
                      iconOnly
                      className="bg-red-500 border-red-500 text-white hover:bg-red-600 shadow-lg"
                    />
                  )}
                </div>
              </div>

              <div className="absolute top-1 right-1 bg-black/50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      <ImageViewer
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        images={images}
        currentIndex={currentImageIndex}
        onIndexChange={setCurrentImageIndex}
        title={`${title} - Image ${currentImageIndex + 1}`}
      />
    </div>
  );
};
