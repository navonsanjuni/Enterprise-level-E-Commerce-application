import { FastifyReply } from "fastify";
import { AuthenticatedRequest } from "@/api/src/shared/interfaces/authenticated-request.interface";
import {
  CreateProductInput,
  CreateProductHandler,
  UpdateProductInput,
  UpdateProductHandler,
  DeleteProductInput,
  DeleteProductHandler,
  GetProductInput,
  GetProductHandler,
  ListProductsInput,
  ListProductsHandler,
  SearchProductsInput,
  SearchProductsHandler,
} from "../../../application";
import { ProductManagementService } from "../../../application/services/product-management.service";
import { ResponseHelper } from "@/api/src/shared/response.helper";

export interface CreateProductRequest {
  title: string;
  brand?: string;
  shortDesc?: string;
  longDescHtml?: string;
  status?: "draft" | "published" | "scheduled";
  publishAt?: string;
  countryOfOrigin?: string;
  seoTitle?: string;
  seoDescription?: string;
  price?: number;
  priceSgd?: number;
  priceUsd?: number;
  compareAtPrice?: number;
  categoryIds?: string[];
  tags?: string[];
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  status?: "draft" | "published" | "scheduled" | "archived";
  brand?: string;
  categoryId?: string;
  search?: string;
  includeDrafts?: boolean;
  sortBy?: "createdAt" | "title" | "publishAt";
  sortOrder?: "asc" | "desc";
}

export class ProductController {
  constructor(
    private readonly createProductHandler: CreateProductHandler,
    private readonly updateProductHandler: UpdateProductHandler,
    private readonly deleteProductHandler: DeleteProductHandler,
    private readonly getProductHandler: GetProductHandler,
    private readonly listProductsHandler: ListProductsHandler,
    private readonly searchProductsHandler: SearchProductsHandler,
    private readonly productManagementService: ProductManagementService,
  ) {}


  async listProducts(
    request: AuthenticatedRequest<{ Querystring: ProductQueryParams }>,
    reply: FastifyReply,
  ) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        brand,
        categoryId,
        search,
        includeDrafts = false,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = request.query;

      let products: any[] = [];
      let totalCount = 0;
      const currentPage = Math.max(1, page);
      const currentLimit = Math.min(100, Math.max(1, limit));

      if (search) {
        const searchQuery: SearchProductsInput = {
          searchTerm: search,
          page: currentPage,
          limit: currentLimit,
          categoryId,
          brand,
          status,
          sortBy:
            sortBy === "createdAt" ||
            sortBy === "title" ||
            sortBy === "publishAt"
              ? sortBy
              : "relevance",
          sortOrder,
        };

        const searchResult = await this.searchProductsHandler.handle(searchQuery);
        products = searchResult.items;
        totalCount = searchResult.totalCount;
      } else {
        const query: ListProductsInput = {
          page: currentPage,
          limit: currentLimit,
          status,
          brand,
          categoryId,
          includeDrafts,
          sortBy,
          sortOrder,
        };

        const result = await this.listProductsHandler.handle(query);
        products = result.items;
        totalCount = result.totalCount;
      }

      const productIds = products.map(
        (p) => p.id || p.productId || p.product_id,
      );

      const enrichmentMap =
        await this.productManagementService.getProductEnrichment(productIds);

      const productsWithDetails = products.map((product) => {
        const pId = product.id || product.productId || product.product_id;
        const enriched = enrichmentMap.get(pId);

        return {
          productId: pId,
          title: product.title,
          slug: product.slug,
          brand: product.brand,
          shortDesc: product.shortDesc || product.short_desc,
          longDescHtml: product.longDescHtml || product.long_desc_html,
          status: product.status,
          publishAt: product.publishAt || product.publish_at,
          countryOfOrigin: product.countryOfOrigin || product.country_of_origin,
          seoTitle: product.seoTitle || product.seo_title,
          seoDescription: product.seoDescription || product.seo_description,
          price: product.price,
          priceSgd: product.priceSgd,
          priceUsd: product.priceUsd,
          compareAtPrice: product.compareAtPrice,
          createdAt: product.createdAt || product.created_at,
          updatedAt: product.updatedAt || product.updated_at,
          variants: enriched?.variants || [],
          images: enriched?.images || [],
          categories: enriched?.categories || [],
        };
      });

