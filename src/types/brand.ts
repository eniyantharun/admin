export interface IBrand {
  id: string; 
  name: string;
  slug: string; 
  description: string | null;
  logoId: string; 
  logoKey: string; 
  logoDetails: {
    filename: string;
    contentType: string;
    width: number;
    height: number;
    size: number;
    isPublic: boolean;
  } | null;
  website: string | null; 
  frontendUrl: string | null; 
  imageUrl: string | null;
  enabled: boolean;
  // productCount: number; 
  createdAt: string;
  updatedAt: string;
}

export interface IBrandFormData {
  name: string;
  imageUrl: string; 
  websiteUrl: string; 
  description: string;
  enabled: boolean; 
}
