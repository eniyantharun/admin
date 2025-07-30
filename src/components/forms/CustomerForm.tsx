import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Mail,
  Phone,
  User,
  MapPin,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormInput } from "@/components/helpers/FormInput";
import { AddressForm } from "@/components/forms/AddressForm";
import { CustomerActions } from "@/components/helpers/CustomerActions";
import { useApi } from "@/hooks/useApi";
import {
  iCustomer,
  iCustomerFormData,
  iCustomerAddress,
  iCustomerAddressFormData,
  iCustomerOrder,
} from "@/types/customer";
import { googleMapsUtils } from "@/lib/googleMaps";
import { iCustomerFormProps } from "./../../types/customer"


export const CustomerForm: React.FC<iCustomerFormProps> = ({
  customer,
  isEditing,
  onSubmit,
  onSendResetPassword,
  onSendNewAccount,
  onCustomerUpdated,
  loading = false,
}) => {
  const [formData, setFormData] = useState<iCustomerFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    website: "promotionalproductinc.com",
    companyName: "",
    isBusinessCustomer: false,
    addresses: [],
  });
  const [formErrors, setFormErrors] = useState<Partial<iCustomerFormData>>({});
  const [addresses, setAddresses] = useState<iCustomerAddress[]>([]);
  const [orders, setOrders] = useState<iCustomerOrder[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);
  const [currentCustomer, setCurrentCustomer] = useState<iCustomer | null>(null);

  const addressApi = useApi({
    cancelOnUnmount: false,
    dedupe: false,
  });

  const ordersApi = useApi({
    cancelOnUnmount: false,
    dedupe: false,
  });

  const customerDetailApi = useApi({
    cancelOnUnmount: false,
    dedupe: false,
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        website: customer.website || "promotionalproductinc.com",
        companyName: customer.companyName,
        isBusinessCustomer: customer.isBusinessCustomer,
        addresses: [],
      });

      if (isEditing) {
        fetchCustomerDetails(customer.id);
      }
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        website: "promotionalproductinc.com",
        companyName: "",
        isBusinessCustomer: false,
        addresses: [],
      });
      setAddresses([]);
      setOrders([]);
      setCurrentCustomer(null);
    }
  }, [customer, isEditing]);

  const fetchCustomerDetails = async (customerId: string) => {
    try {
      const response = await customerDetailApi.get(
        `/Admin/CustomerEditor/GetCustomerById?customerId=${customerId}`
      );

      if (response?.customer) {
        setCurrentCustomer({
          ...customer!,
          isBlocked: response.customer.isBlocked || false,
        });
        setAddresses(response.addresses || []);

        fetchCustomerOrders(customerId);
      }
    } catch (error) {
      alert("Error fetching customer details:");
    }
  };

  const fetchCustomerOrders = async (customerId: string) => {
    try {
      const response = await ordersApi.get(
        `/Admin/CustomerEditor/GetCustomerOrders?CustomerId=${customerId}`
      );

      const { data } = response || {};
      if (data?.orders) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      alert('Error fetching orders:'+ error);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<iCustomerFormData> = {};

    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    if (!formData.website.trim()) errors.website = "Website is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error("Error in form submission:", error);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    let processedValue = value;

    if (name === "phone") {
      processedValue = googleMapsUtils.formatPhoneNumber(value);
      e.target.value = processedValue;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : processedValue,
    }));

    if (formErrors[name as keyof iCustomerFormData]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAddressSubmit = async (addressData: iCustomerAddressFormData) => {
    if (!currentCustomer) return;

    try {
      if (editingAddressIndex !== null) {
        const addressToUpdate = addresses[editingAddressIndex];
        console.log("Updating address:", addressToUpdate.id, addressData);
        await addressApi.post("/Admin/CustomerEditor/UpdateCustomerAddress", {
          id: addressToUpdate.id,
          ...addressData,
        });
      } else {
        console.log(
          "Adding new address for customer:",
          currentCustomer.id,
          addressData
        );
        await addressApi.post("/Admin/CustomerEditor/AddCustomerAddress", {
          customerId: currentCustomer.id,
          ...addressData,
        });
      }

      await fetchCustomerDetails(currentCustomer.id);
      setShowAddressForm(false);
      setEditingAddressIndex(null);

      if (onCustomerUpdated) {
        onCustomerUpdated();
      }
    } catch (error) {
      console.error("Error saving address:", error);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!currentCustomer) return;

    try {
      console.log(
        "Deleting address:",
        addressId,
        "for customer:",
        currentCustomer.id
      );
      await addressApi.delete(
        `/Admin/CustomerEditor/DeleteCustomersAddress?addressId=${addressId}&customerId=${currentCustomer.id}`
      );

      await fetchCustomerDetails(currentCustomer.id);

      if (onCustomerUpdated) {
        onCustomerUpdated();
      }
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  const handleCustomerUpdated = async () => {
    if (currentCustomer) {
      await fetchCustomerDetails(currentCustomer.id);
    }
    if (onCustomerUpdated) {
      onCustomerUpdated();
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
            error={formErrors.phone}
            required
            placeholder="(123) 456-7890"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Website"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            error={formErrors.website}
            required
            placeholder="promotionalproductinc.com"
          />

          <div className="space-y-2">
            <FormInput
              label="Company Name"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder="Company Name (Optional)"
            />
          </div>
          {!formData.companyName && (
            <FormInput
              label=""
              name="isBusinessCustomer"
              type="checkbox"
              value={!formData.isBusinessCustomer}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isBusinessCustomer: !e.target.checked,
                }))
              }
              placeholder="I am not purchasing for a business"
            />
          )}
        </div>

        <Button
          type="submit"
          loading={loading}
          className=" bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          {isEditing ? "Update Customer" : "Create Customer"}
        </Button>
      </form>

      {isEditing && currentCustomer && (
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-4">
            Email Actions
          </h4>
          <div className="flex flex-rpw gap-3">
            <Button
              onClick={() => onSendResetPassword?.(currentCustomer.email)}
              variant="secondary"
              size="sm"
              icon={Mail}
              className="justify-start"
            >
              Send Reset Password Email
            </Button>
            <Button
              onClick={() => onSendNewAccount?.(currentCustomer.email)}
              variant="secondary"
              size="sm"
              icon={Mail}
              className="justify-start"
            >
              Send New Account Email
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Email will be sent to: {currentCustomer.email}
          </p>
        </div>
      )}

      {isEditing && currentCustomer && (
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-between ">
            <h4 className="text-sm font-medium text-gray-700">Addresses</h4>
            <Button
              onClick={() => {
                setEditingAddressIndex(null);
                setShowAddressForm(!showAddressForm);
              }}
              size="sm"
              icon={Plus}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Add Address
            </Button>
          </div>

          {customerDetailApi.loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-3 mb-4">
              {addresses.map((address, index) => (
                <Card key={address.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {address.type} - {address.label}
                        </span>
                        {address.isPrimary && (
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                            Primary
                          </span>
                        )}
                        {address.isVerified && (
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-900">
                        <p className="font-medium">{address.name}</p>
                        <p className="text-gray-600 mt-1">
                          {address.street}
                          <br />
                          {address.city}, {address.state} {address.zipCode} (
                          {address.country})
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setEditingAddressIndex(index);
                          setShowAddressForm(true);
                        }}
                        variant="secondary"
                        size="sm"
                        icon={MapPin}
                        iconOnly
                      />
                      <Button
                        onClick={() => handleDeleteAddress(address.id)}
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                        iconOnly
                        loading={addressApi.loading}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {showAddressForm && (
            <Card className="p-4 bg-gray-50">
              <h5 className="text-sm font-medium text-gray-900 mb-3">
                  {!editingAddressIndex==null ? "Edit Address" : "Add New Address"}

              </h5>
              <AddressForm
                address={
                  editingAddressIndex !== null
                    ? {
                        type: addresses[editingAddressIndex].type,
                        label: addresses[editingAddressIndex].label,
                        name: addresses[editingAddressIndex].name,
                        street: addresses[editingAddressIndex].street,
                        city: addresses[editingAddressIndex].city,
                        state: addresses[editingAddressIndex].state,
                        zipCode: addresses[editingAddressIndex].zipCode,
                        country: addresses[editingAddressIndex].country,
                        isPrimary: addresses[editingAddressIndex].isPrimary,
                      }
                    : undefined
                }
                onSubmit={handleAddressSubmit}
                onCancel={() => {
                  setShowAddressForm(false);
                  setEditingAddressIndex(null);
                }}
                loading={addressApi.loading}
              />
            </Card>
          )}
        </div>
      )}

      {isEditing && currentCustomer && (
        <div className="border-t border-gray-200 p-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">
            Customer Orders
          </h4>

          {ordersApi.loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : orders.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No orders found for this customer.
            </p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {orders.map((order, index) => (
                <Card key={order.id || index} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {order.id && (
                          <span className="text-sm font-medium text-gray-900">
                            Order #{order.id}
                          </span>
                        )}
                        {order.status && (
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              order.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      ${order.total.toFixed(2)}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {isEditing && currentCustomer && (
        <div className="border-t border-gray-200 p-6">
          <CustomerActions
            customer={currentCustomer}
            onCustomerUpdated={handleCustomerUpdated}
          />
        </div>
      )}
    </div>
  );
};
