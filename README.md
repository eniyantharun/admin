# PPI Admin Portal

A modern, production-ready admin dashboard built with Next.js 14, TypeScript, and Tailwind CSS for Promotional Product Inc.

## 🌟 Features

### Core Features
- **Modern Architecture**: Built with Next.js 14 App Router and TypeScript for type safety
- **Authentication System**: Secure JWT-based authentication with cookie storage
- **Responsive Design**: Mobile-first responsive design that works on all devices
- **Performance Optimized**: Request caching, deduplication, and optimized API calls
- **Real-time State Management**: Redux Toolkit for predictable state management

### Business Modules
- **Dashboard**: Overview with key metrics, recent activity, and quick actions
- **Customer Management**: Full CRUD operations with advanced search and filtering
- **Supplier Management**: Comprehensive supplier database with product statistics
- **Order Processing**: Order lifecycle management with status tracking
- **Quote System**: Quote-to-order conversion pipeline
- **Brand Management**: Brand portfolio with product associations
- **Product Catalog**: (Framework ready for implementation)

### Technical Excellence
- **Type Safety**: Full TypeScript coverage with strict mode
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Caching Strategy**: Intelligent API response caching and request deduplication
- **Security**: XSS protection, secure cookie handling, and input validation
- **Accessibility**: WCAG-compliant components and keyboard navigation

## 🏗️ Architecture

### Project Structure
```
src/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (Button, Card, etc.)
│   ├── layout/           # Layout components (Header, Sidebar)
│   ├── forms/            # Form components
│   └── helpers/          # Helper components (StatusBadge, etc.)
├── hooks/                # Custom React hooks
│   ├── useApi.ts         # Advanced API hook with caching
│   ├── useAuth.ts        # Authentication hook
│   └── redux.ts          # Redux hooks
├── lib/                  # Utilities and configurations
│   ├── api.ts            # API client with interceptors
│   ├── auth.ts           # Authentication utilities
│   ├── constants.ts      # Application constants
│   └── utils.ts          # Common utilities
├── store/                # Redux store and slices
│   ├── authSlice.ts      # Authentication state
│   └── dashboardSlice.ts # Dashboard state
└── types/                # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ppi-admin-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your environment variables:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://your-api-endpoint.com/
   NEXT_PUBLIC_APP_NAME=PPI Admin
   NEXT_PUBLIC_COMPANY_NAME=Promotional Product Inc
   ```

4. **Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open in Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production
```bash
npm run build
npm start
```

## 🎨 Theme & Styling

### Design System
The application uses a comprehensive design system built with Tailwind CSS:

```typescript
// Tailwind Color Palette
colors: {
  primary: { /* Blue shades for primary actions */ },
  secondary: { /* Gray shades for neutral elements */ },
  danger: { /* Red shades for destructive actions */ },
  success: { /* Green shades for positive feedback */ },
  warning: { /* Yellow/Orange for warnings */ }
}
```

### Component Variants
All components support multiple variants for consistent theming:

```tsx
// Button variants
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="danger">Delete</Button>

// Card with custom styling
<Card padding="lg" shadow="md" border={true}>
  Content here
</Card>
```

## 🧩 Component Library

### Core UI Components

#### Button Component
```tsx
import { Button } from '@/components/ui/Button';
import { Plus, Edit, Trash } from 'lucide-react';

// Text button
<Button>Save Changes</Button>

// With icon
<Button icon={Plus}>Add New</Button>

// Icon only
<Button icon={Edit} iconOnly size="sm" />

// Loading state
<Button loading={isSubmitting}>Submit</Button>

// Variants
<Button variant="danger" icon={Trash}>Delete</Button>
```

#### Form Components
```tsx
import { FormInput } from '@/components/helpers/FormInput';

<FormInput
  label="Email Address"
  name="email"
  type="email"
  value={formData.email}
  onChange={handleChange}
  error={errors.email}
  required
  placeholder="user@example.com"
  helpText="We'll never share your email"
/>
```

#### Status & Display Components
```tsx
import { StatusBadge } from '@/components/helpers/StatusBadge';
import { DateDisplay } from '@/components/helpers/DateDisplay';
import { EntityAvatar } from '@/components/helpers/EntityAvatar';

<StatusBadge enabled={item.enabled} />
<DateDisplay date={item.createdAt} format="relative" />
<EntityAvatar name="John Doe" id={123} type="customer" />
```

### Layout Components

#### Responsive Sidebar
- Collapsible on desktop
- Mobile overlay
- Active route highlighting
- Smooth animations

#### Header with Search
- Global search (visual placeholder)
- User menu with dropdown
- Notification center
- Keyboard shortcuts (⌘K)

## 🔧 API Integration

### useApi Hook
Advanced API hook with caching, deduplication, and error handling:

```tsx
import { useApi } from '@/hooks/useApi';

function CustomerList() {
  const { get, post, loading, error } = useApi({
    onSuccess: (data) => console.log('Success:', data),
    onError: (error) => console.error('Error:', error),
    cancelOnUnmount: true,
    dedupe: true,
    cacheDuration: 60000 // 1 minute
  });

  const fetchCustomers = async () => {
    const customers = await get('/Admin/CustomerEditor/GetCustomersList');
    setCustomers(customers);
  };
}
```

### API Client Configuration
```typescript
// lib/api.ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatic authentication
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Service Classes
```typescript
import { CustomerService } from '@/lib/api';

