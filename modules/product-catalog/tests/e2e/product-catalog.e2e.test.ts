import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { createServer } from "../../../../apps/api/src/server";
import { PrismaClient, ProductStatusEnum, RegionEnum } from "@prisma/client";

describe("Product Catalog Module E2E", () => {
  let app: FastifyInstance;
  const prisma = new PrismaClient();
  let adminToken: string;
  let categoryId: string;
  let productId: string;
  let secondProductId: string;
  let variantId: string;
  let secondVariantId: string;
  let assetId: string;
  let tagId: string;
  let sizeGuideId: string;
  let regionalSizeGuideId: string;
  let editorialLookId: string;
  let duplicatedEditorialLookId: string;
  let bulkTagIds: string[] = [];
  let bulkSizeGuideIds: string[] = [];
  let bulkEditorialLookIds: string[] = [];

  const adminUser = {
    email: "catalog-admin@example.com",
    password: "AdminPassword123!",
    firstName: "Catalog",
    lastName: "Admin"
  };

  beforeAll(async () => {
    app = await createServer();
    await app.ready();

    // 1. WIPE ALL DATA for product catalog module
    // Delete in order of dependency to respect FK constraints
    await prisma.editorialLookProduct.deleteMany();
    await prisma.editorialLook.deleteMany();
    await prisma.productCategory.deleteMany();
    await prisma.productMedia.deleteMany();
    await prisma.variantMedia.deleteMany();
    await prisma.productTagAssociation.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.mediaAsset.deleteMany();
    await prisma.productTag.deleteMany();
    await prisma.sizeGuide.deleteMany();

    // Ensure admin user exists and get token
    await prisma.user.deleteMany({ where: { email: adminUser.email } });
    
    // Register as customer first (registration always creates CUSTOMER role)
    await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: adminUser
    });

    // Directly update the user's role to ADMIN in the database
    await prisma.user.update({
      where: { email: adminUser.email },
      data: { role: "ADMIN" }
    });

    const loginRes = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email: adminUser.email, password: adminUser.password }
    });
    adminToken = JSON.parse(loginRes.body).data.accessToken;

    console.log("✓ Database wiped and Admin authenticated for Product Catalog E2E");
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe("1. Category Management (category.routes.ts)", () => {
    it("POST /categories (Create Root)", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/categories",
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { name: "Electronics", slug: "electronics", position: 1 }
      });
      expect(res.statusCode).toBe(201);
      categoryId = JSON.parse(res.body).data.id;
    });

    it("GET /categories", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/categories" });
      expect(res.statusCode).toBe(200);
    });

    it("GET /categories/hierarchy", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/categories/hierarchy" });
      expect(res.statusCode).toBe(200);
    });

    it("GET /categories/slug/:slug", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/categories/slug/electronics" });
      expect(res.statusCode).toBe(200);
    });

    it("GET /categories/:id", async () => {
      const res = await app.inject({ method: "GET", url: `/api/v1/categories/${categoryId}` });
      expect(res.statusCode).toBe(200);
    });

    it("POST /categories/reorder", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/categories/reorder",
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { categoryOrders: [{ id: categoryId, position: 1 }] }
      });
      expect(res.statusCode).toBe(204);
    });

    it("PATCH /categories/:id", async () => {
      const res = await app.inject({
        method: "PATCH",
        url: `/api/v1/categories/${categoryId}`,
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { name: "Consumer Electronics" }
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe("2. Product Management (product.routes.ts)", () => {
    it("POST /products", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/products",
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { title: "Smartphone X" }
      });
      expect(res.statusCode).toBe(201);
      productId = JSON.parse(res.body).data.id;
    });

    it("POST /products (Create Secondary)", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/products",
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { title: "Smartphone Y" }
      });
      expect(res.statusCode).toBe(201);
      secondProductId = JSON.parse(res.body).data.id;
    });

    it("GET /products", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/products" });
      expect(res.statusCode).toBe(200);
    });

    it("GET /products/slug/:slug", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/products/slug/smartphone-x" });
      expect(res.statusCode).toBe(200);
    });

    it("GET /products/:productId", async () => {
      const res = await app.inject({ method: "GET", url: `/api/v1/products/${productId}` });
      expect(res.statusCode).toBe(200);
    });

    it("PATCH /products/:productId", async () => {
      const res = await app.inject({
        method: "PATCH",
        url: `/api/v1/products/${productId}`,
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { title: "Smartphone X Pro" }
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe("3. Variant Management (variant.routes.ts)", () => {
    it("POST /products/:productId/variants", async () => {
      const res = await app.inject({
        method: "POST",
        url: `/api/v1/products/${productId}/variants`,
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { sku: "SM-X-BLK", price: 999.99, color: "Black", size: "128GB" }
      });
      expect(res.statusCode).toBe(201);
      variantId = JSON.parse(res.body).data.id;
    });

    it("POST /products/:productId/variants (Secondary)", async () => {
      const res = await app.inject({
        method: "POST",
        url: `/api/v1/products/${secondProductId}/variants`,
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { sku: "SM-Y-BLK", price: 799.99, color: "Black", size: "256GB" }
      });
      expect(res.statusCode).toBe(201);
      secondVariantId = JSON.parse(res.body).data.id;
    });

    it("GET /products/:productId/variants", async () => {
      const res = await app.inject({ method: "GET", url: `/api/v1/products/${productId}/variants` });
      expect(res.statusCode).toBe(200);
    });

    it("GET /variants/:variantId", async () => {
      const res = await app.inject({ method: "GET", url: `/api/v1/variants/${variantId}` });
      expect(res.statusCode).toBe(200);
    });

    it("PATCH /variants/:variantId", async () => {
      const res = await app.inject({
        method: "PATCH",
        url: `/api/v1/variants/${variantId}`,
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { price: 899.99 }
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe("4. Media Management (media.routes.ts & product-media.routes.ts & variant-media.routes.ts)", () => {
    it("POST /media (Create Asset)", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/media",
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { storageKey: "test.jpg", mime: "image/jpeg" }
      });
      expect(res.statusCode).toBe(201);
      assetId = JSON.parse(res.body).data.id;
    });

    it("GET /media", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/media",
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(200);
    });

    it("GET /media/:id", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/api/v1/media/${assetId}`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(200);
    });

    it("PATCH /media/:id", async () => {
      const res = await app.inject({
        method: "PATCH",
        url: `/api/v1/media/${assetId}`,
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { altText: "Updated Alt" }
      });
      expect(res.statusCode).toBe(200);
    });

    // product-media.routes.ts
    it("POST /products/:productId/media (Associate)", async () => {
      const res = await app.inject({
        method: "POST",
        url: `/api/v1/products/${productId}/media`,
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { assetId, isCover: true, position: 1 }
      });
      expect(res.statusCode).toBe(201);
    });

    it("GET /products/:productId/media", async () => {
      const res = await app.inject({ method: "GET", url: `/api/v1/products/${productId}/media` });
      expect(res.statusCode).toBe(200);
    });

    it("GET /products/:productId/media/statistics", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/api/v1/products/${productId}/media/statistics`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(200);
    });

    it("GET /products/:productId/media/validation", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/api/v1/products/${productId}/media/validation`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(200);
    });

    it("GET /products/by-asset/:assetId", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/api/v1/products/by-asset/${assetId}`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(200);
    });


      it("POST /variants/:variantId/media/set", async () => {
        const res = await app.inject({
          method: "POST",
          url: `/api/v1/variants/${variantId}/media/set`,
          headers: { Authorization: `Bearer ${adminToken}` },
          payload: { assetIds: [assetId] }
        });
        expect(res.statusCode).toBe(204);
      });

      it("POST /variants/:variantId/media/bulk", async () => {
        const res = await app.inject({
          method: "POST",
          url: `/api/v1/variants/${variantId}/media/bulk`,
          headers: { Authorization: `Bearer ${adminToken}` },
          payload: { assetIds: [assetId] }
        });
        expect(res.statusCode).toBe(201);
      });

      it("POST /variants/:sourceVariantId/media/duplicate-to/:targetVariantId", async () => {
        const res = await app.inject({
          method: "POST",
          url: `/api/v1/variants/${variantId}/media/duplicate-to/${secondVariantId}`,
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        expect(res.statusCode).toBe(201);
      });

      it("POST /variants/media/bulk-assign", async () => {
        const res = await app.inject({
          method: "POST",
          url: "/api/v1/variants/media/bulk-assign",
          headers: { Authorization: `Bearer ${adminToken}` },
          payload: { variantIds: [variantId, secondVariantId], assetId }
        });
        expect(res.statusCode).toBe(201);
      });

      it("POST /variants/media/copy", async () => {
        const res = await app.inject({
          method: "POST",
          url: "/api/v1/variants/media/copy",
          headers: { Authorization: `Bearer ${adminToken}` },
          payload: {
            sourceProductId: productId,
            targetProductId: secondProductId,
            variantMapping: { [variantId]: secondVariantId }
          }
        });
        expect(res.statusCode).toBe(201);
      });
    it("GET /products/by-asset/:assetId/count", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/api/v1/products/by-asset/${assetId}/count`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(200);
    });

    it("POST /products/:productId/media/cover", async () => {
      const res = await app.inject({
        method: "POST",
        url: `/api/v1/products/${productId}/media/cover`,
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { assetId }
      });
      expect(res.statusCode).toBe(204);
    });

    it("POST /products/:productId/media/reorder", async () => {
      const res = await app.inject({
        method: "POST",
        url: `/api/v1/products/${productId}/media/reorder`,
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { mediaOrders: [{ assetId, position: 1 }] }
      });
      expect(res.statusCode).toBe(204);
    });

    it("PUT /products/:productId/media (Set all)", async () => {
      const res = await app.inject({
        method: "PUT",
        url: `/api/v1/products/${productId}/media`,
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { assets: [{ assetId, position: 1, isCover: true }] }
      });
      expect(res.statusCode).toBe(204);
    });

    it("POST /products/:sourceProductId/media/duplicate-to/:targetProductId", async () => {
      const res = await app.inject({
        method: "POST",
        url: `/api/v1/products/${productId}/media/duplicate-to/${secondProductId}`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(201);
    });

    it("DELETE /products/:productId/media/cover", async () => {
      const res = await app.inject({
        method: "DELETE",
        url: `/api/v1/products/${productId}/media/cover`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(204);
    });

    it("DELETE /products/:productId/media", async () => {
      const res = await app.inject({
        method: "DELETE",
        url: `/api/v1/products/${secondProductId}/media`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(204);
    });

    // variant-media.routes.ts
    it("POST /variants/:variantId/media", async () => {
      const res = await app.inject({
        method: "POST",
        url: `/api/v1/variants/${variantId}/media`,
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { assetId, displayOrder: 1 }
      });
      expect(res.statusCode).toBe(201);
    });

    it("GET /variants/:variantId/media", async () => {
      const res = await app.inject({ method: "GET", url: `/api/v1/variants/${variantId}/media` });
      expect(res.statusCode).toBe(200);
    });

    it("GET /products/:productId/variants/media", async () => {
      const res = await app.inject({ method: "GET", url: `/api/v1/products/${productId}/variants/media` });
      expect(res.statusCode).toBe(200);
    });

    it("GET /media/:assetId/variants", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/api/v1/media/${assetId}/variants`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(200);
    });

    it("GET /media/:assetId/usage-count", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/api/v1/media/${assetId}/usage-count`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(200);
    });

    it("GET /variants/media/unused-assets", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/variants/media/unused-assets",
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(200);
    });

    it("GET /variants/:variantId/media/statistics", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/api/v1/variants/${variantId}/media/statistics`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(200);
    });

    it("GET /variants/:variantId/media/validation", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/api/v1/variants/${variantId}/media/validation`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(200);
    });

    it("GET /products/:productId/variants/media/color/Black", async () => {
      const res = await app.inject({ method: "GET", url: `/api/v1/products/${productId}/variants/media/color/Black` });
      expect(res.statusCode).toBe(200);
    });

    it("GET /products/:productId/variants/media/size/128GB", async () => {
      const res = await app.inject({ method: "GET", url: `/api/v1/products/${productId}/variants/media/size/128GB` });
      expect(res.statusCode).toBe(200);
    });
  });

  describe("5. Tag Management (product-tag.routes.ts)", () => {
    it("POST /tags/bulk", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/tags/bulk",
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: {
          tags: [
            { tag: "Limited Offer", kind: "marketing" },
            { tag: "Clearance", kind: "marketing" }
          ]
        }
      });
      expect(res.statusCode).toBe(201);
      bulkTagIds = JSON.parse(res.body).data.map((tag: any) => tag.id);
    });

    it("POST /tags", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/tags",
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { tag: "New Arrival", kind: "marketing" }
      });
      expect(res.statusCode).toBe(201);
      tagId = JSON.parse(res.body).data.id;
    });

    it("GET /tags", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/tags" });
      expect(res.statusCode).toBe(200);
    });

    it("GET /tags/by-name/New Arrival", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/tags/by-name/New Arrival" });
      expect(res.statusCode).toBe(200);
    });

    it("GET /tags/by-name/New Arrival/validation", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/tags/by-name/New Arrival/validation" });
      expect(res.statusCode).toBe(200);
    });

    it("GET /tags/suggestions", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/tags/suggestions?query=New" });
      expect(res.statusCode).toBe(200);
    });

    it("GET /tags/stats", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/tags/stats",
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(200);
    });

    it("GET /tags/most-used", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/tags/most-used" });
      expect(res.statusCode).toBe(200);
    });

    it("GET /tags/:id", async () => {
      const res = await app.inject({ method: "GET", url: `/api/v1/tags/${tagId}` });
      expect(res.statusCode).toBe(200);
    });

    it("PATCH /tags/:id", async () => {
      const res = await app.inject({
        method: "PATCH",
        url: `/api/v1/tags/${tagId}`,
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { tag: "New Arrival Updated" }
      });
      expect(res.statusCode).toBe(200);
    });

    it("POST /products/:productId/tags", async () => {
      const res = await app.inject({
        method: "POST",
        url: `/api/v1/products/${productId}/tags`,
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { tagIds: [tagId] }
      });
      expect(res.statusCode).toBe(204);
    });

    it("GET /products/:productId/tags", async () => {
      const res = await app.inject({ method: "GET", url: `/api/v1/products/${productId}/tags` });
      expect(res.statusCode).toBe(200);
    });

    it("GET /tags/:tagId/products", async () => {
      const res = await app.inject({ method: "GET", url: `/api/v1/tags/${tagId}/products` });
      expect(res.statusCode).toBe(200);
    });

    it("DELETE /products/:productId/tags/:tagId", async () => {
      const res = await app.inject({
        method: "DELETE",
        url: `/api/v1/products/${productId}/tags/${tagId}`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(204);
    });

    it("DELETE /tags/bulk", async () => {
      const res = await app.inject({
        method: "DELETE",
        url: "/api/v1/tags/bulk",
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { ids: bulkTagIds }
      });
      expect(res.statusCode).toBe(204);
    });
  });

  describe("6. Search & Discovery (search.routes.ts)", () => {
    it("GET /search", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/search?q=Smartphone" });
      expect(res.statusCode).toBe(200);
    });

    it("GET /search/suggestions", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/search/suggestions?query=Smart" });
      expect(res.statusCode).toBe(200);
    });

    it("GET /search/popular", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/search/popular" });
      expect(res.statusCode).toBe(200);
    });

    it("GET /search/filters", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/search/filters?q=Smart" });
      expect(res.statusCode).toBe(200);
    });

    it("GET /search/stats", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/search/stats",
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe("7. Size Guides (size-guide.routes.ts)", () => {
    it("POST /size-guides", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/size-guides",
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { title: "E-Guide", region: RegionEnum.US, category: "Electronics", bodyHtml: "Content" }
      });
      expect(res.statusCode).toBe(201);
      sizeGuideId = JSON.parse(res.body).data.id;
    });

    it("POST /size-guides/bulk", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/size-guides/bulk",
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: {
          guides: [
            { title: "Clothing Guide", region: RegionEnum.EU, category: "Apparel", bodyHtml: "EU content" },
            { title: "Shoes Guide", region: RegionEnum.UK, category: "Footwear", bodyHtml: "UK content" }
          ]
        }
      });
      expect(res.statusCode).toBe(201);
      bulkSizeGuideIds = JSON.parse(res.body).data.map((guide: any) => guide.id);
    });

    it("POST /size-guides/region/:region", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/size-guides/region/US",
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { title: "US Electronics Guide", bodyHtml: "Regional content", category: "Electronics" }
      });
      expect(res.statusCode).toBe(201);
      regionalSizeGuideId = JSON.parse(res.body).data.id;
    });

    it("GET /size-guides", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/size-guides" });
      expect(res.statusCode).toBe(200);
    });

    it("GET /size-guides/stats", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/size-guides/stats",
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(200);
    });

    it("GET /size-guides/regions", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/size-guides/regions" });
      expect(res.statusCode).toBe(200);
    });

    it("GET /size-guides/categories", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/size-guides/categories" });
      expect(res.statusCode).toBe(200);
    });

    it("GET /size-guides/general/US", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/size-guides/general/US" });
      expect(res.statusCode).toBe(200);
    });

    it("GET /size-guides/region/US", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/size-guides/region/US" });
      expect(res.statusCode).toBe(200);
    });

    it("GET /size-guides/validate", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/size-guides/validate?region=US&category=Electronics" });
      expect(res.statusCode).toBe(200);
    });

    it("GET /size-guides/:id", async () => {
      const res = await app.inject({ method: "GET", url: `/api/v1/size-guides/${sizeGuideId}` });
      expect(res.statusCode).toBe(200);
    });

    it("PATCH /size-guides/:id/content", async () => {
      const res = await app.inject({
        method: "PATCH",
        url: `/api/v1/size-guides/${sizeGuideId}/content`,
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { htmlContent: "Updated size guide content" }
      });
      expect(res.statusCode).toBe(200);
    });

    it("PATCH /size-guides/:id", async () => {
      const res = await app.inject({
        method: "PATCH",
        url: `/api/v1/size-guides/${sizeGuideId}`,
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { title: "E-Guide Updated", category: "Consumer Electronics" }
      });
      expect(res.statusCode).toBe(200);
    });

    it("DELETE /size-guides/:id/content", async () => {
      const res = await app.inject({
        method: "DELETE",
        url: `/api/v1/size-guides/${sizeGuideId}/content`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(204);
    });

    it("DELETE /size-guides/bulk", async () => {
      const res = await app.inject({
        method: "DELETE",
        url: "/api/v1/size-guides/bulk",
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { ids: bulkSizeGuideIds }
      });
      expect(res.statusCode).toBe(204);
    });
  });

  describe("8. Editorial Looks (editorial-look.routes.ts)", () => {
    it("POST /editorial-looks", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/editorial-looks",
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { title: "Summer Vibes", storyHtml: "<p>Look story</p>" }
      });
      expect(res.statusCode).toBe(201);
      editorialLookId = JSON.parse(res.body).data.id;
    });

    it("POST /editorial-looks/bulk", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/editorial-looks/bulk",
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: {
          looks: [
            { title: "Autumn Edit", storyHtml: "<p>Autumn</p>", productIds: [productId] },
            { title: "Winter Edit", storyHtml: "<p>Winter</p>", productIds: [secondProductId] }
          ]
        }
      });
      expect(res.statusCode).toBe(201);
      bulkEditorialLookIds = JSON.parse(res.body).data.map((look: any) => look.id);
    });

    it("POST /editorial-looks/bulk/publish", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/editorial-looks/bulk/publish",
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { ids: bulkEditorialLookIds }
      });
      expect(res.statusCode).toBe(200);
    });

    it("POST /editorial-looks/process-scheduled", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/editorial-looks/process-scheduled",
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(200);
    });

    it("GET /editorial-looks", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/editorial-looks" });
      expect(res.statusCode).toBe(200);
    });

    it("GET /editorial-looks/stats", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/editorial-looks/stats",
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(200);
    });

    it("GET /editorial-looks/ready-to-publish", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/editorial-looks/ready-to-publish",
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(200);
    });

    it("GET /editorial-looks/popular-products", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/editorial-looks/popular-products" });
      expect(res.statusCode).toBe(200);
    });

    it("GET /editorial-looks/:id", async () => {
      const res = await app.inject({ method: "GET", url: `/api/v1/editorial-looks/${editorialLookId}` });
      expect(res.statusCode).toBe(200);
    });

    it("POST /editorial-looks/:id/hero", async () => {
      const res = await app.inject({
        method: "POST",
        url: `/api/v1/editorial-looks/${editorialLookId}/hero`,
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { assetId }
      });
      expect(res.statusCode).toBe(200);
    });

    it("POST /editorial-looks/:id/products", async () => {
      const res = await app.inject({
        method: "POST",
        url: `/api/v1/editorial-looks/${editorialLookId}/products`,
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { productIds: [secondProductId] }
      });
      expect(res.statusCode).toBe(204);
    });

    it("POST /editorial-looks/:id/products/:productId", async () => {
      const res = await app.inject({
        method: "POST",
        url: `/api/v1/editorial-looks/${editorialLookId}/products/${productId}`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(204);
    });

    it("POST /editorial-looks/:id/publish", async () => {
      const res = await app.inject({
        method: "POST",
        url: `/api/v1/editorial-looks/${editorialLookId}/publish`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(200);
    });

    it("POST /editorial-looks/:id/unpublish", async () => {
      const res = await app.inject({
        method: "POST",
        url: `/api/v1/editorial-looks/${editorialLookId}/unpublish`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(200);
    });

    it("POST /editorial-looks/:id/schedule", async () => {
      const res = await app.inject({
        method: "POST",
        url: `/api/v1/editorial-looks/${editorialLookId}/schedule`,
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { publishDate: new Date(Date.now() + 3600000).toISOString() }
      });
      expect(res.statusCode).toBe(200);
    });

    it("POST /editorial-looks/:id/duplicate", async () => {
      const res = await app.inject({
        method: "POST",
        url: `/api/v1/editorial-looks/${editorialLookId}/duplicate`,
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { newTitle: "Summer Vibes Copy" }
      });
      expect(res.statusCode).toBe(201);
      duplicatedEditorialLookId = JSON.parse(res.body).data.id;
    });

    it("PATCH /editorial-looks/:id/story", async () => {
      const res = await app.inject({
        method: "PATCH",
        url: `/api/v1/editorial-looks/${editorialLookId}/story`,
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { storyHtml: "<p>Updated story</p>" }
      });
      expect(res.statusCode).toBe(200);
    });

    it("PATCH /editorial-looks/:id", async () => {
      const res = await app.inject({
        method: "PATCH",
        url: `/api/v1/editorial-looks/${editorialLookId}`,
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { title: "Summer Vibes Updated" }
      });
      expect(res.statusCode).toBe(200);
    });

    it("DELETE /editorial-looks/:id/hero", async () => {
      const res = await app.inject({
        method: "DELETE",
        url: `/api/v1/editorial-looks/${editorialLookId}/hero`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(204);
    });

    it("DELETE /editorial-looks/bulk", async () => {
      const res = await app.inject({
        method: "DELETE",
        url: "/api/v1/editorial-looks/bulk",
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { ids: bulkEditorialLookIds }
      });
      expect(res.statusCode).toBe(204);
    });

    it("GET /editorial-looks/:id/products", async () => {
      const res = await app.inject({ method: "GET", url: `/api/v1/editorial-looks/${editorialLookId}/products` });
      expect(res.statusCode).toBe(200);
    });

    it("GET /products/:productId/editorial-looks", async () => {
      const res = await app.inject({ method: "GET", url: `/api/v1/products/${productId}/editorial-looks` });
      expect(res.statusCode).toBe(200);
    });
  });

  describe("9. Final Cleanup Operations (Deletions)", () => {
    it("DELETE /editorial-looks/:id", async () => {
      const res = await app.inject({
        method: "DELETE",
        url: `/api/v1/editorial-looks/${editorialLookId}`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(204);
    });

    it("DELETE /editorial-looks/:id (Duplicate)", async () => {
      const res = await app.inject({
        method: "DELETE",
        url: `/api/v1/editorial-looks/${duplicatedEditorialLookId}`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(204);
    });

    it("DELETE /variants/:variantId/media/:assetId", async () => {
      const res = await app.inject({
        method: "DELETE",
        url: `/api/v1/variants/${variantId}/media/${assetId}`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(204);
    });

    it("DELETE /variants/:variantId/media", async () => {
      const res = await app.inject({
        method: "DELETE",
        url: `/api/v1/variants/${secondVariantId}/media`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(204);
    });

    it("DELETE /products/:productId/media/:assetId", async () => {
      const res = await app.inject({
        method: "DELETE",
        url: `/api/v1/products/${productId}/media/${assetId}`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(204);
    });

    it("DELETE /media/:id", async () => {
      const res = await app.inject({
        method: "DELETE",
        url: `/api/v1/media/${assetId}`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(204);
    });

    it("DELETE /variants/:variantId", async () => {
      const res = await app.inject({
        method: "DELETE",
        url: `/api/v1/variants/${variantId}`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(204);
    });

    it("DELETE /products/:productId", async () => {
      const res = await app.inject({
        method: "DELETE",
        url: `/api/v1/products/${productId}`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(204);
    });

    it("DELETE /products/:productId (Secondary)", async () => {
      const res = await app.inject({
        method: "DELETE",
        url: `/api/v1/products/${secondProductId}`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(204);
    });

    it("DELETE /categories/:id", async () => {
      const res = await app.inject({
        method: "DELETE",
        url: `/api/v1/categories/${categoryId}`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(204);
    });

    it("DELETE /tags/:id", async () => {
      const res = await app.inject({
        method: "DELETE",
        url: `/api/v1/tags/${tagId}`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(204);
    });

    it("DELETE /size-guides/:id", async () => {
      const res = await app.inject({
        method: "DELETE",
        url: `/api/v1/size-guides/${sizeGuideId}`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(204);
    });

    it("DELETE /size-guides/:id (Regional)", async () => {
      const res = await app.inject({
        method: "DELETE",
        url: `/api/v1/size-guides/${regionalSizeGuideId}`,
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.statusCode).toBe(204);
    });
  });
});
