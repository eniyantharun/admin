import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Plus, Send, User, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useApi } from '@/hooks/useApi';
import { DateDisplay } from '@/components/helpers/DateDisplay';
import { EmptyState, LoadingState } from '@/components/helpers/EmptyLoadingStates';
import { showToast } from '@/components/ui/toast';

interface CustomerComment {
  Id: string;
  Content: string;
  CreatedAt: string;
  CustomerId: string;
  AuthorId: number | null;
}

interface CustomerCommentsProps {
  customerId: string;
  customerName: string;
}

interface CommentsResponse {
  success: boolean;
  message: string;
  data: CustomerComment[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    recordsPerPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

const COMMENTS_PER_PAGE = 10;

export const CustomerComments: React.FC<CustomerCommentsProps> = ({
  customerId,
  customerName
}) => {
  const [comments, setComments] = useState<CustomerComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const { get: fetchComments, loading: loadingComments } = useApi({
    cancelOnUnmount: true,
    dedupe: true,
    cacheDuration: 30000,
  });

  const { post: addComment, loading: addingComment } = useApi({
    cancelOnUnmount: false,
    dedupe: false,
  });

  const loadComments = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      const queryParams = new URLSearchParams({
        customerId: customerId,
        page: page.toString(),
        limit: COMMENTS_PER_PAGE.toString(),
        sortBy: 'CreatedAt',
        sortOrder: 'desc'
      });

      const response: CommentsResponse | null = await fetchComments(
        `/Admin/CustomerEditor/GetCustomerAdmComments?${queryParams}`
      );

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
          setTotalComments(newComments.length);
          setHasMoreComments(newComments.length === COMMENTS_PER_PAGE);
        }
      } else if (response === null) {
        console.log('Comments request was cancelled or failed');
      } else {
        showToast.error(response?.message || 'Failed to load comments');
      }
    } catch (error: any) {
      if (error?.name !== 'CanceledError') {
        showToast.error('Failed to load comments');
      }
    }
  }, [customerId, fetchComments]);

  const handleLoadMore = useCallback(async () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await loadComments(nextPage, true);
  }, [currentPage, loadComments]);

  const refreshComments = useCallback(async () => {
    setCurrentPage(1);
    await loadComments(1, false);
  }, [loadComments]);

  const handleToggleExpanded = useCallback(async () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    
    if (newExpanded && comments.length === 0) {
      await loadComments(1, false);
    }
  }, [isExpanded, comments.length, loadComments]);

  const handleAddComment = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      showToast.error('Please enter a comment');
      return;
    }

    try {
      const response: any = await addComment('/Admin/CustomerEditor/AddCustomerAdmComments', {
        content: newComment.trim(),
        customerId: customerId,
        authorId: 1 
      });

      if (response?.success) {
        showToast.success('Comment added successfully');
        setNewComment('');
        setShowAddForm(false);
        
        setCurrentPage(1);
        await loadComments(1, false);
      } else if (response === null) {
        console.log('Add comment request was cancelled');
      } else {
        throw new Error(response?.message || 'Failed to add comment');
      }
    } catch (error: any) {
      if (error?.name !== 'CanceledError') {
        showToast.error(error.message || 'Failed to add comment');
      }
    }
  }, [newComment, customerId, addComment, loadComments]);

  useEffect(() => {
    if (customerId && isExpanded) {
      loadComments(1, false);
    }
  }, [customerId, isExpanded, loadComments]);

  const formatCommentContent = (content: string) => {
    if (content.startsWith('AUTO:')) {
      return {
        isAuto: true,
        content: content.substring(5).trim()
      };
    }
    return {
      isAuto: false,
      content: content
    };
  };

  const characterCount = newComment.length;
  const maxCharacters = 1000;
  const isNearLimit = characterCount > maxCharacters * 0.8;

  const remainingComments = Math.max(0, totalComments - comments.length);

  return (
    <Card className="border-t border-gray-200">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors duration-200"
            onClick={handleToggleExpanded}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              <h4 className="font-medium text-gray-900">
                Comments for {customerName}
              </h4>
            </div>
            {totalComments > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                {totalComments}
              </span>
            )}
            <svg 
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          <div className="flex items-center gap-2">
            {isExpanded && (
              <>
                <Button
                  onClick={refreshComments}
                  variant="secondary"
                  size="sm"
                  icon={RefreshCw}
                  iconOnly
                  loading={loadingComments}
                  className="w-8 h-8"
                  title="Refresh comments"
                />
                <Button
                  onClick={() => setShowAddForm(!showAddForm)}
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Add Comment
                </Button>
              </>
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-4">
            {showAddForm && (
              <Card className="p-4 bg-blue-50 border-blue-200">
                <form onSubmit={handleAddComment} className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Add New Comment
                      </label>
                      <span className={`text-xs ${isNearLimit ? 'text-red-600' : 'text-gray-500'}`}>
                        {characterCount}/{maxCharacters}
                      </span>
                    </div>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                        characterCount > maxCharacters 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300'
                      }`}
                      placeholder="Enter your comment here..."
                      rows={3}
                      disabled={addingComment}
                      maxLength={maxCharacters}
                    />
                    {characterCount > maxCharacters && (
                      <p className="text-xs text-red-600 mt-1">
                        Comment exceeds maximum length of {maxCharacters} characters
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      loading={addingComment}
                      icon={Send}
                      size="sm"
                      disabled={!newComment.trim() || characterCount > maxCharacters}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      {addingComment ? 'Adding...' : 'Add Comment'}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewComment('');
                      }}
                      variant="secondary"
                      size="sm"
                      disabled={addingComment}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            <div className="space-y-3">
              {loadingComments && comments.length === 0 ? (
                <LoadingState message="Loading comments..." />
              ) : comments.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title="No comments yet"
                  description="Be the first to add a comment for this customer."
                />
              ) : (
                <>
                  {comments.map((comment) => {
                    const formattedComment = formatCommentContent(comment.Content);
                    return (
                      <Card 
                        key={comment.Id} 
                        className={`p-4 transition-all duration-200 hover:shadow-md ${
                          formattedComment.isAuto ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            formattedComment.isAuto 
                              ? 'bg-gray-400' 
                              : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                          }`}>
                            {formattedComment.isAuto ? (
                              <AlertCircle className="w-4 h-4 text-white" />
                            ) : (
                              <User className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-sm font-medium ${
                                formattedComment.isAuto ? 'text-gray-600' : 'text-gray-900'
                              }`}>
                                {formattedComment.isAuto ? 'System' : `User ${comment.AuthorId || 'Unknown'}`}
                              </span>
                              {formattedComment.isAuto && (
                                <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                                  AUTO
                                </span>
                              )}
                              <DateDisplay 
                                date={comment.CreatedAt} 
                                format="relative" 
                                showIcon={false}
                              />
                            </div>
                            <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                              formattedComment.isAuto ? 'text-gray-600' : 'text-gray-800'
                            }`}>
                              {formattedComment.content}
                            </p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}

                  {hasMoreComments && remainingComments > 0 && (
                    <div className="flex justify-center pt-2">
                      <Button
                        onClick={handleLoadMore}
                        variant="secondary"
                        loading={loadingComments}
                        className="border-dashed border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                        icon={loadingComments ? Loader2 : undefined}
                      >
                        {loadingComments 
                          ? 'Loading...' 
                          : `Load More (${remainingComments})`
                        }
                      </Button>
                    </div>
                  )}

                  {comments.length > 0 && (
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500 text-center">
                        Showing {comments.length} of {totalComments} comments
                        {!hasMoreComments && totalComments > 0 && comments.length === totalComments && ' (all loaded)'}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};