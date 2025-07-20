'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ListView } from '@/components/ui/ListView';
import { Search, Plus, Edit2, Phone, Mail, Building, Calendar, User } from 'lucide-react';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  joinedDate: string;
}

const mockCustomers: Customer[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    companyName: 'Acme Corp',
    joinedDate: '2024-01-15',
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+1 (555) 987-6543',
    companyName: 'Tech Solutions Inc',
    joinedDate: '2024-02-20',
  },
];

const CustomerItem: React.FC<{ customer: Customer }> = ({ customer }) => (
  <Card className="customers-list-item p-4">
    <div className="customers-item-content flex items-center justify-between">
      <div className="customers-item-info flex items-center space-x-4">
        <div className="customers-item-avatar w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
          <User className="customers-avatar-icon w-5 h-5 text-primary-600" />
        </div>
        <div className="customers-item-details">
          <h3 className="customers-item-name text-sm font-semibold text-secondary-900">
            {customer.firstName} {customer.lastName}
          </h3>
          <div className="customers-item-contact flex items-center space-x-4 mt-1">
            <div className="customers-item-email flex items-center space-x-1">
              <Mail className="customers-email-icon w-3 h-3 text-secondary-400" />
              <span className="customers-email-text text-xs text-secondary-600">{customer.email}</span>
            </div>
            <div className="customers-item-phone flex items-center space-x-1">
              <Phone className="customers-phone-icon w-3 h-3 text-secondary-400" />
              <span className="customers-phone-text text-xs text-secondary-600">{customer.phone}</span>
            </div>
          </div>
          <div className="customers-item-meta flex items-center space-x-4 mt-1">
            <div className="customers-item-company flex items-center space-x-1">
              <Building className="customers-company-icon w-3 h-3 text-secondary-400" />
              <span className="customers-company-text text-xs text-secondary-600">{customer.companyName}</span>
            </div>
            <div className="customers-item-joined flex items-center space-x-1">
              <Calendar className="customers-joined-icon w-3 h-3 text-secondary-400" />
              <span className="customers-joined-text text-xs text-secondary-600">Joined {customer.joinedDate}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="customers-item-actions">
        <Button
          variant="secondary"
          size="sm"
          icon={Edit2}
          iconOnly
          className="customers-edit-button"
        />
      </div>
    </div>
  </Card>
);

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers] = useState<Customer[]>(mockCustomers);

  const filteredCustomers = customers.filter(customer =>
    customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="customers-page-container space-y-6">
      <div className="customers-page-header">
        <h1 className="customers-page-title text-2xl font-bold text-secondary-900">Customers</h1>
        <p className="customers-page-subtitle text-secondary-600 mt-1">
          Manage your customer database
        </p>
      </div>

      <Card className="customers-page-toolbar p-4">
        <div className="customers-toolbar-content flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="customers-search-wrapper relative flex-1 max-w-md">
            <Search className="customers-search-icon absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="customers-search-input w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <Button
            icon={Plus}
            className="customers-add-button"
          >
            Add Customer
          </Button>
        </div>
      </Card>

      <Card className="customers-page-list">
        <div className="customers-list-header p-4 border-b border-secondary-200">
          <h3 className="customers-list-title text-lg font-semibold text-secondary-900">
            Customer List ({filteredCustomers.length})
          </h3>
        </div>
        <div className="customers-list-content p-4">
          <ListView
            items={filteredCustomers}
            keyExtractor={(customer) => customer.id}
            renderItem={(customer) => <CustomerItem customer={customer} />}
            emptyComponent={
              <div className="customers-empty-state text-center py-8">
                <User className="customers-empty-icon w-12 h-12 mx-auto text-secondary-300 mb-4" />
                <h3 className="customers-empty-title text-lg font-medium text-secondary-900 mb-2">
                  No customers found
                </h3>
                <p className="customers-empty-description text-secondary-500">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first customer.'}
                </p>
              </div>
            }
            className="customers-list-items"
          />
        </div>
      </Card>
    </div>
  );
}