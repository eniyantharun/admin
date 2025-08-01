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

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.2, 0.1));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handlePrevImage = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
      handleReset();
    }
  };

  const handleNextImage = () => {
    if (currentIndex < images.length - 1) {
      onIndexChange(currentIndex + 1);
      handleReset();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.min(Math.max(prev * delta, 0.1), 5));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownload = async () => {
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
      // Error handling would be done through toast notifications in the parent component
    }
  };

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <h3 className="text-white text-lg font-medium">
            {title || `Image ${currentIndex + 1} of ${images.length}`}
          </h3>
          <div className="bg-black/50 text-white px-2 py-1 rounded text-sm">
            {Math.round(zoom * 100)}%
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={handleZoomOut}
            variant="secondary"
            size="sm"
            icon={ZoomOut}
            iconOnly
            className="bg-black/50 border-white/20 text-white hover:bg-black/70"
            disabled={zoom <= 0.1}
          />
          <Button
            onClick={handleZoomIn}
            variant="secondary"
            size="sm"
            icon={ZoomIn}
            iconOnly
            className="bg-black/50 border-white/20 text-white hover:bg-black/70"
            disabled={zoom >= 5}
          />
          <Button
            onClick={handleRotate}
            variant="secondary"
            size="sm"
            icon={RotateCw}
            iconOnly
            className="bg-black/50 border-white/20 text-white hover:bg-black/70"
          />
          <Button
            onClick={handleDownload}
            variant="secondary"
            size="sm"
            icon={Download}
            iconOnly
            className="bg-black/50 border-white/20 text-white hover:bg-black/70"
          />
          <Button
            onClick={onClose}
            variant="secondary"
            size="sm"
            icon={X}
            iconOnly
            className="bg-black/50 border-white/20 text-white hover:bg-black/70"
          />
        </div>
      </div>

      {images.length > 1 && (
        <>
          <Button
            onClick={handlePrevImage}
            variant="secondary"
            size="sm"
            icon={ChevronLeft}
            iconOnly
            disabled={currentIndex === 0}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 border-white/20 text-white hover:bg-black/70 disabled:opacity-30"
          />
          <Button
            onClick={handleNextImage}
            variant="secondary"
            size="sm"
            icon={ChevronRight}
            iconOnly
            disabled={currentIndex === images.length - 1}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 border-white/20 text-white hover:bg-black/70 disabled:opacity-30"
          />
        </>
      )}

      <div className="flex-1 flex items-center justify-center p-16">
        <div
          className="relative cursor-move select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
            transition: isDragging ? "none" : "transform 0.2s ease-out",
          }}
        >
          <img
            src={currentImage}
            alt={`Image ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            draggable={false}
          />
        </div>
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-lg p-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  onIndexChange(index);
                  handleReset();
                }}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? "bg-white scale-125"
                    : "bg-white/50 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-black/50 text-white px-3 py-1 rounded text-sm">
          Use arrow keys to navigate • Scroll to zoom • Drag to pan
        </div>
      </div>
    </div>
  );
};