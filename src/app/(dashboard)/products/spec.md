# Products Section Specification

## Overview
The Products section provides comprehensive product catalog management functionality, including listing, filtering, searching, and viewing detailed product information from suppliers. This section integrates with the ProductService API and displays products in a table format with rich metadata.

## Routes
- `/products` - Main products listing page
- `/products/new` - Create new product (route referenced but page not yet implemented)
- `/products/[productId]` - Individual product detail page

## Page: Products List (`/products`)

### Purpose
Display a paginated, searchable, and filterable list of all products in the system with key details about each product including pricing, supplier information, categories, and availability status.

### Features

#### 1. Header
- **Search Bar**: Real-time search by product name
- **Total Count**: Display total number of products matching current filters
- **Add New Button**: Navigate to `/products/new` to create a new product
- **Filters**:
  - **Status Filter**: Dropdown with options:
    - All Products (default)
    - Active Products (visibility = "Enabled")
    - Inactive Products (visibility = "Disabled")
  - **Featured Filter**: Dropdown with options:
    - All Products (default)
    - Featured Only (exclusive = true)
    - Not Featured (exclusive = false)

#### 2. Products Table
Displays products in a responsive table with the following columns:

##### Column 1: Product
- **Product Image**: 
  - Display product thumbnail using `thumbIndex`
  - Image source: `https://static2.promotionalproductinc.com/p2/src/{productId}/{thumbIndex}.webp`
  - Fallback: Gray placeholder with image icon if image fails to load or doesn't exist
  - Size: 48x48px, rounded corners with border
- **Product Name**: Bold text, truncated if too long
- **Badges**:
  - **Exclusive Badge**: Yellow badge with star icon if `exclusive = true`
  - **Featured Badge**: Blue badge if `merchantCenterEnabled = true`
- **Metadata Row**:
  - **Variants Count**: Shows number of variants with package icon
  - **Status Badge**: Compact status badge showing "Active" (green) or "Inactive" (gray)

##### Column 2: Supplier
- **Supplier Name**: Bold text with building icon
- **Website**: Gray text showing supplier website (if available)

##### Column 3: Category
- **Category Tags**: Purple rounded badges for categories
- **Display Logic**:
  - Show first 2 categories
  - If more than 2 categories, show "+N" badge
  - If no categories, show "No category" in gray

##### Column 4: Price Range
- **Price Range**: Green text with dollar sign icon
  - Format: `$XX.XX - $YY.YY` (minPrice - maxPrice)
- **Setup Charge**: Gray text showing setup charge if > 0
  - Format: `+$XX.XX setup`

##### Column 5: Details
- **Production Time**: 
  - Format: `X-Y days` or `X days` if min and max are equal
  - Shows minDays and maxDays
- **Decorations Count**: Shows number of available decorations

##### Column 6: Actions
- **View Button**: Eye icon button to navigate to product detail page

#### 3. Table Interactions
- **Row Hover**: Background color changes on hover
- **Row Click**: Clicking anywhere on the row navigates to product detail page
- **Action Button Click**: Stops propagation to prevent double navigation

#### 4. Empty States
- **No Products**: Shows empty state with:
  - Package icon
  - Title: "No products found"
  - Description: "Get started by adding your first product."
  - Only shows if no search/filter is active
- **No Results**: Shows when search/filters return no results

#### 5. Loading States
- **Initial Load**: Shows loading spinner with "Loading products..." message
- **Subsequent Loads**: Maintains current data while fetching in background

#### 6. Pagination
- **Rows Per Page**: Configurable (default: 20)
- **Current Page**: Tracked with state
- **Pagination Controls**: Shows:
  - Current page / Total pages
  - Items range: "Showing X-Y of Z"
  - Previous/Next buttons
  - Page number selector
- **Reset Behavior**: Pagination resets to page 1 when:
  - Search term changes
  - Status filter changes
  - Featured filter changes

### Data Flow

#### State Management
```typescript
- products: Product[] - Current page of products
- totalCount: number - Total number of products matching filters
- currentPage: number - Current page number (1-indexed)
- rowsPerPage: number - Items per page (default: 20)
- isInitialLoad: boolean - First load indicator
- statusFilter: string - "all" | "enabled" | "disabled"
- featuredFilter: string - "all" | "featured" | "not-featured"
- loading: boolean - Loading state
- searchTerm: string - From header context
```

#### API Integration
**Endpoint**: `/Admin/ProductList/GetProductsList`

