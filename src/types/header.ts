export interface IPageConfig {
  title: string;
  searchPlaceholder: string;
  addButtonAction: () => void;
  filters?: IFilterConfig[];
  showFilters?: boolean;
  showSearch?: boolean;
  showAddButton?: boolean;
}

export interface IFilterConfig {
  key: string;
  label: string;
  type: "select" | "toggle";
  options?: { value: string; label: string }[];
  value: string | boolean;
  onChange: (value: string | boolean) => void;
}

export interface IHeaderContextData {
  totalCount: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddNew: () => void;
  filters: IFilterConfig[];
}

export interface IHeaderProps {
  contextData?: IHeaderContextData;
}
