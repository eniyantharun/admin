// Theme Type Definitions
// Identical to category types but for themes

// Tree structure
export interface ThemeTreeNode {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  enabled: boolean;
  featured: boolean;
  isMainCategory: boolean;
  hasChildren: boolean;
  childrenLoaded: boolean;
  children: ThemeTreeNode[];
  level: number;
}

// Statistics
export interface ThemeStats {
  categoryId: number;
  totalProducts: number;
  enabledProducts: number;
  disabledProducts: number;
  blacklistedProducts: number;
  totalSubcategories: number;
  enabledSubcategories: number;
  disabledSubcategories: number;
}

// Detailed statistics for editor
export interface ThemeDetailedStats {
  categoryCount: number;
  subcategoryCount: number;
  directStats: {
    Enabled: number;
    Disabled: number;
    Blacklisted: number;
  };
  indirectStats: {
    Enabled: number;
    Disabled: number;
    Blacklisted: number;
  };
  exclusiveSubcategoryProductCount: number;
  nonExclusiveSubcategoryProductCount: number;
}

// Editor detail
export interface ThemeDetail {
  id: number;
  name: string;
  slug: string;
  general: {
    form: {
      name: string;
      slug: string;
      introduction: string | null;
      parentId: number | null;
      parentName: string | null;
      enabled: boolean;
      featured: boolean;
      isMainCategory: boolean;
    };
  };
  seo: {
    form: {
      metaTitle: string | null;
      metaDescription: string | null;
      metaKeywords: string | null;
      heading1: string | null;
      heading2: string | null;
      customSlug: string | null;
    };
    slugAliases: string[];
  };
  notes: {
    personalNotes: string | null;
  };
  images: {
    featuredImage: string | null;
    subcategoryImages: Array<{ id: string; url: string }>;
  };
  associations: {
    associatedCategories: Array<{
      id: number;
      name: string;
      includeInSearch: boolean;
    }>;
    articles: Array<{
      id: string;
      title: string;
    }>;
  };
  content: {
    tabs: Array<{
      id: string;
      title: string;
      content: string;
    }>;
  };
  mainCategory: {
    carousel: any;
    cards: any;
    expand: any;
  } | null;
}

// CRUD operations
export interface CreateThemeRequest {
  name: string;
  website: string;
  type: 'Category' | 'Theme';
}

export interface UpdateThemeRequest {
  id: number;
  general?: {
    name?: string;
    slug?: string | null;
    introduction?: string | null;
    parentId?: number | null;
    enabled?: boolean;
    featured?: boolean;
    isMainCategory?: boolean;
  };
  seo?: {
    metaTitle?: string | null;
    metaDescription?: string | null;
    metaKeywords?: string | null;
    heading1?: string | null;
    heading2?: string | null;
    slugAliases?: string[];
  };
  notes?: {
    personalNotes?: string | null;
  };
  images?: {
    featuredImageId?: string | null;
  };
  associations?: {
    associatedCategories?: Array<{
      targetId: number;
      includeInSearch: boolean;
    }>;
    articles?: string[];
  };
}

export interface DeleteThemeRequest {
  themeId: number;
  redirectToThemeId?: number | null;
}
