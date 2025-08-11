export interface ICustomerComment {
  Id: string;
  Content: string;
  CreatedAt: string;
  CustomerId: string;
  AuthorId: number | null;
}

export interface IAddCustomerCommentRequest {
  content: string;
  customerId: string;
  authorId?: number;
}

export interface IAddCustomerCommentResponse {
  success: boolean;
  message: string;
  data: ICustomerComment;
}

export interface IGetCustomerCommentsRequest {
  sortOrder?: string;
  limit?: string;
  page?: string;
  sortBy?: string;
  id?: string;
  customerId?: string;
}

export interface IGetCustomerCommentsResponse {
  success: boolean;
  message: string;
  data: ICustomerComment[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    recordsPerPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface ICustomerCommentsProps {
  customerId: string;
  customerName: string;
}

export interface IFormattedComment {
  isAuto: boolean;
  content: string;
}