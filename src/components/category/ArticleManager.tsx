'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Plus } from 'lucide-react';

interface Article {
  id: string;
  title: string;
}

interface ArticleManagerProps {
  articles: Article[];
  onChange: (articles: Article[]) => void;
}

export function ArticleManager({ articles, onChange }: ArticleManagerProps) {
  const [newArticleTitle, setNewArticleTitle] = useState('');

  const handleAdd = () => {
    if (newArticleTitle.trim()) {
      onChange([
        ...articles,
        { id: Date.now().toString(), title: newArticleTitle.trim() },
      ]);
      setNewArticleTitle('');
    }
  };

  const handleRemove = (id: string) => {
    onChange(articles.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700">Articles</h3>

      {articles.length === 0 && (
        <p className="text-sm text-gray-400 italic">No articles</p>
      )}

      {articles.length > 0 && (
        <div className="space-y-2">
          {articles.map(article => (
            <div
              key={article.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <p className="text-sm text-gray-900">{article.title}</p>
              <button
                onClick={() => handleRemove(article.id)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newArticleTitle}
          onChange={(e) => setNewArticleTitle(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="Article title..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        />
        <Button
          onClick={handleAdd}
          variant="secondary"
          icon={Plus}
          type="button"
        >
          Add
        </Button>
      </div>
    </div>
  );
}
