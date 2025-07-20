'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  BarChart3, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Package,
  Calendar,
  Activity,
  ExternalLink,
  Eye
} from 'lucide-react';

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ComponentType<any>;
  trend?: string;
  trendDirection?: 'up' | 'down';
  description?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}> = ({ title, value, icon: Icon, trend, trendDirection = 'up', description, color = 'blue' }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-indigo-600',
    green: 'from-green-500 to-emerald-600', 
    purple: 'from-purple-500 to-violet-600',
    orange: 'from-orange-500 to-amber-600',
  };

  const colorBgClasses = {
    blue: 'from-blue-50 to-indigo-50',
    green: 'from-green-50 to-emerald-50',
    purple: 'from-purple-50 to-violet-50', 
    orange: 'from-orange-50 to-amber-50',
  };

  return (
    <Card className="dashboard-stat-card p-6 relative overflow-hidden bg-gradient-to-br from-white via-gray-50/50 to-white border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className={`absolute inset-0 bg-gradient-to-br ${colorBgClasses[color]} opacity-30`}></div>
      
      <div className="dashboard-stat-content relative z-10 flex items-start justify-between">
        <div className="dashboard-stat-info flex-1">
          <p className="dashboard-stat-title text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="dashboard-stat-value text-3xl font-bold text-gray-900 mb-2">{value}</p>
          
          {trend && (
            <div className="dashboard-stat-trend flex items-center space-x-1">
              {trendDirection === 'up' ? (
                <ArrowUpRight className="w-4 h-4 text-green-600" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${
                trendDirection === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend}
              </span>
            </div>
          )}
          
          {description && (
            <p className="dashboard-stat-description text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        
        <div className={`dashboard-stat-icon-wrapper w-14 h-14 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon className="dashboard-stat-icon w-7 h-7 text-white drop-shadow-sm" />
        </div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 transform translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000"></div>
    </Card>
  );
};

const ActivityItem: React.FC<{
  title: string;
  description: string;
  time: string;
  type: 'order' | 'customer' | 'product' | 'system';
}> = ({ title, description, time, type }) => {
  const typeIcons = {
    order: ShoppingCart,
    customer: Users,
    product: Package,
    system: Activity,
  };

  const typeColors = {
    order: 'bg-blue-100 text-blue-600',
    customer: 'bg-green-100 text-green-600', 
    product: 'bg-purple-100 text-purple-600',
    system: 'bg-orange-100 text-orange-600',
  };

  const Icon = typeIcons[type];

  return (
    <div className="dashboard-activity-item flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50/80 transition-colors duration-200">
      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[type]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const recentActivities = [
    {
      title: 'New Order #ORD-2025-001',
      description: 'Order placed by John Doe - $299.99',
      time: '2 minutes ago',
      type: 'order' as const,
    },
    {
      title: 'New Customer Registration',
      description: 'Jane Smith joined from promotional campaign',
      time: '15 minutes ago',
      type: 'customer' as const,
    },
    {
      title: 'Product Updated',
      description: 'Custom Branded Pens - inventory updated',
      time: '1 hour ago',
      type: 'product' as const,
    },
    {
      title: 'System Backup Completed',
      description: 'Daily backup process finished successfully',
      time: '2 hours ago',
      type: 'system' as const,
    },
  ];

  const topProducts = [
    { name: 'Custom Branded Pens', sales: 234, revenue: 4680, trend: '+12%' },
    { name: 'Logo Printed T-Shirts', sales: 189, revenue: 3780, trend: '+8%' },
    { name: 'Promotional Mugs', sales: 156, revenue: 2340, trend: '+15%' },
    { name: 'Business Card Holders', sales: 142, revenue: 2130, trend: '+5%' },
    { name: 'Branded USB Drives', sales: 98, revenue: 1960, trend: '+22%' },
  ];

  return (
    <div className="dashboard-page-container space-y-8 h-full">
      <div className="dashboard-page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="dashboard-page-title text-3xl font-bold text-gray-900 mb-2">
              Welcome back! 👋
            </h1>
            <p className="dashboard-page-subtitle text-gray-600">
              Here's what's happening with your business today.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              icon={Calendar}
              variant="secondary"
              className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-blue-50 shadow-sm"
            >
              Last 30 days
            </Button>
            <Button
              icon={ExternalLink}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
            >
              View Reports
            </Button>
          </div>
        </div>
      </div>

      <div className="dashboard-stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value="$45,231"
          icon={DollarSign}
          trend="+20.1% from last month"
          description="Monthly recurring revenue"
          color="green"
        />
        <StatCard
          title="Total Orders"
          value="1,234"
          icon={ShoppingCart}
          trend="+12.5% from last month" 
          description="Orders this month"
          color="blue"
        />
        <StatCard
          title="New Customers"
          value="456"
          icon={Users}
          trend="+8.2% from last month"
          description="Customer acquisition"
          color="purple"
        />
        <StatCard
          title="Products Sold"
          value="2,847"
          icon={Package}
          trend="+15.3% from last month"
          description="Units moved this month"
          color="orange"
        />
      </div>

      <div className="dashboard-content-grid grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="dashboard-recent-orders h-full bg-gradient-to-br from-white via-gray-50/50 to-white border border-gray-200/50 shadow-lg">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="dashboard-recent-orders-title text-xl font-bold text-gray-900">
                  Recent Orders
                </h3>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Eye}
                  className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                >
                  View All
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="dashboard-recent-orders-list space-y-4">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div
                    key={item}
                    className="dashboard-order-item flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                  >
                    <div className="dashboard-order-info flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                        <ShoppingCart className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="dashboard-order-number font-semibold text-gray-900">
                          Order #{1000 + item}
                        </p>
                        <p className="dashboard-order-customer text-sm text-gray-500">
                          Customer {item} • 2 items
                        </p>
                      </div>
                    </div>
                    <div className="dashboard-order-details text-right">
                      <p className="dashboard-order-amount font-bold text-gray-900 text-lg">
                        ${(Math.random() * 500 + 50).toFixed(2)}
                      </p>
                      <span className="dashboard-order-status inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="dashboard-activity-feed h-full bg-gradient-to-br from-white via-gray-50/50 to-white border border-gray-200/50 shadow-lg">
            <div className="p-6 border-b border-gray-100">
              <h3 className="dashboard-activity-title text-xl font-bold text-gray-900">
                Recent Activity
              </h3>
            </div>
            <div className="p-6">
              <div className="dashboard-activity-list space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
                {recentActivities.map((activity, index) => (
                  <ActivityItem
                    key={index}
                    title={activity.title}
                    description={activity.description}
                    time={activity.time}
                    type={activity.type}
                  />
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="dashboard-bottom-section grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="dashboard-top-products bg-gradient-to-br from-white via-gray-50/50 to-white border border-gray-200/50 shadow-lg">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="dashboard-top-products-title text-xl font-bold text-gray-900">
                Top Products
              </h3>
              <Button
                variant="secondary" 
                size="sm"
                icon={BarChart3}
                className="bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100"
              >
                Analytics
              </Button>
            </div>
          </div>
          <div className="p-6">
            <div className="dashboard-top-products-list space-y-4">
              {topProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="dashboard-product-item flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200"
                >
                  <div className="dashboard-product-info flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="dashboard-product-name font-semibold text-gray-900">
                        {product.name}
                      </p>
                      <p className="dashboard-product-sales text-sm text-gray-500">
                        {product.sales} sold
                      </p>
                    </div>
                  </div>
                  <div className="dashboard-product-details text-right">
                    <p className="dashboard-product-revenue font-bold text-gray-900">
                      ${product.revenue.toLocaleString()}
                    </p>
                    <span className="text-sm text-green-600 font-medium">
                      {product.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="dashboard-quick-actions bg-gradient-to-br from-white via-gray-50/50 to-white border border-gray-200/50 shadow-lg">
          <div className="p-6 border-b border-gray-100">
            <h3 className="dashboard-quick-actions-title text-xl font-bold text-gray-900">
              Quick Actions
            </h3>
          </div>
          <div className="p-6">
            <div className="dashboard-actions-grid grid grid-cols-2 gap-4">
              <Button
                icon={ShoppingCart}
                className="h-20 flex-col bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
              >
                <span className="text-sm font-medium">New Order</span>
              </Button>
              <Button
                icon={Users}
                className="h-20 flex-col bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg"
              >
                <span className="text-sm font-medium">Add Customer</span>
              </Button>
              <Button
                icon={Package}
                className="h-20 flex-col bg-gradient-to-br from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 shadow-lg"
              >
                <span className="text-sm font-medium">Add Product</span>
              </Button>
              <Button
                icon={BarChart3}
                className="h-20 flex-col bg-gradient-to-br from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg"
              >
                <span className="text-sm font-medium">View Reports</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}