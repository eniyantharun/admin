import { apiConfig } from '../config/api';

export interface ApiCustomer {
  form: {
    companyName: string | null;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
  };
  website: string;
  id: string;
  idNum: number;
  name: string;
  createdAt: string;
}

export interface ApiCustomersResponse {
  customers: ApiCustomer[];
  count: number;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  joinedDate: string;
}

export interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
}

export interface GetCustomersParams {
  website?: string;
  search?: string;
  count?: number;
  index?: number;
}

export class CustomerService {
  private static readonly BASE_PATH = '/Admin/CustomerEditor';

  // Transform API customer to our Customer interface
  static transformApiCustomer(apiCustomer: ApiCustomer): Customer {
    return {
      id: apiCustomer.idNum.toString(),
      firstName: apiCustomer.form.firstName || '',
      lastName: apiCustomer.form.lastName || '',
      email: apiCustomer.form.email || '',
      phone: apiCustomer.form.phoneNumber || '',
      companyName: apiCustomer.form.companyName || '',
      joinedDate: new Date(apiCustomer.createdAt).toLocaleString()
    };
  }

  // Get customers list
  static async getCustomers(params: GetCustomersParams = {}): Promise<{ customers: Customer[]; totalCount: number }> {
    const {
      website = 'PromotionalProductInc',
      search = '',
      count = 20,
      index = 0
    } = params;

    const queryParams = new URLSearchParams({
      website,
      search,
      count: count.toString(),
      index: index.toString()
    });

    const response = await apiConfig.get(`${this.BASE_PATH}/GetCustomersList?${queryParams}`);
    const data: ApiCustomersResponse = response.data;

    return {
      customers: data.customers.map(this.transformApiCustomer),
      totalCount: data.count
    };
  }

  // Create new customer
  static async createCustomer(customerData: CustomerFormData): Promise<Customer> {
    const response = await apiConfig.post(`${this.BASE_PATH}/CreateCustomer`, {
      website: 'PromotionalProductInc',
      form: {
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        email: customerData.email,
        phoneNumber: customerData.phone,
        companyName: customerData.companyName || null
      }
    });

    return this.transformApiCustomer(response.data);
  }

  // Update existing customer
  static async updateCustomer(customerId: string, customerData: CustomerFormData): Promise<Customer> {
    const response = await apiConfig.put(`${this.BASE_PATH}/UpdateCustomer/${customerId}`, {
      form: {
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        email: customerData.email,
        phoneNumber: customerData.phone,
        companyName: customerData.companyName || null
      }
    });

    return this.transformApiCustomer(response.data);
  }

  // Delete customer
  static async deleteCustomer(customerId: string): Promise<void> {
    await apiConfig.delete(`${this.BASE_PATH}/DeleteCustomer/${customerId}`);
  }

  // Send reset password email
  static async sendResetPasswordEmail(email: string): Promise<void> {
    await apiConfig.post(`${this.BASE_PATH}/SendResetPasswordEmail`, {
      email,
      website: 'PromotionalProductInc'
    });
  }

  // Send new account email
  static async sendNewAccountEmail(email: string): Promise<void> {
    await apiConfig.post(`${this.BASE_PATH}/SendNewAccountEmail`, {
      email,
      website: 'PromotionalProductInc'
    });
  }
}