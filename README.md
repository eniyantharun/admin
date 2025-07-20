# PPI Admin Portal

A modern, clean, and maintainable admin dashboard built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Clean Architecture**: Well-organized folder structure following Next.js best practices
- **Type Safety**: Full TypeScript support with proper type definitions
- **Modern UI**: Beautiful components built with Tailwind CSS
- **Authentication**: Secure auth system with JWT tokens
- **State Management**: Redux Toolkit for predictable state management
- **Responsive Design**: Mobile-first responsive design
- **Performance**: Optimized with Next.js App Router

## 📁 Project Structure

src/
├── app/                    # Next.js App Router pages
├── components/             # Reusable UI components
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and configurations
├── store/                  # Redux store and slices
├── types/                  # TypeScript type definitions
└── assets/                 # Static assets

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Authentication**: JWT with secure cookies
- **Icons**: Lucide React
- **HTTP Client**: Axios

## 🏃‍♂️ Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ppi-admin-portal

2. **Install dependencies**
    npm install

3. **Set up environment variables**
cp .env.example .env.local
Edit .env.local with your API configuration:
NEXT_PUBLIC_API_BASE_URL=https://api.promowe.com/
NEXT_PUBLIC_APP_NAME=PPI Admin Portal
NEXT_PUBLIC_COMPANY_NAME=Promotional Product Inc


4. **Run the development server**
bashnpm run dev

5. **Build for production**
bashnpm run build
npm start


**🎨 Theme Customization**
The project uses a centralized theme system in tailwind.config.ts. You can customize colors by modifying the theme configuration:
typescriptcolors: {
  primary: { /* Your primary colors */ },
  secondary: { /* Your secondary colors */ },
  danger: { /* Error/delete colors */ },
  success: { /* Success colors */ },
  warning: { /* Warning colors */ },
}
**🧩 Component Usage**
*Button Component*
tsximport { Button } from '@/components/ui/Button';
import { Plus, Edit, Trash } from 'lucide-react';

// Text button
<Button>Save Changes</Button>

// Icon + text
<Button icon={Plus}>Add New</Button>

// Icon only
<Button icon={Edit} iconOnly />

// Danger button
<Button variant="danger" icon={Trash}>Delete</Button>

// Small square icon button
<Button size="sm" icon={Edit} iconOnly />

*Card Component*
tsximport { Card } from '@/components/ui/Card';

<Card padding="lg" shadow="md">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>

*ListView Component*
tsximport { ListView } from '@/components/ui/ListView';

<ListView
  items={customers}
  keyExtractor={(item) => item.id}
  renderItem={(customer) => (
    <div className="p-4 border rounded">
      {customer.name}
    </div>
  )}
  emptyComponent={<div>No customers found</div>}
/>

*Image Component*
tsximport { Image } from '@/components/ui/Image';

<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={200}
  height={200}
  showFallback
/>

**🔐 Authentication**
The auth system is built with secure practices:

JWT tokens stored in secure HTTP-only cookies
Automatic token refresh
Route protection with AuthGuard
Centralized auth state management

*Using Auth Hook*
tsximport { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, login, logout, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      Welcome, {user?.username}!
      <button onClick={logout}>Logout</button>
    </div>
  );
}

*📱 Responsive Design*
The application is built mobile-first with responsive breakpoints:

sm: 640px and up
md: 768px and up
lg: 1024px and up
xl: 1280px and up

**🧪 Development Guidelines**
*File Organization*

Use kebab-case for file names
Components should be in PascalCase
Group related components in folders
Keep components small and focused

*TypeScript*
Always define proper interfaces
Use strict mode
Avoid any type
Export types from centralized locations

*Styling*
Use Tailwind utility classes
Prefer component variants over custom CSS
Use the centralized color system
Follow mobile-first approach

*State Management*
Use Redux for global state
Use React state for component-specific state
Keep actions and reducers simple
Use TypeScript with Redux

**🚀 Deployment**
*Environment Variables*
Make sure to set these in your production environment:

NEXT_PUBLIC_API_BASE_URL
NEXT_PUBLIC_APP_NAME
NEXT_PUBLIC_COMPANY_NAME

*Build Commands*
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint


**📊 Performance**
The application is optimized for performance:

Next.js App Router for optimal routing
Image optimization with Next.js Image component
Code splitting and lazy loading
Efficient state management
Minimal bundle size

*🤝 Contributing*

Create a feature branch from main
Make your changes following the coding guidelines
Test your changes thoroughly
Submit a pull request with a clear description

*📞 Support*
For support and questions:

Check the documentation in /docs
Create an issue in the repository
Contact the development team at www.cognigennxt.com

📄 License
This project is licensed under the UNLICENSED license.