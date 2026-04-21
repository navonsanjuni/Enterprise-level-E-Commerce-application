import { PrismaClient } from "@prisma/client";
import {
  IPaymentWebhookEventRepository,
  WebhookEventFilters,
  WebhookEventQueryOptions,
} from "../../../domain/repositories/payment-webhook-event.repository";
import {
  PaymentWebhookEvent,
  WebhookEventData,
} from "../../../domain/entities/payment-webhook-event.entity";
import { WebhookEventId } from "../../../domain/value-objects/webhook-event-id.vo";
import { WebhookEventType } from "../../../domain/value-objects/webhook-event-type.vo";
import {
  PaginatedResult,
} from "../../../../../packages/core/src/domain/interfaces/paginated-result.interface";

export class PaymentWebhookEventRepositoryImpl implements IPaymentWebhookEventRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(event: PaymentWebhookEvent): Promise<void> {
    const data = this.dehydrate(event);
    await (this.prisma as any).paymentWebhookEvent.create({ data });
  }

  async findById(id: WebhookEventId): Promise<PaymentWebhookEvent | null> {
    const record = await (this.prisma as any).paymentWebhookEvent.findUnique({
      where: { eventId: id.getValue() },
    });
    return record ? this.hydrate(record) : null;
  }

  async findByProvider(provider: string): Promise<PaymentWebhookEvent[]> {
    const records = await (this.prisma as any).paymentWebhookEvent.findMany({
      where: { provider },
      orderBy: { createdAt: "desc" },
    });
    return records.map((r: any) => this.hydrate(r));
  }

  async findByEventType(eventType: WebhookEventType): Promise<PaymentWebhookEvent[]> {
    const records = await (this.prisma as any).paymentWebhookEvent.findMany({
      where: { eventType: eventType.getValue() },
      orderBy: { createdAt: "desc" },
    });
    return records.map((r: any) => this.hydrate(r));
  }

  async findWithFilters(
    filters: WebhookEventFilters,
    options?: WebhookEventQueryOptions,
  ): Promise<PaginatedResult<PaymentWebhookEvent>> {
    const where: any = {};
    if (filters.provider) where.provider = filters.provider;
    if (filters.eventType) where.eventType = filters.eventType.getValue();
    if (filters.createdAfter || filters.createdBefore) {
      where.createdAt = {};
      if (filters.createdAfter) where.createdAt.gte = filters.createdAfter;
      if (filters.createdBefore) where.createdAt.lte = filters.createdBefore;
    }

    const [records, total] = await Promise.all([
      (this.prisma as any).paymentWebhookEvent.findMany({
        where,
        take: options?.limit,
        skip: options?.offset,
        orderBy: { createdAt: options?.sortOrder ?? "desc" },
      }),
      (this.prisma as any).paymentWebhookEvent.count({ where }),
    ]);

    const items = records.map((r: any) => this.hydrate(r));
    const limit = options?.limit ?? total;
    const offset = options?.offset ?? 0;
    return {
      items,
      total,
      limit,
      offset,
      hasMore: offset + items.length < total,
    };
  }

  async count(filters?: WebhookEventFilters): Promise<number> {
    const where: any = {};
    if (filters?.provider) where.provider = filters.provider;
    if (filters?.eventType) where.eventType = filters.eventType.getValue();
    if (filters?.createdAfter || filters?.createdBefore) {
      where.createdAt = {};
      if (filters?.createdAfter) where.createdAt.gte = filters.createdAfter;
      if (filters?.createdBefore) where.createdAt.lte = filters.createdBefore;
    }
    return (this.prisma as any).paymentWebhookEvent.count({ where });
  }

  async exists(id: WebhookEventId): Promise<boolean> {
    const count = await (this.prisma as any).paymentWebhookEvent.count({
      where: { eventId: id.getValue() },
    });
    return count > 0;
  }

  private hydrate(record: any): PaymentWebhookEvent {
    return PaymentWebhookEvent.fromPersistence({
      id: WebhookEventId.fromString(record.eventId),
      provider: record.provider,
      eventType: WebhookEventType.fromString(record.eventType),
      eventData: record.eventData as WebhookEventData,
      createdAt: record.createdAt,
    });
  }

  private dehydrate(event: PaymentWebhookEvent): any {
    return {
      eventId: event.id.getValue(),
      provider: event.provider,
      eventType: event.eventType.getValue(),
      eventData: event.eventData,
      createdAt: event.createdAt,
    };
  }
}
