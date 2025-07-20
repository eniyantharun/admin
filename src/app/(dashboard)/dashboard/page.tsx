'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { BarChart3, Users, ShoppingCart, TrendingUp } from 'lucide-react';

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ComponentType<any>;
  trend?: string;
}> = ({ title, value, icon: Icon, trend }) => (
  <Card className="dashboard-stat-card p-6">
    <div className="dashboard-stat-content flex items-center justify-between">
      <div className="dashboard-stat-info">
        <p className="dashboard-stat-title text-sm font-medium text-secondary-600">{title}</p>
        <p className="dashboard-stat-value text-2xl font-bold text-secondary-900">{value}</p>
        {trend && <p className="dashboard-stat-trend text-sm text-success-600 mt-1">{trend}</p>}
      </div>
      <div className="dashboard-stat-icon-wrapper w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
        <Icon className="dashboard-stat-icon w-6 h-6 text-primary-600" />
      </div>
    </div>
  </Card>
);

export default function DashboardPage() {
  return (
    <div className="dashboard-page-container space-y-6">
      <div className="dashboard-page-header">
        <h1 className="dashboard-page-title text-2xl font-bold text-secondary-900">Dashboard</h1>
        <p className="dashboard-page-subtitle text-secondary-600 mt-1">
          Welcome back! Here's what's happening with your business today.
        </p>
      </div>

      <div className="dashboard-stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="dashboard-details-grid grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="dashboard-recent-orders p-6">
          <h3 className="dashboard-recent-orders-title text-lg font-semibold text-secondary-900 mb-4">
            Recent Orders
          </h3>
          <div className="dashboard-recent-orders-list space-y-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="dashboard-order-item flex items-center justify-between py-2 border-b border-secondary-100 last:border-b-0"
              >
                <div className="dashboard-order-info">
                  <p className="dashboard-order-number font-medium text-secondary-900">
                    Order #{1000 + item}
                  </p>
                  <p className="dashboard-order-customer text-sm text-secondary-500">Customer {item}</p>
                </div>
                <div className="dashboard-order-details text-right">
                  <p className="dashboard-order-amount font-medium text-secondary-900">
                    ${(Math.random() * 500 + 50).toFixed(2)}
                  </p>
                  <p className="dashboard-order-status text-xs text-success-600">Completed</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="dashboard-top-products p-6">
          <h3 className="dashboard-top-products-title text-lg font-semibold text-secondary-900 mb-4">
            Top Products
          </h3>
          <div className="dashboard-top-products-list space-y-3">
            {['Laptop Pro', 'Wireless Headphones', 'Smart Watch', 'Tablet', 'Phone Case'].map(
              (product, index) => (
                <div
                  key={product}
                  className="dashboard-product-item flex items-center justify-between py-2 border-b border-secondary-100 last:border-b-0"
                >
                  <div className="dashboard-product-info">
                    <p className="dashboard-product-name font-medium text-secondary-900">{product}</p>
                    <p className="dashboard-product-sales text-sm text-secondary-500">
                      {Math.floor(Math.random() * 100 + 20)} sold
                    </p>
                  </div>
                  <div className="dashboard-product-details text-right">
                    <p className="dashboard-product-revenue font-medium text-secondary-900">
                      ${(Math.random() * 1000 + 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}