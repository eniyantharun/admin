import React, { useState, useEffect } from 'react';
import { X, ImageIcon, Eye, Grid, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useApi } from '@/hooks/useApi';
import { showToast } from '@/components/ui/toast';

export interface ProductPicture {
  productId: number;
  pictureId: number;
  slug: string;
  index: number;
  defaultKey: string;
  sourceKey: string;
  sourceUri: string;
  fullKey: string;
  thumbnail226X240: string;
  sourceKey800X800: string;
  slugKey800X800: string;
  urlSlugKey800X800: string;
  slugKey400X400: string;
  key100X100: string;
  slugKey100X100: string;
  isDev: boolean;
  path: string;
  url: string;
  itemNumber: number;
}

interface ProductPicturesResponse {
  pictures: ProductPicture[];
}

interface ProductImageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: (picture: ProductPicture) => void;
  productId: string | number;
  currentPicture?: ProductPicture | null;
  productName?: string;
}

export const ProductImageSelector: React.FC<ProductImageSelectorProps> = ({
  isOpen,
  onClose,
  onImageSelect,
  productId,
  currentPicture,
  productName
}) => {
  const [pictures, setPictures] = useState<ProductPicture[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPicture, setSelectedPicture] = useState<ProductPicture | null>(currentPicture || null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const { get } = useApi({
    cancelOnUnmount: true,
    dedupe: false,
  });

  useEffect(() => {
    if (isOpen && productId) {
      fetchProductPictures();
    }
  }, [isOpen, productId]);

  const fetchProductPictures = async () => {
    setLoading(true);
    try {
      const response = await get(`https://api.promowe.com/Admin/ProductEditor/GetProductPicturesList?productId=${productId}`) as ProductPicturesResponse;
      
      if (response?.pictures) {
        // Sort by index for consistent display
        const sortedPictures = response.pictures.sort((a, b) => a.index - b.index);
        setPictures(sortedPictures);
      } else {
        setPictures([]);
        showToast.info('No images available for this product');
      }
    } catch (error: any) {
      console.error('Error fetching product pictures:', error);
      if (error?.name !== 'CanceledError') {
        showToast.error('Failed to load product images');
      }
      setPictures([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePictureSelect = (picture: ProductPicture) => {
    setSelectedPicture(picture);
  };

  const handleConfirmSelection = () => {
    if (selectedPicture) {
      onImageSelect(selectedPicture);
      onClose();
    }
  };

  const openViewer = (index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const closeViewer = () => {
    setViewerOpen(false);
  };

  const navigateViewer = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && viewerIndex > 0) {
      setViewerIndex(viewerIndex - 1);
    } else if (direction === 'next' && viewerIndex < pictures.length - 1) {
      setViewerIndex(viewerIndex + 1);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 z-[9998] bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Select Product Image
              </h3>
              {productName && (
                <p className="text-sm text-gray-600 mt-1">{productName}</p>
              )}
            </div>
            <Button
              onClick={onClose}
              variant="secondary"
              size="sm"
              icon={X}
              iconOnly
              className="w-8 h-8"
              title="Close"
            />
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto max-h-[50vh]">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 mx-auto mb-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
                <p className="text-gray-500">Loading product images...</p>
              </div>
            ) : pictures.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 mb-2">No images available for this product</p>
                <p className="text-sm text-gray-400">The selected product doesn't have any images to choose from.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {pictures.map((picture, index) => (
                  <div
                    key={picture.pictureId}
                    className={`relative group cursor-pointer transition-all duration-200 ${
                      selectedPicture?.pictureId === picture.pictureId
                        ? 'ring-2 ring-purple-500 ring-offset-2'
                        : 'hover:scale-105'
                    }`}
                    onClick={() => handlePictureSelect(picture)}
                  >
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-purple-300 transition-all duration-200">
                      <img
                        src={picture.sourceUri}
                        alt={`Product image ${picture.index}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDlWN0MyMSA1Ljg5IDIwLjEgNSAxOSA1SDVDMy45IDUgMyA1Ljg5IDMgN1Y5TTIxIDlWMTlDMjEgMjAuMTEgMjAuMSAyMSAxOSAyMUg1QzMuOSAyMSAzIDIwLjExIDMgMTlWOU0yMSA5SDE5TTMgOUg1IiBzdHJva2U9IiM5Q0E3QjgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik05IDEzSDEwTDEyIDExTDE1IDEzLjVMMTggMTBIMjEiIHN0cm9rZT0iIzlDQTdCOCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+";
                        }}
                      />
                    </div>
                    
                    {/* Hover overlay with view button */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          openViewer(index);
                        }}
                        size="sm"
                        variant="secondary"
                        icon={Eye}
                        className="w-8 h-8 p-1 bg-white/90 hover:bg-white text-gray-700 shadow-lg"
                        title="View full size"
                      />
                    </div>

                    {/* Index indicator */}
                    <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                      {picture.index}
                    </div>

                    {/* Selection indicator */}
                    {selectedPicture?.pictureId === picture.pictureId && (
                      <div className="absolute top-1 left-1 bg-purple-500 text-white rounded-full p-1 shadow-lg">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {!loading && pictures.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t bg-gray-50">
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-600">
                  {pictures.length} image{pictures.length !== 1 ? 's' : ''} available
                </p>
                {selectedPicture && (
                  <p className="text-sm text-purple-600 font-medium">
                    Image #{selectedPicture.index} selected
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={onClose}
                  variant="secondary"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmSelection}
                  disabled={!selectedPicture}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Select Image
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Size Image Viewer */}
      {viewerOpen && pictures.length > 0 && (
        <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center">
          {/* Header */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-2 rounded-lg">
              <h4 className="font-medium">
                {productName} - Image {pictures[viewerIndex]?.index}
              </h4>
            </div>
            <Button
              onClick={closeViewer}
              variant="secondary"
              size="sm"
              icon={X}
              className="bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-black/70"
              title="Close viewer"
            />
          </div>

          {/* Navigation arrows */}
          {pictures.length > 1 && (
            <>
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                <Button
                  onClick={() => navigateViewer('prev')}
                  disabled={viewerIndex === 0}
                  variant="secondary"
                  size="sm"
                  icon={ChevronLeft}
                  className="bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-black/70 disabled:opacity-30"
                  title="Previous image"
                />
              </div>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10">
                <Button
                  onClick={() => navigateViewer('next')}
                  disabled={viewerIndex === pictures.length - 1}
                  variant="secondary"
                  size="sm"
                  icon={ChevronRight}
                  className="bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-black/70 disabled:opacity-30"
                  title="Next image"
                />
              </div>
            </>
          )}

          {/* Main image */}
          <div className="flex-1 flex items-center justify-center p-16">
            <img
              src={pictures[viewerIndex]?.sourceUri}
              alt={`Product image ${pictures[viewerIndex]?.index}`}
              className="max-w-full max-h-full object-contain"
              onClick={closeViewer}
            />
          </div>

          {/* Bottom thumbnails */}
          {pictures.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
              <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg p-3 max-w-md overflow-x-auto">
                {pictures.map((picture, index) => (
                  <button
                    key={picture.pictureId}
                    onClick={() => setViewerIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 flex-shrink-0 ${
                      index === viewerIndex
                        ? "bg-white scale-125 shadow-lg"
                        : "bg-white/50 hover:bg-white/75 hover:scale-110"
                    }`}
                    title={`Image ${picture.index}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Select button overlay */}
          <div className="absolute bottom-4 right-4 z-10">
            <Button
              onClick={() => {
                setSelectedPicture(pictures[viewerIndex]);
                closeViewer();
              }}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
            >
              Select This Image
            </Button>
          </div>
        </div>
      )}
    </>
  );
};