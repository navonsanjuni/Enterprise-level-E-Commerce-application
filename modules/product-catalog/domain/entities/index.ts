export {
  Product,
  type ProductProps,
  type ProductDTO,
  ProductCreatedEvent,
  ProductPublishedEvent,
  ProductArchivedEvent,
} from "./product.entity";
export {
  ProductVariant,
  type ProductVariantProps,
  type ProductVariantDTO,
  type VariantDimensions,
  VariantCreatedEvent,
} from "./product-variant.entity";
export {
  Category,
  type CategoryProps,
  type CategoryDTO,
  CategoryCreatedEvent,
} from "./category.entity";
export {
  MediaAsset,
  type MediaAssetProps,
  type MediaAssetDTO,
  MediaAssetCreatedEvent,
} from "./media-asset.entity";
export {
  ProductTag,
  type ProductTagProps,
  type ProductTagDTO,
  TagCreatedEvent,
} from "./product-tag.entity";
export {
  SizeGuide,
  type SizeGuideProps,
  type SizeGuideDTO,
  SizeGuideCreatedEvent,
} from "./size-guide.entity";
export {
  EditorialLook,
  type EditorialLookProps,
  type EditorialLookDTO,
  type CreateEditorialLookData,
  EditorialLookCreatedEvent,
  EditorialLookPublishedEvent,
} from "./editorial-look.entity";

// Association entities
export {
  ProductCategory,
  type ProductCategoryProps,
  type ProductCategoryDTO,
} from "./product-category.entity";
export {
  ProductMedia,
  type ProductMediaProps,
  type ProductMediaDTO,
} from "./product-media.entity";
export {
  VariantMedia,
  type VariantMediaProps,
  type VariantMediaDTO,
} from "./variant-media.entity";
export {
  ProductTagAssociation,
  type ProductTagAssociationProps,
  type ProductTagAssociationDTO,
} from "./product-tag-association.entity";
export {
  EditorialLookProduct,
  type EditorialLookProductProps,
  type EditorialLookProductDTO,
} from "./editorial-look-product.entity";
