'use client';
import React from 'react';
import { STRINGS } from '../../../constants/strings';

export default function SuppliersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{STRINGS.NAVIGATION.SUPPLIERS}</h1>
        <p className="text-gray-600 mt-1">Manage your suppliers</p>
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Suppliers Management</h3>
          <p className="text-gray-500">This page will contain your suppliers management interface.</p>
        </div>
      </div>
    </div>
  );
}