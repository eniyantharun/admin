'use client';

import React from 'react';
import { Package, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export default function KeywordsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md mx-auto text-center p-8">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Keywords Module</h1>
          <div className="flex items-center justify-center gap-2 text-orange-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Coming Soon</span>
          </div>
        </div>
        <p className="text-gray-600">
          The Keywords management module is currently under development and will be available soon.
        </p>
      </Card>
    </div>
  );
}