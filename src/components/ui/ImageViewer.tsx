import React, { useState, useEffect } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  title?: string;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onIndexChange,
  title,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      e.preventDefault(); // Prevent any default behavior
      e.stopPropagation();

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          handlePrevImage();
          break;
        case "ArrowRight":
          handleNextImage();
          break;
        case "+":
        case "=":
          handleZoomIn();
          break;
        case "-":
          handleZoomOut();
          break;
        case "r":
        case "R":
          handleRotate();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown, true);
      return () => document.removeEventListener("keydown", handleKeyDown, true);
    }
  }, [isOpen, currentIndex]);

  const handleZoomIn = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setZoom((prev) => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setZoom((prev) => Math.max(prev / 1.2, 0.1));
  };

  const handleRotate = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
      handleReset();
    }
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (currentIndex < images.length - 1) {
      onIndexChange(currentIndex + 1);
      handleReset();
    }
  };

  const handleClose = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    onClose();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.min(Math.max(prev * delta, 0.1), 5));
  };

  const handleMouseUp = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsDragging(false);
  };

  const handleDownload = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    try {
      const response = await fetch(images[currentIndex]);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `image-${currentIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleThumbnailClick = (index: number, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    onIndexChange(index);
    handleReset();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking the backdrop itself, not any child elements
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Header Controls */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-[10000] pointer-events-none">
        <div className="flex items-center space-x-3 pointer-events-auto">
          <h3 className="text-white text-lg font-medium bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg">
            {title || `Image ${currentIndex + 1} of ${images.length}`}
          </h3>
          <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium">
            {Math.round(zoom * 100)}%
          </div>
        </div>

        <div className="flex items-center space-x-2 pointer-events-auto">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 0.1}
            className="p-2 bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-black/70 shadow-lg rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 5}
            className="p-2 bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-black/70 shadow-lg rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleRotate}
            className="p-2 bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-black/70 shadow-lg rounded-lg transition-all duration-200"
            title="Rotate"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-black/70 shadow-lg rounded-lg transition-all duration-200"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleClose}
            className="p-2 bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-black/70 shadow-lg rounded-lg transition-all duration-200"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-[10000] pointer-events-auto">
            <button
              onClick={handlePrevImage}
              disabled={currentIndex === 0}
              className="p-3 bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg rounded-lg transition-all duration-200"
              title="Previous Image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-[10000] pointer-events-auto">
            <button
              onClick={handleNextImage}
              disabled={currentIndex === images.length - 1}
              className="p-3 bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg rounded-lg transition-all duration-200"
              title="Next Image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </>
      )}

      {/* Main Image */}
      <div className="flex-1 flex items-center justify-center p-16 pointer-events-none">
        <div
          className="relative select-none pointer-events-auto"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
            transition: isDragging ? "none" : "transform 0.2s ease-out",
            cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
          }}
        >
          <img
            src={currentImage}
            alt={`Image ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain block"
            draggable={false}
            onLoad={() => {
              // Reset position when new image loads
              setPosition({ x: 0, y: 0 });
            }}
          />
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[10000] pointer-events-auto">
          <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-lg p-3 max-w-md overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={`thumb-${index}`}
                onClick={(e) => handleThumbnailClick(index, e)}
                className={`w-3 h-3 rounded-full transition-all duration-200 flex-shrink-0 ${
                  index === currentIndex
                    ? "bg-white scale-125 shadow-lg"
                    : "bg-white/50 hover:bg-white/75 hover:scale-110"
                }`}
                title={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="absolute bottom-4 right-4 z-[10000] pointer-events-none">
        <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm">
          Use arrow keys to navigate • Scroll to zoom • Drag to pan
        </div>
      </div>
    </div>
  );
};