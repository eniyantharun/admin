'use client';

import React, { useState, KeyboardEvent } from 'react';
import { X, ChevronDown, Tag } from 'lucide-react';

interface FeatureGroup {
  title: string;
  tags: string[];
  collapsed: boolean;
}

interface ApiFeature {
  name: string;
  features: Array<{ id: number; name: string }>;
}

interface ProductFeaturesProps {
  initialFeatures?: FeatureGroup[];
  apiFeatures?: ApiFeature[];
  onChange?: (features: FeatureGroup[]) => void;
}

export const ProductFeatures: React.FC<ProductFeaturesProps> = ({
  initialFeatures = [],
  apiFeatures = [],
  onChange,
}) => {
  const [features, setFeatures] = useState<FeatureGroup[]>(() => {
    // If API features are provided, use them
    if (apiFeatures && apiFeatures.length > 0) {
      return apiFeatures.map(group => ({
        title: group.name,
        tags: group.features.map(f => f.name),
        collapsed: false,
      }));
    }
    // Otherwise use initialFeatures or default
    return initialFeatures.length > 0 ? initialFeatures : [
      { title: 'Pen & Writing', tags: ['Black Ink'], collapsed: false },
      { title: 'Product Eco-Friendly Certifications', tags: ['Prop 65 Compliant'], collapsed: false },
      { title: 'Other', tags: ['New Product'], collapsed: false },
    ];
  });
  const [inputValue, setInputValue] = useState('');

  const handleAddTag = () => {
    if (!inputValue.trim()) return;

    const updatedFeatures = [...features];
    if (updatedFeatures.length > 0) {
      updatedFeatures[0].tags.push(inputValue.trim());
      setFeatures(updatedFeatures);
      onChange?.(updatedFeatures);
    }
    setInputValue('');
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  };

  const handleRemoveTag = (groupIndex: number, tagIndex: number) => {
    const updatedFeatures = [...features];
    updatedFeatures[groupIndex].tags.splice(tagIndex, 1);
    setFeatures(updatedFeatures);
    onChange?.(updatedFeatures);
  };

  const toggleGroup = (index: number) => {
    const updatedFeatures = [...features];
    updatedFeatures[index].collapsed = !updatedFeatures[index].collapsed;
    setFeatures(updatedFeatures);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Tag className="w-5 h-5 text-blue-600" />
        Features
      </h3>

      <div className="mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type feature and press Enter to add..."
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
        />
      </div>

      <div className="space-y-3">
        {features.map((group, groupIndex) => (
          <div key={groupIndex} className="feature-group">
            <div
              className="flex items-center justify-between py-2 cursor-pointer select-none hover:text-blue-600 transition-colors duration-200"
              onClick={() => toggleGroup(groupIndex)}
            >
              <span className="text-sm font-semibold text-gray-800">{group.title}</span>
              <ChevronDown
                className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                  group.collapsed ? '-rotate-90' : ''
                }`}
              />
            </div>

            {!group.collapsed && (
              <div className="flex flex-wrap gap-2 mt-2 ml-1">
                {group.tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-xs text-gray-700 hover:bg-gray-200 hover:border-gray-300 transition-all duration-200 group"
                  >
                    {tag}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTag(groupIndex, tagIndex);
                      }}
                      className="flex items-center justify-center w-4 h-4 rounded-full bg-gray-300 text-white hover:bg-red-400 transition-all duration-200 group-hover:scale-110"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
