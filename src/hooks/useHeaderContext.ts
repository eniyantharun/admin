import { useState, useCallback, useMemo } from 'react';
import { Download, RefreshCw, FileText, Mail, BarChart3, LayoutGrid, List } from 'lucide-react';

interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'toggle';
  options?: { value: string; label: string }[];
  value: string | boolean;
  onChange: (value: string | boolean) => void;
}

interface ActionConfig {
  key: string;
  label: string;
  icon: React.ComponentType<any>;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

interface HeaderContextData {
  totalCount: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddNew: () => void;
  filters: FilterConfig[];
  actions: ActionConfig[];
}

interface UseHeaderContextProps {
  totalCount: number;
  onAddNew: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  customActions?: ActionConfig[];
}

export const useHeaderContext = ({
  totalCount,
  onAddNew,
  onRefresh,
  onExport,
  customActions = []
}: UseHeaderContextProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const defaultActions = useMemo(() => {
    const actions: ActionConfig[] = [];

    if (onRefresh) {
      actions.push({
        key: 'refresh',
        label: 'Refresh',
        icon: RefreshCw,
        onClick: onRefresh,
        variant: 'secondary'
      });
    }

    if (onExport) {
      actions.push({
        key: 'export',
        label: 'Export',
        icon: Download,
        onClick: onExport,
        variant: 'secondary'
      });
    }

    return [...actions, ...customActions];
  }, [onRefresh, onExport, customActions]);

  const contextData: HeaderContextData = useMemo(() => ({
    totalCount,
    searchTerm,
    onSearchChange: handleSearchChange,
    onAddNew,
    filters: [],
    actions: defaultActions
  }), [totalCount, searchTerm, handleSearchChange, onAddNew, defaultActions]);

  return {
    contextData,
    searchTerm,
    setSearchTerm,
    handleSearchChange
  };
};

// Specific hooks for different pages
export const useCustomersHeaderContext = ({
  totalCount,
  onAddNew,
  statusFilter,
  onStatusFilterChange,
  businessFilter,
  onBusinessFilterChange,
  onRefresh,
  onExport
}: {
  totalCount: number;
  onAddNew: () => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  businessFilter: string;
  onBusinessFilterChange: (value: string) => void;
  onRefresh?: () => void;
  onExport?: () => void;
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filters: FilterConfig[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      value: statusFilter,
      onChange: (value: string | boolean) => {
        if (typeof value === 'string') {
          onStatusFilterChange(value);
        }
      },
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'disabled', label: 'Disabled' }
      ]
    },
    {
      key: 'business',
      label: 'Type',
      type: 'select',
      value: businessFilter,
      onChange: (value: string | boolean) => {
        if (typeof value === 'string') {
          onBusinessFilterChange(value);
        }
      },
      options: [
        { value: 'all', label: 'All Types' },
        { value: 'business', label: 'Business' },
        { value: 'individual', label: 'Individual' }
      ]
    }
  ];

  const actions: ActionConfig[] = [];
  
  if (onRefresh) {
    actions.push({
      key: 'refresh',
      label: 'Refresh',
      icon: RefreshCw,
      onClick: onRefresh,
      variant: 'secondary'
    });
  }

  if (onExport) {
    actions.push({
      key: 'export',
      label: 'Export',
      icon: Download,
      onClick: onExport,
      variant: 'secondary'
    });
  }

  const contextData: HeaderContextData = {
    totalCount,
    searchTerm,
    onSearchChange: setSearchTerm,
    onAddNew,
    filters,
    actions
  };

  return { contextData, searchTerm };
};

