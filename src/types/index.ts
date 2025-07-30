export interface iAddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (place: google.maps.places.Place) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export interface iEntityAvatarProps {
  name: string;
  id: string | number;
  type?: 'customer' | 'supplier' | 'default';
  size?: 'sm' | 'md' | 'lg';
}

export interface iEntityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  footer?: React.ReactNode;
}

export interface iEmptyStateProps {
  icon?: React.ComponentType<any>;
  title: string;
  description?: string;
  hasSearch?: boolean;
}

export interface iLoadingStateProps {
  message?: string;
}

export interface iFormInputProps {
  label: string;
  name: string;
  value: string | boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  helpText?: string;
}

export interface iPaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  startIndex: number;
  endIndex: number;
}