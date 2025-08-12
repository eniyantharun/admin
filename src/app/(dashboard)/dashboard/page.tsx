'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, TrendingUp, TrendingDown, DollarSign, ShoppingCart, FileText, Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { DashboardService } from '@/lib/api';
import { showToast } from '@/components/ui/toast';
import { Header } from '@/components/layout/Header';

interface DashboardData {
  date: string;
  paidCount: number;
  unpaidCount: number;
  convertedQuotesCount: number;
  pendingQuotesCount: number;
  paidGrossValue: number;
  unpaidGrossValue: number;
}

interface OrderStatistics {
  previousMonth: string;
  previousMonthStart: string;
  previousMonthEnd: string;
  previousYearMonth: string;
  previousYearMonthStart: string;
  previousYearMonthEnd: string;
  customerOrders: {
    count: number;
    totalGrossValue: number;
    previousYearCount: number;
    previousYearTotalGrossValue: number;
    countChangePercentage: number;
    grossValueChangePercentage: number;
  };
  adminOrders: {
    count: number;
    totalGrossValue: number;
    previousYearCount: number;
    previousYearTotalGrossValue: number;
    countChangePercentage: number;
    grossValueChangePercentage: number;
  };
  convertedQuoteOrders: {
    count: number;
    totalGrossValue: number;
    previousYearCount: number;
    previousYearTotalGrossValue: number;
    countChangePercentage: number;
    grossValueChangePercentage: number;
  };
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData[]>([]);
  const [orderStats, setOrderStats] = useState<OrderStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);
        const endDate = new Date();
        
        const [dashboardResponse, statsResponse] = await Promise.all([
          DashboardService.getDashboardOrders(
            startDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
            endDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
          ),
          DashboardService.getOrderStatistics(
            endDate.toISOString().split('T')[0]
          )
        ]);

        setDashboardData(dashboardResponse.dates || []);
        setOrderStats(statsResponse.dates || null);
      } catch (error) {
        showToast.error('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getTotalStats = () => {
    if (!dashboardData.length) return { totalPaid: 0, totalUnpaid: 0, totalQuotes: 0, totalValue: 0 };
    
    return dashboardData.reduce((acc, item) => ({
      totalPaid: acc.totalPaid + item.paidCount,
      totalUnpaid: acc.totalUnpaid + item.unpaidCount,
      totalQuotes: acc.totalQuotes + item.convertedQuotesCount + item.pendingQuotesCount,
      totalValue: acc.totalValue + item.paidGrossValue + item.unpaidGrossValue
    }), { totalPaid: 0, totalUnpaid: 0, totalQuotes: 0, totalValue: 0 });
  };

  const totalStats = getTotalStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        contextData={{
          totalCount: 0,
          searchTerm: '',
          onSearchChange: () => {},
          onAddNew: () => {},
          filters: []
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{totalStats.totalPaid + totalStats.totalUnpaid}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">${totalStats.totalValue.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Quotes</p>
                <p className="text-2xl font-bold text-gray-900">{totalStats.totalQuotes}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Paid Orders</p>
                <p className="text-2xl font-bold text-gray-900">{totalStats.totalPaid}</p>
              </div>
            </div>
          </Card>
        </div>

        {orderStats && (
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Orders</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">This Month:</span>
                  <span className="font-semibold">{orderStats.customerOrders.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Value:</span>
                  <span className="font-semibold">${orderStats.customerOrders.totalGrossValue.toLocaleString()}</span>
                </div>
                <div className="flex items-center text-sm">
                  {orderStats.customerOrders.countChangePercentage >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={orderStats.customerOrders.countChangePercentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {Math.abs(orderStats.customerOrders.countChangePercentage)}% vs last year
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Orders</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">This Month:</span>
                  <span className="font-semibold">{orderStats.adminOrders.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Value:</span>
                  <span className="font-semibold">${orderStats.adminOrders.totalGrossValue.toLocaleString()}</span>
                </div>
                <div className="flex items-center text-sm">
                  {orderStats.adminOrders.countChangePercentage >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={orderStats.adminOrders.countChangePercentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {Math.abs(orderStats.adminOrders.countChangePercentage)}% vs last year
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Converted Quotes</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">This Month:</span>
                  <span className="font-semibold">{orderStats.convertedQuoteOrders.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Value:</span>
                  <span className="font-semibold">${orderStats.convertedQuoteOrders.totalGrossValue.toLocaleString()}</span>
                </div>
                <div className="flex items-center text-sm">
                  {orderStats.convertedQuoteOrders.countChangePercentage >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={orderStats.convertedQuoteOrders.countChangePercentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {Math.abs(orderStats.convertedQuoteOrders.countChangePercentage)}% vs last year
                  </span>
                </div>
          </div>
            </Card>
          </div>
        )}

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {dashboardData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unpaid Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Converted Quotes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Quotes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData.slice(-10).reverse().map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.paidCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.unpaidCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.convertedQuotesCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.pendingQuotesCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${(item.paidGrossValue + item.unpaidGrossValue).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
        </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent activity data available</p>
          )}
      </Card>
      </div>
    </div>
  );
}