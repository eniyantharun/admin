import React from 'react';
import { Search } from 'lucide-react';

interface SearchStatusIndicatorProps {
  query: string;
}

export const SearchStatusIndicator: React.FC<SearchStatusIndicatorProps> = ({ query }) => (
  <div className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
    <Search className="w-4 h-4" />
    <span>Searching: "{query}"</span>
  </div>
);