      return ResponseHelper.ok(reply, "Products retrieved successfully", {
        products: productsWithDetails,
        total: totalCount,
        page: currentPage,
        limit: currentLimit,
      });
    } catch (error) {
      return ResponseHelper.error(reply, error);
    }
  }

  async getProduct(
    request: AuthenticatedRequest<{ Params: { productId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { productId } = request.params;

      const query: GetProductInput = { productId };
      const productData = await this.getProductHandler.handle(query);

      const mediaEnrichment =
        await this.productManagementService.getProductMediaEnrichment(
          productId,
        );

      const productWithDetails = {
        ...productData,
        slug: productData?.slug || "",
        images: mediaEnrichment.images,
        media: mediaEnrichment.media,
      };

      return ResponseHelper.ok(
        reply,
        "Product retrieved successfully",
        productWithDetails,
      );
    } catch (error) {
      return ResponseHelper.error(reply, error);
    }
  }

  async getProductBySlug(
    request: AuthenticatedRequest<{ Params: { slug: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { slug } = request.params;

      const query: GetProductInput = { slug };
      const productData = await this.getProductHandler.handle(query);

      const enrichment =
        await this.productManagementService.getSingleProductEnrichment(
          productData.id,
        );

      const productWithDetails = {
        ...productData,
        variants: enrichment.variants,
        images: enrichment.images,
        categories: enrichment.categories,
      };

      return ResponseHelper.ok(
        reply,
        "Product retrieved successfully",
        productWithDetails,
      );
    } catch (error) {
      return ResponseHelper.error(reply, error);
    }
  }

  async createProduct(
    request: AuthenticatedRequest<{ Body: CreateProductRequest }>,
    reply: FastifyReply,
  ) {
    try {
      const productData = request.body;

      const command: CreateProductInput = {
        title: productData.title,
        brand: productData.brand,
        shortDesc: productData.shortDesc,
        longDescHtml: productData.longDescHtml,
        status: productData.status as any,
        publishAt: productData.publishAt
          ? new Date(productData.publishAt)
          : undefined,
        countryOfOrigin: productData.countryOfOrigin,
        seoTitle: productData.seoTitle,
        seoDescription: productData.seoDescription,
        price: productData.price,
        priceSgd: productData.priceSgd,
        priceUsd: productData.priceUsd,
        compareAtPrice: productData.compareAtPrice,
        categoryIds: productData.categoryIds,
        tags: productData.tags,
      };

      const result = await this.createProductHandler.handle(command);

      return ResponseHelper.fromCommand(
        reply,
        result,
        "Product created successfully",
        201,
      );
    } catch (error) {
      return ResponseHelper.error(reply, error);
    }
  }

  async updateProduct(
    request: AuthenticatedRequest<{
      Params: { productId: string };
      Body: UpdateProductRequest;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const { productId: id } = request.params;
      const updateData = request.body;

      const command: UpdateProductInput = {
        productId: id,
        title: updateData.title,
        brand: updateData.brand,
        shortDesc: updateData.shortDesc,
        longDescHtml: updateData.longDescHtml,
        status: updateData.status as any,
        publishAt: updateData.publishAt
          ? new Date(updateData.publishAt)
          : undefined,
        countryOfOrigin: updateData.countryOfOrigin,
        seoTitle: updateData.seoTitle,
        seoDescription: updateData.seoDescription,
        price: updateData.price,
        priceSgd: updateData.priceSgd,
        priceUsd: updateData.priceUsd,
        compareAtPrice: updateData.compareAtPrice,
        categoryIds: updateData.categoryIds,
        tags: updateData.tags,
      };

      const result = await this.updateProductHandler.handle(command);

      return ResponseHelper.fromCommand(
        reply,
        result,
        "Product updated successfully",
      );
    } catch (error) {
      return ResponseHelper.error(reply, error);
    }
  }

  async deleteProduct(
    request: AuthenticatedRequest<{ Params: { productId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { productId: id } = request.params;

      const command: DeleteProductInput = { productId: id };
      const result = await this.deleteProductHandler.handle(command);

      return ResponseHelper.fromCommand(
        reply,
        result,
        "Product deleted successfully",
        undefined,
        204,
      );
    } catch (error) {
      return ResponseHelper.error(reply, error);
    }
  }
}
