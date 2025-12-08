'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Palette, GripVertical, Check } from 'lucide-react';

interface Color {
  id: string;
  name: string;
  hex: string;
}

interface ApiColor {
  id: string;
  name: string;
  colors: number[];
}

interface ProductColorsProps {
  initialColors?: Color[];
  apiColors?: ApiColor[];
  onChange?: (colors: Color[]) => void;
  onCreate?: (color: { name: string }) => Promise<void>;  // Removed hexCode - not in create API
  onUpdate?: (colorId: string, updates: { name?: string; hex?: string[] }) => Promise<void>;  // Changed to string, hex array
  onDelete?: (colorId: number) => Promise<void>;
}

const PREDEFINED_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Green', hex: '#008000' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Yellow', hex: '#FFFF00' },
];

// Helper function to convert integer color to hex
const intToHex = (colorInt: number): string => {
  if (!colorInt && colorInt !== 0) return '#808080';
  const hex = colorInt.toString(16).padStart(6, '0');
  return `#${hex}`;
};

export const ProductColors: React.FC<ProductColorsProps> = ({
  initialColors = [],
  apiColors = [],
  onChange,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  const [colors, setColors] = useState<Color[]>(() => {
    // If API colors are provided, use them
    if (apiColors && apiColors.length > 0) {
      return apiColors.map(color => ({
        id: color.id,
        name: color.name,
        hex: color.colors && color.colors.length > 0 ? intToHex(color.colors[0]) : '#808080',
      }));
    }
    // Otherwise use initialColors or default
    return initialColors.length > 0 ? initialColors : [
      { id: '1', name: 'Aluminum', hex: '#C0C0C0' }
    ];
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addColor = async (name: string = '', hex: string = '#808080') => {
    const newColor: Color = {
      id: Date.now().toString(),
      name,
      hex,
    };

    // If onCreate callback is provided, use API
    if (onCreate) {
      try {
        await onCreate({ name });  // Only name - hexCode not in create API
        // API will refresh the list
      } catch (error) {
        console.error('Failed to create color:', error);
      }
    } else {
      // Fallback to local state
      const updatedColors = [...colors, newColor];
      setColors(updatedColors);
      setEditingId(newColor.id);
      onChange?.(updatedColors);
    }
  };

  const updateColorLocal = async (id: string, field: 'name' | 'hex', value: string) => {
    const color = colors.find(c => c.id === id);
    if (!color) return;

    // If onUpdate callback is provided, use API
    if (onUpdate) {
      try {
        // API expects colorOptionId as string, and hex as array of strings
        await onUpdate(id, {
          ...(field === 'name' ? { name: value } : { hex: [value] }),
        });
        showSavedIndicator(id);
      } catch (error) {
        console.error('Failed to update color:', error);
      }
    } else {
      // Fallback to local state
      const updatedColors = colors.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      );
      setColors(updatedColors);
      onChange?.(updatedColors);
      showSavedIndicator(id);
    }
  };

  const deleteColorLocal = async (id: string) => {
    if (confirm('Are you sure you want to delete this color?')) {
      // If onDelete callback is provided, use API
      if (onDelete) {
        try {
          await onDelete(Number(id));
          // API will refresh the list
        } catch (error) {
          console.error('Failed to delete color:', error);
        }
      } else {
        // Fallback to local state
        const updatedColors = colors.filter((color) => color.id !== id);
        setColors(updatedColors);
        onChange?.(updatedColors);
      }
    }
  };

  const selectPredefinedColor = (name: string, hex: string) => {
    addColor(name, hex);
    setShowDropdown(false);
  };

  const showSavedIndicator = (id: string) => {
    setSavedId(id);
    setTimeout(() => setSavedId(null), 2000);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Palette className="w-5 h-5 text-purple-600" />
        Colors
      </h3>

      <div className="space-y-3 mb-4">
        {colors.map((color) => (
          <div
            key={color.id}
            className={`flex items-center gap-3 p-3 border rounded-lg transition-all duration-200 ${
              editingId === color.id
                ? 'bg-white border-blue-400 shadow-sm ring-2 ring-blue-100'
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
            }`}
          >
            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0" />

            <input
              type="text"
              value={color.name}
              onChange={(e) => updateColorLocal(color.id, 'name', e.target.value)}
              onFocus={() => setEditingId(color.id)}
              onBlur={() => setEditingId(null)}
              placeholder="Enter color name..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
            />

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const input = document.getElementById(`color-picker-${color.id}`) as HTMLInputElement;
                  input?.click();
                }}
                className="flex items-center justify-center w-8 h-8 bg-white border border-gray-300 rounded-md text-gray-600 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
              </button>
              <input
                id={`color-picker-${color.id}`}
                type="color"
                value={color.hex}
                onChange={(e) => updateColorLocal(color.id, 'hex', e.target.value)}
                className="w-10 h-10 border-2 border-gray-300 rounded-md cursor-pointer hover:border-blue-500 transition-all duration-200"
              />
            </div>

            <div className="w-16 flex-shrink-0">
              {savedId === color.id && (
                <span className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                  <Check className="w-3 h-3" />
                  Saved
                </span>
              )}
            </div>

            <button
              onClick={() => deleteColorLocal(color.id)}
              className="flex items-center justify-center w-8 h-8 bg-white border border-gray-300 rounded-md text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="relative mb-4" ref={dropdownRef}>
        <input
          type="text"
          readOnly
          onClick={() => setShowDropdown(!showDropdown)}
          placeholder="Select a color or type to add..."
          className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 outline-none"
        />

        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto z-10">
            {PREDEFINED_COLORS.map((color) => (
              <div
                key={color.name}
                onClick={() => selectPredefinedColor(color.name, color.hex)}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
              >
                <div
                  className="w-6 h-6 rounded border border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="text-sm text-gray-800">{color.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => addColor()}
        className="w-full py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg text-sm font-semibold text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200"
      >
        + ADD
      </button>
    </div>
  );
};
