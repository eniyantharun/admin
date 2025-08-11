import { api } from '@/lib/api';
import { 
  IAddCustomerCommentRequest, 
  IAddCustomerCommentResponse,
  IGetCustomerCommentsRequest,
  IGetCustomerCommentsResponse 
} from '@/types/customerComments';

export class CustomerCommentsService {
  static async getCustomerComments(params: IGetCustomerCommentsRequest): Promise<IGetCustomerCommentsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.customerId) queryParams.append('customerId', params.customerId);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.id) queryParams.append('id', params.id);

    const url = `/Admin/CustomerEditor/GetCustomerAdmComments?${queryParams.toString()}`;
    return api.get<IGetCustomerCommentsResponse>(url);
  }

  static async addCustomerComment(data: IAddCustomerCommentRequest): Promise<IAddCustomerCommentResponse> {
    return api.post<IAddCustomerCommentResponse>('/Admin/CustomerEditor/AddCustomerAdmComments', data);
  }

  static async getCommentsForCustomer(
    customerId: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<IGetCustomerCommentsResponse> {
    try {
      return await this.getCustomerComments({
        customerId,
        page: page.toString(),
        limit: limit.toString(),
        sortBy: 'CreatedAt',
        sortOrder: 'desc'
      });
    } catch (error) {
      console.error('Error fetching customer comments:', error);
      throw error;
    }
  }

  static async addCommentWithValidation(
    customerId: string, 
    content: string, 
    authorId?: number
  ): Promise<IAddCustomerCommentResponse> {
    if (!content || content.trim().length === 0) {
      throw new Error('Comment content cannot be empty');
    }

    if (content.trim().length > 1000) {
      throw new Error('Comment content cannot exceed 1000 characters');
    }

    try {
      return await this.addCustomerComment({
        content: content.trim(),
        customerId,
        authorId
      });
    } catch (error) {
      console.error('Error adding customer comment:', error);
      throw error;
    }
  }
}

export const customerCommentsEndpoints = {
  getComments: '/Admin/CustomerEditor/GetCustomerAdmComments',
  addComment: '/Admin/CustomerEditor/AddCustomerAdmComments',
} as const;