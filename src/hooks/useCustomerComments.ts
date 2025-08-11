import { useState, useCallback, useRef, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { ICustomerComment, IGetCustomerCommentsResponse } from '@/types/customerComments';
import { showToast } from '@/components/ui/toast';

interface UseCustomerCommentsOptions {
  customerId: string;
  initialPageSize?: number;
  autoLoad?: boolean;
}

interface UseCustomerCommentsReturn {
  comments: ICustomerComment[];
  loading: boolean;
  addingComment: boolean;
  error: string | null;
  currentPage: number;
  totalComments: number;
  hasMoreComments: boolean;
  remainingComments: number;
  loadComments: (page?: number, append?: boolean) => Promise<void>;
  loadMoreComments: () => Promise<void>;
  addComment: (content: string) => Promise<void>;
  refreshComments: () => Promise<void>;
  clearComments: () => void;
}

const COMMENTS_PER_PAGE = 10;

export const useCustomerComments = ({
  customerId,
  initialPageSize = COMMENTS_PER_PAGE,
  autoLoad = false
}: UseCustomerCommentsOptions): UseCustomerCommentsReturn => {
  const [comments, setComments] = useState<ICustomerComment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const mountedRef = useRef(true);

  const { get, loading } = useApi({
    cancelOnUnmount: true,
    dedupe: true,
    cacheDuration: 30000,
  });

  const { post, loading: addingComment } = useApi({
    cancelOnUnmount: false,
    dedupe: false,
  });

  const loadComments = useCallback(async (page: number = 1, append: boolean = false) => {
    if (!customerId) return;

    try {
      const queryParams = new URLSearchParams({
        customerId: customerId,
        page: page.toString(),
        limit: initialPageSize.toString(),
        sortBy: 'CreatedAt',
        sortOrder: 'desc'
      });

      const response: IGetCustomerCommentsResponse | null = await get(
        `/Admin/CustomerEditor/GetCustomerAdmComments?${queryParams}`
      );

      if (!mountedRef.current) return;

      if (response?.success && response.data) {
        const newComments = response.data;
        
        if (append) {
          setComments(prev => [...prev, ...newComments]);
        } else {
          setComments(newComments);
        }

        if (response.pagination) {
          setTotalComments(response.pagination.totalRecords);
          setHasMoreComments(response.pagination.hasNext);
        } else {
          const loadedCount = append ? comments.length + newComments.length : newComments.length;
          setTotalComments(Math.max(totalComments, loadedCount));
          setHasMoreComments(newComments.length === initialPageSize);
        }

        setCurrentPage(page);
      }
    } catch (error: any) {
      if (error?.name !== 'CanceledError' && mountedRef.current) {
        showToast.error('Failed to load comments');
      }
    }
  }, [customerId, initialPageSize, get, comments.length, totalComments]);

  const loadMoreComments = useCallback(async () => {
    if (!hasMoreComments) return;
    
    const nextPage = currentPage + 1;
    await loadComments(nextPage, true);
  }, [currentPage, hasMoreComments, loadComments]);

  const addComment = useCallback(async (content: string) => {
    if (!content.trim()) {
      showToast.error('Please enter a comment');
      return;
    }

    if (content.trim().length > 1000) {
      showToast.error('Comment cannot exceed 1000 characters');
      return;
    }

    try {
      const response = await post('/Admin/CustomerEditor/AddCustomerAdmComments', {
        content: content.trim(),
        customerId: customerId,
        authorId: 1 
      });

      if (response?.success) {
        showToast.success('Comment added successfully');
        
        await loadComments(1, false);
        setCurrentPage(1);
      } else {
        throw new Error(response?.message || 'Failed to add comment');
      }
    } catch (error: any) {
      if (error?.name !== 'CanceledError') {
        showToast.error(error.message || 'Failed to add comment');
        throw error;
      }
    }
  }, [customerId, post, loadComments]);

  const refreshComments = useCallback(async () => {
    setCurrentPage(1);
    await loadComments(1, false);
  }, [loadComments]);

  const clearComments = useCallback(() => {
    setComments([]);
    setCurrentPage(1);
    setTotalComments(0);
    setHasMoreComments(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    
    if (autoLoad && customerId) {
      loadComments(1, false);
    }

    return () => {
      mountedRef.current = false;
    };
  }, [customerId, autoLoad, loadComments]);

  const remainingComments = Math.max(0, totalComments - comments.length);

  return {
    comments,
    loading,
    addingComment,
    error: null,
    currentPage,
    totalComments,
    hasMoreComments,
    remainingComments,
    loadComments,
    loadMoreComments,
    addComment,
    refreshComments,
    clearComments,
  };
};