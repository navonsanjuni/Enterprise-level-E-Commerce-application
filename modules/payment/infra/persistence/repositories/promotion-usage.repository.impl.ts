import { PrismaClient } from "@prisma/client";
import { IPromotionUsageRepository } from "../../../domain/repositories/promotion-usage.repository";
import { PromotionUsage } from "../../../domain/entities/promotion-usage.entity";
import { PromotionUsageId } from "../../../domain/value-objects/promotion-usage-id.vo";
import { PromotionId } from "../../../domain/value-objects/promotion-id.vo";
import { Money } from "../../../domain/value-objects/money.vo";
import { Currency } from "../../../domain/value-objects/currency.vo";

export class PromotionUsageRepositoryImpl implements IPromotionUsageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(usage: PromotionUsage): Promise<void> {
    const data = this.dehydrate(usage);
    await (this.prisma as any).promotionUsage.create({ data });
  }

  async findById(id: PromotionUsageId): Promise<PromotionUsage | null> {
    const record = await (this.prisma as any).promotionUsage.findUnique({
      where: { usageId: id.getValue() },
    });
    return record ? this.hydrate(record) : null;
  }

  async findByPromoId(promoId: PromotionId): Promise<PromotionUsage[]> {
    const records = await (this.prisma as any).promotionUsage.findMany({
      where: { promoId: promoId.getValue() },
      orderBy: { createdAt: "desc" },
    });
    return records.map((r: any) => this.hydrate(r));
  }

  async findByOrderId(orderId: string): Promise<PromotionUsage[]> {
    const records = await (this.prisma as any).promotionUsage.findMany({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    });
    return records.map((r: any) => this.hydrate(r));
  }

  async findByPromoIdAndOrderId(
    promoId: PromotionId,
    orderId: string,
  ): Promise<PromotionUsage | null> {
    const record = await (this.prisma as any).promotionUsage.findUnique({
      where: {
        promoId_orderId: {
          promoId: promoId.getValue(),
          orderId,
        },
      },
    });
    return record ? this.hydrate(record) : null;
  }

  async countUsageByPromoId(promoId: PromotionId): Promise<number> {
    return (this.prisma as any).promotionUsage.count({
      where: { promoId: promoId.getValue() },
    });
  }

  async delete(id: PromotionUsageId): Promise<void> {
    await (this.prisma as any).promotionUsage.delete({
      where: { usageId: id.getValue() },
    });
  }

  private hydrate(record: any): PromotionUsage {
    return PromotionUsage.fromPersistence({
      id: PromotionUsageId.fromString(record.usageId),
      promoId: PromotionId.fromString(record.promoId),
      orderId: record.orderId,
      discountAmount: Money.fromAmount(
        Number(record.discountAmount),
        Currency.create(record.currency ?? "USD"),
      ),
      createdAt: record.createdAt,
    });
  }

  private dehydrate(usage: PromotionUsage): any {
    return {
      usageId: usage.id.getValue(),
      promoId: usage.promoId.getValue(),
      orderId: usage.orderId,
      discountAmount: usage.discountAmount.getAmount(),
      currency: usage.discountAmount.getCurrency().getValue(),
      createdAt: usage.createdAt,
    };
  }
}
