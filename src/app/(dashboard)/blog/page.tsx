'use client';
import React from 'react';
import { STRINGS } from '../../../constants/strings';

export default function BlogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{STRINGS.NAVIGATION.BLOG}</h1>
        <p className="text-gray-600 mt-1">Manage blog content</p>
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Blog Management</h3>
          <p className="text-gray-500">This page will contain your blog management interface.</p>
        </div>
      </div>
    </div>
  );
}