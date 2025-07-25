import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormInput } from '@/components/helpers/FormInput';

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  joinedDate: string;
}

interface Address {
  id: string;
  type: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Comment {
  id: string;
  text: string;
  timestamp: string;
  type: 'manual' | 'auto';
}

interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  enabled: boolean;
}

interface CustomerFormProps {
  customer?: Customer | null;
  isEditing: boolean;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  onSendResetPassword?: (email: string) => Promise<void>;
  onSendNewAccount?: (email: string) => Promise<void>;
  loading?: boolean;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  customer,
  isEditing,
  onSubmit,
  onSendResetPassword,
  onSendNewAccount,
  loading = false
}) => {
  const [formData, setFormData] = useState<CustomerFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    enabled: true
  });
  const [formErrors, setFormErrors] = useState<Partial<CustomerFormData>>({});
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    type: 'Home',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        companyName: customer.companyName,
        enabled: true
      });
      
      if (isEditing) {
        setAddresses([
          {
            id: '1',
            type: 'Office',
            street: '19680 Tree Stand Terrace',
            city: 'Loxahatchee',
            state: 'Florida',
            zipCode: '33470',
            country: 'US'
          }
        ]);
      }
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        companyName: '',
        enabled: true
      });
      setAddresses([]);
      setComments([]);
    }
  }, [customer, isEditing]);

  const validateForm = (): boolean => {
    const errors: Partial<CustomerFormData> = {};
    
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit(formData);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    if (formErrors[name as keyof CustomerFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.street.trim() || !newAddress.city.trim()) return;

    const address: Address = {
      id: Date.now().toString(),
      ...newAddress
    };

    setAddresses(prev => [...prev, address]);
    setNewAddress({
      type: 'Home',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    });
    setShowAddressForm(false);
  };

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: value }));
  };

  const removeAddress = (id: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment,
      timestamp: new Date().toLocaleString(),
      type: 'manual'
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            error={formErrors.firstName}
            required
            placeholder="First Name"
          />
          <FormInput
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            error={formErrors.lastName}
            required
            placeholder="Last Name"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            error={formErrors.email}
            required
            placeholder="email@example.com"
          />
          <FormInput
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="(555) 123-4567"
          />
        </div>

        <FormInput
          label="Company Name"
          name="companyName"
          value={formData.companyName}
          onChange={handleInputChange}
          placeholder="Company Name (Optional)"
        />

        <FormInput
          label="Status"
          name="enabled"
          type="checkbox"
          value={formData.enabled}
          onChange={handleInputChange}
          placeholder="Enable this customer"
        />

        <Button
          type="submit"
          loading={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          {isEditing ? "Update Customer" : "Add Customer"}
        </Button>
      </form>

      {isEditing && customer && (
        <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Email Actions</h4>
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => onSendResetPassword?.(customer.email)} 
              variant="secondary" 
              size="sm"
              icon={Mail}
              className="justify-start"
            >
              Send Reset Password Email
            </Button>
            <Button 
              onClick={() => onSendNewAccount?.(customer.email)} 
              variant="secondary" 
              size="sm"
              icon={Mail}
              className="justify-start"
            >
              Send New Account Email
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Email will be sent to: {customer.email}
          </p>
        </div>
      )}

      {isEditing && (
        <div className="border-t border-gray-200 p-4 sm:p-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Comments</h4>
          
          <form onSubmit={handleCommentSubmit} className="space-y-3 mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              rows={3}
              maxLength={1000}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{newComment.length} / 1000</span>
              <Button type="submit" disabled={!newComment.trim()} variant="secondary" size="sm">
                Add Comment
              </Button>
            </div>
          </form>

          <div className="space-y-3 max-h-48 overflow-y-auto">
            {comments.map((comment) => (
              <Card key={comment.id} className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${
                      comment.type === "auto" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {comment.type === "auto" ? "AUTO" : "MANUAL"}
                    </span>
                    <p className="text-sm text-gray-900">{comment.text}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {comment.timestamp}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {isEditing && (
        <div className="border-t border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-700">Addresses</h4>
            <Button
              onClick={() => setShowAddressForm(!showAddressForm)}
              size="sm"
              icon={Plus}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Add Address
            </Button>
          </div>

          <div className="space-y-3 mb-4">
            {addresses.map((address) => (
              <Card key={address.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {address.type}
                      </span>
                    </div>
                    <div className="text-sm text-gray-900">
                      <p>{formData.companyName || "No Company"}</p>
                      <p className="text-gray-600 mt-1">
                        {address.street}<br />
                        {address.city}, {address.state} {address.zipCode} ({address.country})
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => removeAddress(address.id)}
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    iconOnly
                  />
                </div>
              </Card>
            ))}
          </div>

          {showAddressForm && (
            <Card className="p-4 bg-gray-50">
              <h5 className="text-sm font-medium text-gray-900 mb-3">Add New Address</h5>
              <form onSubmit={handleAddressSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      name="type"
                      value={newAddress.type}
                      onChange={handleAddressInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="Home">Home</option>
                      <option value="Office">Office</option>
                      <option value="Billing">Billing</option>
                      <option value="Shipping">Shipping</option>
                    </select>
                  </div>
                </div>
                
                <input
                  type="text"
                  name="street"
                  value={newAddress.street}
                  onChange={handleAddressInputChange}
                  placeholder="Street Address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="city"
                    value={newAddress.city}
                    onChange={handleAddressInputChange}
                    placeholder="City"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                  <input
                    type="text"
                    name="state"
                    value={newAddress.state}
                    onChange={handleAddressInputChange}
                    placeholder="State"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="zipCode"
                    value={newAddress.zipCode}
                    onChange={handleAddressInputChange}
                    placeholder="ZIP Code"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <input
                    type="text"
                    name="country"
                    value={newAddress.country}
                    onChange={handleAddressInputChange}
                    placeholder="Country"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <Button
                    type="submit"
                    size="sm"
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Add Address
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};