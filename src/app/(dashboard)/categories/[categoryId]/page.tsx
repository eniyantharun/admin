'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCategory } from '@/hooks/api/useCategory';
import { CategoryCRUDService } from '@/lib/services/category';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { ProductStatsDisplay } from '@/components/category/ProductStatsDisplay';
import { SlugManager } from '@/components/category/SlugManager';
import { ParentSelector } from '@/components/category/ParentSelector';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CategoryEditorPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = parseInt((params?.categoryId as string) || '0');

  // Fetch category
  const { category, loading: categoryLoading, refetch } = useCategory(categoryId);

  // Form state
  const [formData, setFormData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Initialize form from category
  useEffect(() => {
    if (category) {
      setFormData({
        name: category?.general?.form?.name,
        slug: category.general.form.slug,
        slugAliases: category.seo.slugAliases || [],
        parentId: category.general.form.parentId,
        parentName: category.general.form.parentName,
        introduction: category.general.form.introduction || '',
        enabled: category.general.form.enabled,
        featured: category.general.form.featured,
        isMainCategory: category.general.form.isMainCategory,
        metaTitle: category.seo.form.metaTitle || '',
        metaDescription: category.seo.form.metaDescription || '',
        personalNotes: category.notes.personalNotes || '',
      });
    }
  }, [category]);

  const handleSave = async () => {
    if (!formData) return;

    setSaving(true);
    try {
      await CategoryCRUDService.updateCategory(categoryId, {
        general: {
          name: formData.name,
          slug: formData.slug,
          parentId: formData.parentId,
          introduction: formData.introduction || null,
          enabled: formData.enabled,
          featured: formData.featured,
          isMainCategory: formData.isMainCategory,
        },
        seo: {
          metaTitle: formData.metaTitle || null,
          metaDescription: formData.metaDescription || null,
          slugAliases: formData.slugAliases || [],
        },
        notes: {
          personalNotes: formData.personalNotes || null,
        },
      });

      toast.success('Category saved successfully');
      refetch();
    } catch (error) {
      console.error('Failed to save category:', error);
      toast.error('Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => prev ? { ...prev, [field]: value } : null);
  };

  if (categoryLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-gray-500">Loading category...</div>
        </div>
      </div>
    );
  }

  if (!category || !formData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-red-600">Category not found</div>
          <Button onClick={() => router.push('/categories')} className="mt-4">
            Back to Categories
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push('/categories')}
            variant="secondary"
            icon={ArrowLeft}
            iconOnly
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
            <p className="text-gray-600 text-sm mt-1">Category ID: {categoryId}</p>
          </div>
        </div>

        <Button
          onClick={handleSave}
          variant="primary"
          icon={Save}
          loading={saving}
          disabled={saving}
        >
          Save Changes
        </Button>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* General Tab */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">General Information</h2>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <ParentSelector
                currentCategoryId={categoryId}
                selectedParentId={formData.parentId}
                onParentChange={(parentId, parentName) => {
                  handleInputChange('parentId', parentId);
                  handleInputChange('parentName', parentName);
                }}
              />

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => handleInputChange('enabled', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Enabled</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Featured</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isMainCategory}
                    onChange={(e) => handleInputChange('isMainCategory', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Main Category</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Introduction
                </label>
                <RichTextEditor
                  value={formData.introduction}
                  onChange={(value) => handleInputChange('introduction', value)}
                  placeholder="Enter category introduction..."
                />
              </div>
            </div>

            {/* Product Stats Column */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Product Count</h3>
              <ProductStatsDisplay categoryId={categoryId} />
            </div>
          </div>
        </Card>

        {/* SEO Tab */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO</h2>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Max 70 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Max 160 characters"
                />
              </div>
            </div>

            <div>
              <SlugManager
                primarySlug={formData.slug}
                slugAliases={formData.slugAliases || []}
                onPrimarySlugChange={(slug) => handleInputChange('slug', slug)}
                onAliasesChange={(aliases) => handleInputChange('slugAliases', aliases)}
                disabled={!categoryId}
              />
            </div>
          </div>
        </Card>

        {/* Personal Notes Tab */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Notes</h2>

          <RichTextEditor
            value={formData.personalNotes}
            onChange={(value) => handleInputChange('personalNotes', value)}
            placeholder="Internal notes (not visible to customers)..."
          />
        </Card>
      </div>
    </div>
  );
}