// Using specialized service classes
const customers = await CustomerService.getCustomers({
  website: 'PromotionalProductInc',
  search: 'john',
  count: 20,
  index: 0
});
```

## 🔐 Authentication System

### Secure Authentication Flow
```typescript
import { useAuth } from '@/hooks/useAuth';

function LoginPage() {
  const { login, loading, error } = useAuth();
  
  const handleLogin = async (credentials) => {
    try {
      await login(credentials.username, credentials.password);
      router.push('/dashboard');
    } catch (error) {
      // Error handling managed by hook
    }
  };
}
```

### Protected Routes
```tsx
import { AuthGuard } from '@/components/layout/AuthGuard';

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  );
}
```

## 📊 State Management

### Redux Store Structure
```typescript
// store/index.ts
export const store = configureStore({
  reducer: {
    auth: authSlice,
    dashboard: dashboardSlice,
  },
});

// Usage in components
import { useAppSelector, useAppDispatch } from '@/hooks/redux';

const { user, isAuthenticated } = useAppSelector(state => state.auth);
const dispatch = useAppDispatch();
```

### Authentication State
```typescript
// Automatic token validation
const { isAuthenticated, loading, user } = useAuth();

// Login/logout actions
await login(username, password);
await logout();
```

## 🎯 Performance Optimizations

### Request Optimization
- **Deduplication**: Prevents duplicate API calls
- **Caching**: Intelligent response caching with TTL
- **Cancellation**: Automatic request cancellation on component unmount
- **Error Boundaries**: Graceful error handling

### Rendering Optimization
- **Memoization**: Strategic use of React.memo and useMemo
- **Code Splitting**: Route-based code splitting with Next.js
- **Image Optimization**: Next.js Image component with fallbacks
- **Lazy Loading**: Component and route lazy loading

### Bundle Optimization
```typescript
// Dynamic imports for heavy components
const ChartComponent = dynamic(() => import('./Chart'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
```

## 🧪 Development Guidelines

### File Naming Conventions
- **Components**: PascalCase (`CustomerList.tsx`)
- **Hooks**: camelCase starting with 'use' (`useApi.ts`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE

### TypeScript Best Practices
```typescript
// Define interfaces for all data structures
interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string; // Optional fields
}

// Use discriminated unions for variants
type ButtonVariant = 'primary' | 'secondary' | 'danger';

// Generic components
interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}
```

### Component Architecture
```tsx
// Composable components with clear interfaces
interface CustomerCardProps {
  customer: Customer;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  readonly?: boolean;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  onEdit,
  onDelete,
  readonly = false
}) => {
  // Component implementation
};
```

### Error Handling
```tsx
// Comprehensive error boundaries
import { EmptyState, LoadingState } from '@/components/helpers/EmptyLoadingStates';

{loading ? (
  <LoadingState message="Loading customers..." />
) : customers.length === 0 ? (
  <EmptyState
    icon={User}
    title="No customers found"
    description="Get started by adding your first customer."
    hasSearch={!!searchTerm}
  />
) : (
  <CustomerList customers={customers} />
)}
```

## 🚀 Deployment

### Environment Variables
```env
# Production environment
NEXT_PUBLIC_API_BASE_URL=https://api.promowe.com/
NEXT_PUBLIC_APP_NAME=PPI Admin
NEXT_PUBLIC_COMPANY_NAME=Promotional Product Inc
NODE_ENV=production
```

### Build Commands
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Production build
npm run build

# Start production server
npm start

# Clean build cache
npm run clean
```

### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔍 Monitoring & Debugging

### Performance Monitoring
```typescript
// Built-in navigation performance tracking
import { NavigationPerformanceMonitor } from '@/lib/routeOptimization';

const stopTiming = NavigationPerformanceMonitor.startTiming('/customers');
// Route navigation
stopTiming(); // Logs performance metrics
```

### Error Monitoring
- Console error tracking
- API error logging
- User feedback collection
- Performance metrics

### Debug Tools
```bash
# Development debugging
npm run dev -- --inspect

# Bundle analysis
npm run build
npm run analyze
```

## 🤝 Contributing

### Development Workflow
1. Create feature branch from `main`
2. Follow TypeScript strict mode
3. Write tests for new features
4. Ensure components are accessible
5. Update documentation
6. Submit pull request

### Code Quality
- **ESLint**: Configured with Next.js rules
- **TypeScript**: Strict mode enabled
- **Prettier**: Code formatting (configure as needed)
- **Husky**: Pre-commit hooks (can be added)

### Testing Strategy
```bash
# Unit tests (framework ready)
npm run test

# E2E tests (framework ready)
npm run test:e2e

# Type checking
npm run type-check
```

## 📚 Additional Resources

### Documentation
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)

### API Documentation
- Internal API endpoints documented in `/lib/api.ts`
- Swagger documentation: `${API_BASE_URL}/swagger` (if available)

### Design System
- Lucide React Icons: [https://lucide.dev/](https://lucide.dev/)
- Tailwind Color Palette: [https://tailwindcss.com/docs/customizing-colors](https://tailwindcss.com/docs/customizing-colors)

## 📞 Support & Contact

### Development Team
- **Primary Contact**: Cogni GenNxt
- **Website**: [www.cognigennxt.com](https://www.cognigennxt.com)
- **Repository**: Contact team for access

### Support Channels
1. Create an issue in the repository
2. Check existing documentation
3. Contact the development team
4. Review API documentation

---

## 📄 License

This project is licensed under the **UNLICENSED** license - see the repository for details.

**Built with ❤️ by Cogni GenNxt for Promotional Product Inc**