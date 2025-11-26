'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { X, Plus, Edit2 } from 'lucide-react';

interface ContentTab {
  id: string;
  title: string;
  content: string;
}

interface ContentTabsManagerProps {
  tabs: ContentTab[];
  onChange: (tabs: ContentTab[]) => void;
}

export function ContentTabsManager({ tabs, onChange }: ContentTabsManagerProps) {
  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id || '');
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleAddTab = () => {
    const newTab: ContentTab = {
      id: Date.now().toString(),
      title: `Tab ${tabs.length + 1}`,
      content: '',
    };
    onChange([...tabs, newTab]);
    setActiveTab(newTab.id);
  };

  const handleRemoveTab = (id: string) => {
    const newTabs = tabs.filter(t => t.id !== id);
    onChange(newTabs);
    if (activeTab === id && newTabs.length > 0) {
      setActiveTab(newTabs[0].id);
    }
  };

  const handleRenameTab = (id: string) => {
    if (editingTitle.trim()) {
      onChange(
        tabs.map(t => (t.id === id ? { ...t, title: editingTitle.trim() } : t))
      );
    }
    setEditingTabId(null);
    setEditingTitle('');
  };

  const handleContentChange = (id: string, content: string) => {
    onChange(tabs.map(t => (t.id === id ? { ...t, content } : t)));
  };

  const activeTabData = tabs.find(t => t.id === activeTab);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Dynamic Content Tabs</h3>
        <Button
          onClick={handleAddTab}
          variant="secondary"
          icon={Plus}
          size="sm"
          type="button"
        >
          Add Tab
        </Button>
      </div>

      {tabs.length === 0 && (
        <p className="text-sm text-gray-400 italic">No content tabs</p>
      )}

      {tabs.length > 0 && (
        <div>
          {/* Tab headers */}
          <div className="flex items-center gap-2 border-b border-gray-200 mb-4">
            {tabs.map(tab => (
              <div
                key={tab.id}
                className={`flex items-center gap-2 px-4 py-2 cursor-pointer border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {editingTabId === tab.id ? (
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={() => handleRenameTab(tab.id)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleRenameTab(tab.id);
                      }
                    }}
                    className="px-2 py-1 text-sm border border-gray-300 rounded"
                    autoFocus
                  />
                ) : (
                  <>
                    <span className="text-sm font-medium">{tab.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTabId(tab.id);
                        setEditingTitle(tab.title);
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                      type="button"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTab(tab.id);
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      type="button"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Tab content */}
          {activeTabData && (
            <div>
              <RichTextEditor
                value={activeTabData.content}
                onChange={(content) => handleContentChange(activeTabData.id, content)}
                placeholder={`Enter content for ${activeTabData.title}...`}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
