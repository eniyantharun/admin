'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeTree } from '@/components/theme/ThemeTree';

export default function ThemesPage() {
  const router = useRouter();
  const [selectedThemeId, setSelectedThemeId] = useState<number | null>(null);

  const handleThemeSelect = (themeId: number) => {
    setSelectedThemeId(themeId);
    router.push(`/themes/${themeId}`);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Themes</h1>
        <p className="text-gray-600 mt-1">Manage your product themes</p>
      </div>

      <ThemeTree
        onThemeSelect={handleThemeSelect}
        selectedThemeId={selectedThemeId}
      />
    </div>
  );
}