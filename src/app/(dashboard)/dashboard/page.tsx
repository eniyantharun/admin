'use client';

import React from 'react';
import { BarChart3, Users, ShoppingCart, TrendingUp } from 'lucide-react';
import { useAppSelector } from '@/shared/hooks/redux';
import { STRINGS } from '@/constants/strings';

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ComponentType<any>;
  trend?: string;
}> = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <p className="text-sm text-green-600 mt-1">{trend}</p>
        )}
      </div>
      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
        <Icon className="w-6 h-6 text-primary-600" />
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{STRINGS.DASHBOARD.TITLE}</h1>
        <p className="text-gray-600 mt-1">
          {STRINGS.COMMON.WELCOME}, {user?.username}! {STRINGS.DASHBOARD.WELCOME_MESSAGE}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sales"
          value="$45,231"
          icon={TrendingUp}
          trend="+20.1% from last month"
        />
        <StatCard
          title="Orders"
          value="1,234"
          icon={ShoppingCart}
          trend="+12.5% from last month"
        />
        <StatCard
          title="Customers"
          value="2,451"
          icon={Users}
          trend="+8.2% from last month"
        />
        <StatCard
          title="Products"
          value="567"
          icon={BarChart3}
          trend="+3.1% from last month"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">Order #{1000 + item}</p>
                  <p className="text-sm text-gray-500">Customer {item}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${(Math.random() * 500 + 50).toFixed(2)}</p>
                  <p className="text-xs text-green-600">Completed</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
          <div className="space-y-3">
            {['Laptop Pro', 'Wireless Headphones', 'Smart Watch', 'Tablet', 'Phone Case'].map((product, index) => (
              <div key={product} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{product}</p>
                  <p className="text-sm text-gray-500">{Math.floor(Math.random() * 100 + 20)} sold</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${(Math.random() * 1000 + 100).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}