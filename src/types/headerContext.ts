export interface IFilterConfig {
  key: string;
  label: string;
  type: 'select' | 'toggle';
  options?: { value: string; label: string }[];
  value: string | boolean;
  onChange: (value: string | boolean) => void;
}

export interface IActionConfig {
  key: string;
  label: string;
  icon: React.ComponentType<any>;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface IHeaderContextData {
  totalCount: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddNew: () => void;
  filters: IFilterConfig[];
  actions: IActionConfig[];
}

export interface IUseHeaderContextProps {
  totalCount: number;
  onAddNew: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  customActions?: IActionConfig[];
}