export const useBrandsHeaderContext = ({
  totalCount,
  onAddNew,
  enabledFilter,
  onEnabledFilterChange,
  viewMode,
  onViewModeChange,
  onRefresh
}: {
  totalCount: number;
  onAddNew: () => void;
  enabledFilter: boolean | null;
  onEnabledFilterChange: (value: boolean | null) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onRefresh?: () => void;
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filters: FilterConfig[] = [
    {
      key: 'enabled',
      label: 'Status',
      type: 'select',
      value: enabledFilter === null ? 'all' : enabledFilter ? 'enabled' : 'disabled',
      onChange: (value: string | boolean) => {
        if (value === 'all') onEnabledFilterChange(null);
        else if (value === 'enabled') onEnabledFilterChange(true);
        else onEnabledFilterChange(false);
      },
      options: [
        { value: 'enabled', label: 'Enabled' },
        { value: 'disabled', label: 'Disabled' },
        { value: 'all', label: 'All' }
      ]
    },
    {
      key: 'view',
      label: 'View',
      type: 'toggle',
      value: viewMode,
      onChange: (value: string | boolean) => {
        if (typeof value === 'string') {
          onViewModeChange(value as 'grid' | 'list');
        }
      },
      options: [
        { value: 'grid', label: 'Grid' },
        { value: 'list', label: 'List' }
      ]
    }
  ];

  const actions: ActionConfig[] = [];
  
  if (onRefresh) {
    actions.push({
      key: 'refresh',
      label: 'Refresh',
      icon: RefreshCw,
      onClick: onRefresh,
      variant: 'secondary'
    });
  }

  const contextData: HeaderContextData = {
    totalCount,
    searchTerm,
    onSearchChange: setSearchTerm,
    onAddNew,
    filters,
    actions
  };

  return { contextData, searchTerm };
};

export const useOrdersHeaderContext = ({
  totalCount,
  onAddNew,
  statusFilter,
  onStatusFilterChange,
  onRefresh,
  onExport
}: {
  totalCount: number;
  onAddNew: () => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onRefresh?: () => void;
  onExport?: () => void;
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filters: FilterConfig[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      value: statusFilter,
      onChange: (value: string | boolean) => {
        if (typeof value === 'string') {
          onStatusFilterChange(value);
        }
      },
      options: [
        { value: 'all', label: 'All Orders' },
        { value: 'new', label: 'New Orders' },
        { value: 'in-production', label: 'In Production' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' }
      ]
    }
  ];

  const actions: ActionConfig[] = [];
  
  if (onRefresh) {
    actions.push({
      key: 'refresh',
      label: 'Refresh',
      icon: RefreshCw,
      onClick: onRefresh,
      variant: 'secondary'
    });
  }

  if (onExport) {
    actions.push({
      key: 'export',
      label: 'Export',
      icon: Download,
      onClick: onExport,
      variant: 'secondary'
    });
  }

  const contextData: HeaderContextData = {
    totalCount,
    searchTerm,
    onSearchChange: setSearchTerm,
    onAddNew,
    filters,
    actions
  };

  return { contextData, searchTerm };
};

export const useQuotesHeaderContext = ({
  totalCount,
  onAddNew,
  statusFilter,
  onStatusFilterChange,
  onRefresh,
  onExport
}: {
  totalCount: number;
  onAddNew: () => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onRefresh?: () => void;
  onExport?: () => void;
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filters: FilterConfig[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      value: statusFilter,
      onChange: (value: string | boolean) => {
        if (typeof value === 'string') {
          onStatusFilterChange(value);
        }
      },
      options: [
        { value: 'all', label: 'All Quotes' },
        { value: 'new-quote', label: 'New Quotes' },
        { value: 'quote-sent-to-customer', label: 'Sent to Customer' },
        { value: 'quote-converted-to-order', label: 'Converted to Order' }
      ]
    }
  ];

  const actions: ActionConfig[] = [];
  
  if (onRefresh) {
    actions.push({
      key: 'refresh',
      label: 'Refresh',
      icon: RefreshCw,
      onClick: onRefresh,
      variant: 'secondary'
    });
  }

  if (onExport) {
    actions.push({
      key: 'export',
      label: 'Export',
      icon: Download,
      onClick: onExport,
      variant: 'secondary'
    });
  }

  actions.push({
    key: 'reports',
    label: 'Reports',
    icon: BarChart3,
    onClick: () => console.log('Generate reports'),
    variant: 'secondary'
  });

  const contextData: HeaderContextData = {
    totalCount,
    searchTerm,
    onSearchChange: setSearchTerm,
    onAddNew,
    filters,
    actions
  };

  return { contextData, searchTerm };
};

export const useSuppliersHeaderContext = ({
  totalCount,
  onAddNew,
  onRefresh,
  onExport
}: {
  totalCount: number;
  onAddNew: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const actions: ActionConfig[] = [];
  
  if (onRefresh) {
    actions.push({
      key: 'refresh',
      label: 'Refresh',
      icon: RefreshCw,
      onClick: onRefresh,
      variant: 'secondary'
    });
  }

  if (onExport) {
    actions.push({
      key: 'export',
      label: 'Export',
      icon: Download,
      onClick: onExport,
      variant: 'secondary'
    });
  }

  const contextData: HeaderContextData = {
    totalCount,
    searchTerm,
    onSearchChange: setSearchTerm,
    onAddNew,
    filters: [],
    actions
  };

  return { contextData, searchTerm };
};