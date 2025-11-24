'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import 'react-quill/dist/quill.snow.css';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-500">Loading editor...</div>,
});

interface ProductDescriptionEditorProps {
  documentId?: string | null;
  productId: number;
  onDocumentCreated?: (documentId: string) => void;
  className?: string;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export const ProductDescriptionEditor: React.FC<ProductDescriptionEditorProps> = ({
  documentId,
  productId,
  onDocumentCreated,
  className = '',
}) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(documentId || null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstLoadRef = useRef(true);

  // Load document content when documentId changes
  useEffect(() => {
    const loadDocument = async () => {
      if (!currentDocumentId) {
        // No document yet, show blank editor
        setContent('');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get('/Admin/Document/GetDocumentDetail', {
          params: { documentId: currentDocumentId },
        });

        // Convert document blocks to HTML (simplified - adjust based on actual API response)
        const htmlContent = convertBlocksToHtml(response.content?.children || []);
        setContent(htmlContent);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load document:', error);
        setContent('');
        setLoading(false);
      }
    };

    loadDocument();
  }, [currentDocumentId]);

  // Convert document blocks to HTML (simplified conversion)
  const convertBlocksToHtml = (blocks: any[]): string => {
    if (!blocks || blocks.length === 0) return '';

    // If API returns HTML directly, use it
    if (typeof blocks === 'string') return blocks;

    // Otherwise, try to extract text content
    try {
      return blocks.map(block => {
        if (block.text) return block.text;
        if (block.children) return convertBlocksToHtml(block.children);
        return '';
      }).join('\n');
    } catch (error) {
      return '';
    }
  };

  // Save document content
  const saveDocument = useCallback(async (htmlContent: string) => {
    if (!currentDocumentId) return;

    try {
      setSaveStatus('saving');

      await api.post('/Admin/Document/AddDocumentRevision', {
        documentId: currentDocumentId,
        content: {
          children: [{ text: htmlContent }], // Simplified structure
        },
      });

      setSaveStatus('saved');
      setLastSaved(new Date());

      // Reset to idle after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save document:', error);
      setSaveStatus('error');

      // Reset to idle after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [currentDocumentId]);

  // Handle content change with auto-save
  const handleContentChange = (value: string) => {
    setContent(value);

    // Skip auto-save on first load
    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
      return;
    }

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save (600ms like old project)
    saveTimeoutRef.current = setTimeout(() => {
      saveDocument(value);
    }, 600);
  };

  // Handle focus - create document if it doesn't exist
  const handleFocus = async () => {
    if (currentDocumentId) return; // Document already exists

    try {
      setSaveStatus('saving');
      const response = await api.post('/Admin/Document/AddDocument', {
        isPublic: true,
      });

      const newDocumentId = response.id;
      setCurrentDocumentId(newDocumentId);

      // Update product with new documentId
      await api.post('/Admin/ProductEditor/SetProductDetail', {
        id: productId,
        descriptionId: newDocumentId,
      });

      onDocumentCreated?.(newDocumentId);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to create document:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const getStatusDisplay = () => {
    switch (saveStatus) {
      case 'saving':
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: 'Saving...',
          color: 'text-blue-600',
        };
      case 'saved':
        return {
          icon: <Check className="w-4 h-4" />,
          text: 'Saved',
          color: 'text-green-600',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: 'Save failed',
          color: 'text-red-600',
        };
      default:
        return lastSaved
          ? {
              icon: null,
              text: `Last saved ${getTimeAgo(lastSaved)}`,
              color: 'text-gray-500',
            }
          : null;
    }
  };

  const statusDisplay = getStatusDisplay();

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      [{ color: [] }, { background: [] }],
      ['link'],
      ['clean'],
    ],
    clipboard: {
      matchVisual: false,
    },
  };

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'align',
    'color',
    'background',
    'link',
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 border border-gray-300 rounded-lg bg-gray-50">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400 mr-2" />
        <span className="text-sm text-gray-500">Loading description...</span>
      </div>
    );
  }

  return (
    <div className={`product-description-editor ${className}`}>
      {/* Status Indicator */}
      {statusDisplay && (
        <div className={`flex items-center gap-2 mb-2 text-sm ${statusDisplay.color}`}>
          {statusDisplay.icon}
          <span>{statusDisplay.text}</span>
        </div>
      )}

      {/* Rich Text Editor */}
      <div className="rich-text-wrapper">
        <style jsx global>{`
          .product-description-editor .quill {
            background: white;
            border-radius: 0.5rem;
          }

          .product-description-editor .ql-toolbar {
            border: 1px solid #d1d5db;
            border-top-left-radius: 0.5rem;
            border-top-right-radius: 0.5rem;
            background: #f9fafb;
            padding: 8px;
          }

          .product-description-editor .ql-container {
            border: 1px solid #d1d5db;
            border-top: none;
            border-bottom-left-radius: 0.5rem;
            border-bottom-right-radius: 0.5rem;
            font-size: 14px;
            min-height: 200px;
          }

          .product-description-editor .ql-editor {
            min-height: 200px;
            max-height: 400px;
            overflow-y: auto;
          }

          .product-description-editor .ql-editor.ql-blank::before {
            color: #9ca3af;
            font-style: normal;
          }

          .product-description-editor .ql-toolbar button:hover,
          .product-description-editor .ql-toolbar button:focus,
          .product-description-editor .ql-toolbar button.ql-active {
            color: #7c3aed;
          }

          .product-description-editor .ql-toolbar .ql-stroke {
            stroke: #4b5563;
          }

          .product-description-editor .ql-toolbar .ql-fill {
            fill: #4b5563;
          }

          .product-description-editor .ql-toolbar button:hover .ql-stroke,
          .product-description-editor .ql-toolbar button:focus .ql-stroke,
          .product-description-editor .ql-toolbar button.ql-active .ql-stroke {
            stroke: #7c3aed;
          }

          .product-description-editor .ql-toolbar button:hover .ql-fill,
          .product-description-editor .ql-toolbar button:focus .ql-fill,
          .product-description-editor .ql-toolbar button.ql-active .ql-fill {
            fill: #7c3aed;
          }

          .product-description-editor .ql-picker-label:hover,
          .product-description-editor .ql-picker-item:hover {
            color: #7c3aed;
          }

          .product-description-editor .ql-editor a {
            color: #2563eb;
            text-decoration: underline;
          }

          .product-description-editor .ql-editor ul,
          .product-description-editor .ql-editor ol {
            padding-left: 1.5em;
          }

          .product-description-editor .ql-container:focus-within {
            border-color: #7c3aed;
            box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
          }
        `}</style>

        <ReactQuill
          theme="snow"
          value={content}
          onChange={handleContentChange}
          onFocus={handleFocus}
          modules={modules}
          formats={formats}
          placeholder="Click to start writing product description..."
        />
      </div>
    </div>
  );
};

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 120) return '1 minute ago';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 7200) return '1 hour ago';
  return `${Math.floor(seconds / 3600)} hours ago`;
}
