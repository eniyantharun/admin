import { api } from '@/lib/api';

export interface ProductDetailResponse {
  product: {
    id: number;
    isExclusive: boolean;
    name: string;
    slug: string;
    hasFreeSetup: boolean;
    hasFreeShipping: boolean;
    general: {
      form: {
        name: string;
        material: string | null;
        dimensions: string | null;
      };
    };
    supplier: {
      id: number;
      companyName: string;
      webUrl: string;
      emailAddress: string;
      telephoneNumber: string;
      importerKey: string;
      website: string;
    };
    dates: {
      indexedAt: string;
      importedAt: string;
      createdAt: string;
      updatedAt: string;
    };
    seo: {
      form: {
        customSlug: string;
        metaTitle: string;
        metaDescription: string;
      };
      defaultMetaTitle: string;
      generatedUrlSegment: string;
      slug: string;
    };
    merchantCenter: {
      form: {
        merchantCenterTitle: string | null;
        merchantCenterDescription: string;
      };
      isMerchantCenterEnabled: boolean;
      defaultMerchantCenterTitle: string;
    };
    visibility: string;
    pictures: Array<{
      id: number;
      index: number;
      variants: Array<{ id: number; name: string }>;
      colors: any[];
    }>;
    primaryPicture: {
      id: number;
      index: number;
    };
    shortDescription: string;
    tags: {
      categories: Array<{
        id: number;
        name: string;
        breadcrumb: Array<{ id: number; name: string }>;
      }>;
    };
    primaryPriceTable: {
      supplierItemNumber: string;
      setupCharge: number;
      variantName: string;
      methodName: string;
      tierPrice: {
        quantity: number;
        regularPrice: number;
        setupCharge: number;
      };
    };
    variants: Array<{
      id: number;
      name: string;
      supplierItemNumber: string;
    }>;
    shipping: {
      form: {
        packaging: string;
      };
    };
  };
}

export interface UpdateProductPayload {
  name?: string;
  material?: string;
  dimensions?: string;
  customSlug?: string;
  metaTitle?: string;
  metaDescription?: string;
  merchantCenterTitle?: string;
  merchantCenterDescription?: string;
  shortDescription?: string;
  visibility?: string;
  isExclusive?: boolean;
  isMerchantCenterEnabled?: boolean;
  hasFreeSetup?: boolean;
  hasFreeShipping?: boolean;
  packaging?: string;
}

export class ProductEditorService {
  static async getProductDetail(productId: string | number): Promise<ProductDetailResponse> {
    return api.get<ProductDetailResponse>(
      `/Admin/ProductEditor/GetProductDetail?Id=${productId}`
    );
  }

  static async updateProduct(
    productId: string | number,
    payload: UpdateProductPayload
  ): Promise<any> {
    return api.put(`/Admin/ProductEditor/UpdateProduct?Id=${productId}`, payload);
  }

  static async getProductPictures(productId: string | number): Promise<any> {
    return api.get(
      `/Admin/ProductEditor/GetProductPicturesList?productId=${productId}`
    );
  }

  static async getVariantsList(productId: string | number): Promise<any> {
    return api.get(
      `/Admin/ProductEditor/GetVariantsList?productId=${productId}`
    );
  }

  static async getDecorationMethods(productId: string | number): Promise<any> {
    return api.get(
      `/Admin/ProductEditor/GetDecorationMethods?productId=${productId}`
    );
  }

  static async getProductColorOptions(productId: string | number): Promise<any> {
    return api.get(
      `/Admin/ProductEditor/GetProductColorOptionsList?productId=${productId}`
    );
  }

  static getProductImageUrl(productId: number, pictureIndex: number): string {
    return `https://static2.promotionalproductinc.com/p2/src/${productId}/${pictureIndex}.webp`;
  }

  static getProductThumbnailUrl(productId: number, thumbIndex: number): string {
    return `https://static2.promotionalproductinc.com/p2/src/${productId}/${thumbIndex}.webp`;
  }
}