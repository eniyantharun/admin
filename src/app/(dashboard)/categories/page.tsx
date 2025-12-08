'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CategoryTree } from '@/components/category/CategoryTree';

export default function CategoriesPage() {
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    router.push(`/categories/${categoryId}`);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <p className="text-gray-600 mt-1">Manage your product categories</p>
      </div>

      <CategoryTree
        onCategorySelect={handleCategorySelect}
        selectedCategoryId={selectedCategoryId}
      />
    </div>
  );
}
