import React from 'react';

interface ListViewProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  className?: string;
  emptyComponent?: React.ReactNode;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
}

export function ListView<T>({
  items,
  renderItem,
  keyExtractor,
  className = '',
  emptyComponent,
  loading = false,
  loadingComponent,
}: ListViewProps<T>) {
  if (loading && loadingComponent) {
    return <div className={`ui-listview-loading ${className}`}>{loadingComponent}</div>;
  }

  if (items.length === 0 && emptyComponent) {
    return <div className={`ui-listview-empty ${className}`}>{emptyComponent}</div>;
  }

  return (
    <div className={`ui-listview-container space-y-2 ${className}`}>
      {items.map((item, index) => (
        <div key={keyExtractor(item, index)} className="ui-listview-item">
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}