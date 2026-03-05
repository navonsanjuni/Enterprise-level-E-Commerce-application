/**
 * Cross-module service interfaces for cart module.
 * These define what cart needs from other modules,
 * decoupling it from their concrete implementations.
 */

// ---- Product Catalog: Variant Lookup ----

export interface ExternalVariantData {
  getId(): { getValue(): string };
  getProductId(): { getValue(): string };
  getSku(): { getValue(): string };
  getSize(): string | null;
  getColor(): string | null;
  getWeightG(): number | null;
}

export interface IExternalProductVariantRepository {
  findById(variantId: {
    getValue(): string;
  }): Promise<ExternalVariantData | null>;
}

// ---- Product Catalog: Product Lookup ----

export interface ExternalProductData {
  getId(): { getValue(): string };
  getTitle(): string;
  getSlug(): { getValue(): string };
  getPrice(): { getValue(): number };
}

export interface IExternalProductRepository {
  findById(productId: {
    getValue(): string;
  }): Promise<ExternalProductData | null>;
}

// ---- Product Catalog: Media Lookup ----

export interface ExternalProductMediaData {
  getAssetId(): { getValue(): string };
}

export interface IExternalProductMediaRepository {
  findByProductId(
    productId: { getValue(): string },
    options?: { sortBy?: string; sortOrder?: string },
  ): Promise<ExternalProductMediaData[]>;
}

export interface ExternalMediaAssetData {
  getStorageKey(): string;
  getAltText(): string | null;
}

export interface IExternalMediaAssetRepository {
  findById(assetId: {
    getValue(): string;
  }): Promise<ExternalMediaAssetData | null>;
}

// ---- Inventory: Stock Management ----

export interface IExternalStockService {
  adjustStock(
    variantId: string,
    locationId: string,
    quantityDelta: number,
    reason: string,
    referenceId?: string,
  ): Promise<unknown>;
  getTotalAvailableStock(variantId: string): Promise<number>;
}

// ---- Order Management: Product Snapshot ----

export interface ProductSnapshotData {
  productId: string;
  variantId: string;
  sku: string;
  name: string;
  variantName?: string;
  price: number;
  imageUrl?: string;
  weight?: number;
  attributes?: Record<string, any>;
}

export interface IProductSnapshotFactory {
  create(data: ProductSnapshotData): { toJSON(): ProductSnapshotData };
}

// ---- Admin: Settings ----

export interface ShippingRates {
  colombo: number;
  suburbs: number;
}

export interface IExternalSettingsService {
  getShippingRates(): Promise<ShippingRates>;
}

// ---- Infrastructure: Transaction Support ----

/**
 * Abstraction over database transaction capability.
 * Injected from infra layer (e.g. PrismaClient).
 */
export interface ITransactionRunner {
  $transaction<T>(fn: (tx: any) => Promise<T>): Promise<T>;
}
