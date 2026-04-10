import { VariantId } from '../value-objects/variant-id.vo';
import { MediaAssetId } from '../value-objects/media-asset-id.vo';

export interface VariantMediaProps {
  id: string;
  variantId: VariantId;
  mediaAssetId: MediaAssetId;
  displayOrder: number;
  createdAt: Date;
}

export class VariantMedia {
  private props: VariantMediaProps;

  private constructor(props: VariantMediaProps) {
    this.props = props;
  }

  static create(params: {
    id: string;
    variantId: string;
    mediaAssetId: string;
    displayOrder: number;
  }): VariantMedia {
    const now = new Date();
    return new VariantMedia({
      id: params.id,
      variantId: VariantId.fromString(params.variantId),
      mediaAssetId: MediaAssetId.fromString(params.mediaAssetId),
      displayOrder: params.displayOrder,
      createdAt: now,
    });
  }

  static reconstitute(props: VariantMediaProps): VariantMedia {
    return new VariantMedia(props);
  }

  // Getters
  getId(): string {
    return this.props.id;
  }

  getVariantId(): VariantId {
    return this.props.variantId;
  }

  getMediaAssetId(): MediaAssetId {
    return this.props.mediaAssetId;
  }

  getDisplayOrder(): number {
    return this.props.displayOrder;
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  // Business methods
  updateDisplayOrder(order: number): void {
    this.props.displayOrder = order;
  }

  isForVariant(variantId: VariantId): boolean {
    return this.props.variantId.equals(variantId);
  }

  isForAsset(assetId: MediaAssetId): boolean {
    return this.props.mediaAssetId.equals(assetId);
  }

  equals(other: VariantMedia): boolean {
    return this.props.id === other.props.id;
  }

  static toDTO(entity: VariantMedia): VariantMediaDTO {
    return {
      id: entity.props.id,
      variantId: entity.props.variantId.getValue(),
      mediaAssetId: entity.props.mediaAssetId.getValue(),
      displayOrder: entity.props.displayOrder,
      createdAt: entity.props.createdAt.toISOString(),
    };
  }
}

export interface VariantMediaDTO {
  id: string;
  variantId: string;
  mediaAssetId: string;
  displayOrder: number;
  createdAt: string;
}