**Query Parameters**:
- `PageSize`: Number of items per page
- `Offset`: Starting index (calculated as `(currentPage - 1) * rowsPerPage`)
- `search`: Search term (if provided)
- `visibility`: "Enabled" or "Disabled" (if status filter is not "all")
- `exclusive`: true or false (if featured filter is not "all")

**Response**:
```typescript
{
  products: Product[];
  count: number; // Total count
}
```

#### Product Data Model
```typescript
interface Product {
  id: number;
  name: string;
  slug: string;
  thumbIndex: number;
  categories: ProductCategory[];
  features: ProductFeature[];
  minPrice: number;
  maxPrice: number;
  supplier: ProductSupplier;
  decorations: ProductDecoration[];
  visibility: string; // "Enabled" | "Disabled"
  merchantCenterEnabled: boolean;
  setupCharge: number;
  minDays: number;
  maxDays: number;
  variants: ProductVariant[];
  pictures: number[];
  exclusive: boolean;
  supplierPageStatus: ProductSupplierPageStatus[];
}
```

### UI Components Used
- `Header` - Page header with search, filters, and actions
- `Card` - Container for table and pagination
- `Button` - Action buttons
- `StatusBadge` - Status indicator badges
- `EmptyState` - No data display
- `LoadingState` - Loading indicator
- `PaginationControls` - Pagination UI

### Hooks Used
- `useProductsHeaderContext` - Header configuration with filters
- `useRouter` - Next.js navigation
- `useState` - Local state management
- `useEffect` - Side effects for data fetching
- `useCallback` - Memoized callbacks

### Error Handling
- **API Errors**: Displays error toast and sets empty state
- **Image Load Errors**: Gracefully falls back to placeholder icon
- **Console Logging**: Errors logged to console for debugging

### Performance Considerations
- **Memoized Callbacks**: `fetchProducts` wrapped in `useCallback` with proper dependencies
- **Debounced Search**: Search triggers re-fetch (managed by header context)
- **Background Loading**: Subsequent loads don't show full loading state
- **Optimized Re-renders**: Filters reset pagination to prevent unnecessary requests

### Styling
- Uses Tailwind CSS utility classes
- Responsive design with overflow handling
- Consistent spacing: 2-unit spacing system
- Color scheme:
  - Active/Enabled: Green
  - Inactive/Disabled: Gray
  - Exclusive: Yellow
  - Featured: Blue
  - Categories: Purple
  - Prices: Green

### Accessibility
- Semantic HTML table structure
- Icon buttons with title attributes
- Keyboard navigation support via clickable rows
- Clear visual hierarchy
- Sufficient color contrast

### Future Enhancements (Not Yet Implemented)
- Export functionality
- Refresh functionality
- Bulk actions (select multiple products)
- View mode toggle (grid view)
- Advanced filtering (by supplier, category, price range)
- Product status toggle from list view
- Inline editing capabilities
- Product duplication
- Batch import/export

## Page: Product Detail (`/products/[productId]`)
*(Implementation exists but requires separate specification)*

## Page: New Product (`/products/new`)
*(Not yet implemented - route referenced but page doesn't exist)*

## Related Files
- `src/app/(dashboard)/products/page.tsx` - Main products list component
- `src/types/productService.ts` - Product types and API service
- `src/hooks/useHeaderContext.ts` - Header context hook (useProductsHeaderContext)
- `src/components/layout/Header.tsx` - Header component
- `src/components/ui/Button.tsx` - Button component
- `src/components/ui/Card.tsx` - Card container component
- `src/components/helpers/StatusBadge.tsx` - Status badge component
- `src/components/helpers/EmptyLoadingStates.tsx` - Empty and loading states
- `src/components/helpers/PaginationControls.tsx` - Pagination component
- `src/components/ui/toast.tsx` - Toast notification system

## Testing Considerations
1. **Search Functionality**: Test search with various terms
2. **Filter Combinations**: Test all filter combinations
3. **Pagination**: Test page navigation, rows per page changes
4. **Empty States**: Test with no products, no search results
5. **Image Loading**: Test with valid and invalid images
6. **Error Scenarios**: Test API failures, network errors
7. **Navigation**: Test row clicks, button clicks, navigation
8. **Responsive Design**: Test on various screen sizes
9. **Performance**: Test with large datasets (1000+ products)

## API Dependencies
- `GET /Admin/ProductList/GetProductsList` - Fetch products list
- Image CDN: `https://static2.promotionalproductinc.com/p2/src/` - Product images

## Known Limitations
1. No create/edit functionality from list view
2. No bulk operations support
3. No export functionality implemented
4. No refresh button implemented
5. Images have no retry mechanism beyond fallback
6. No caching strategy for frequently accessed products

