import { PrismaClient } from "@prisma/client";
import {
  ILoyaltyAccountRepository,
  LoyaltyAccountFilters,
  LoyaltyAccountQueryOptions,
} from "../../../domain/repositories/loyalty-account.repository";
import { LoyaltyAccount } from "../../../domain/entities/loyalty-account.entity";
import { LoyaltyAccountId } from "../../../domain/value-objects/loyalty-account-id.vo";
import { Points } from "../../../domain/value-objects/points.vo";
import { Tier } from "../../../domain/value-objects/tier.vo";
import { PaginatedResult } from "../../../../../packages/core/src/domain/interfaces/paginated-result.interface";

export class LoyaltyAccountRepositoryImpl implements ILoyaltyAccountRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(account: LoyaltyAccount): Promise<void> {
    const data = this.dehydrate(account);
    await this.prisma.loyaltyAccount.create({ data });
  }

  async update(account: LoyaltyAccount): Promise<void> {
    const data = this.dehydrate(account);
    const { accountId, ...updateData } = data;
    await this.prisma.loyaltyAccount.update({
      where: { accountId },
      data: updateData,
    });
  }

  async delete(id: LoyaltyAccountId): Promise<void> {
    await this.prisma.loyaltyAccount.delete({
      where: { accountId: id.getValue() },
    });
  }

  async findById(id: LoyaltyAccountId): Promise<LoyaltyAccount | null> {
    const record = await this.prisma.loyaltyAccount.findUnique({
      where: { accountId: id.getValue() },
    });
    return record ? this.hydrate(record) : null;
  }

  async findByUserId(userId: string): Promise<LoyaltyAccount | null> {
    const record = await this.prisma.loyaltyAccount.findFirst({
      where: { userId },
    });
    return record ? this.hydrate(record) : null;
  }

  async findWithFilters(
    filters: LoyaltyAccountFilters,
    options?: LoyaltyAccountQueryOptions,
  ): Promise<PaginatedResult<LoyaltyAccount>> {
    const where: any = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.tier) where.tier = filters.tier;
    if (filters.minPoints !== undefined) {
      where.currentBalance = { gte: filters.minPoints };
    }

    const [records, total] = await Promise.all([
      this.prisma.loyaltyAccount.findMany({
        where,
        take: options?.limit,
        skip: options?.offset,
        orderBy: options?.sortBy
          ? { [options.sortBy]: options.sortOrder ?? "desc" }
          : { updatedAt: "desc" },
      }),
      this.prisma.loyaltyAccount.count({ where }),
    ]);

    const items = records.map((r) => this.hydrate(r));
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

  async count(filters?: LoyaltyAccountFilters): Promise<number> {
    const where: any = {};
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.tier) where.tier = filters.tier;
    if (filters?.minPoints !== undefined) {
      where.currentBalance = { gte: filters.minPoints };
    }
    return this.prisma.loyaltyAccount.count({ where });
  }

  async exists(id: LoyaltyAccountId): Promise<boolean> {
    const count = await this.prisma.loyaltyAccount.count({
      where: { accountId: id.getValue() },
    });
    return count > 0;
  }

  private hydrate(record: any): LoyaltyAccount {
    return LoyaltyAccount.fromPersistence({
      id: LoyaltyAccountId.fromString(record.accountId),
      userId: record.userId,
      currentBalance: Points.create(Number(record.currentBalance)),
      totalPointsEarned: Points.create(Number(record.totalPointsEarned)),
      totalPointsRedeemed: Points.create(Number(record.totalPointsRedeemed)),
      lifetimePoints: Points.create(Number(record.lifetimePoints)),
      tier: Tier.fromString(record.tier),
      joinedAt: record.joinedAt,
      lastActivityAt: record.lastActivityAt ?? null,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  private dehydrate(account: LoyaltyAccount): any {
    return {
      accountId: account.id.getValue(),
      userId: account.userId,
      currentBalance: account.currentBalance.getValue(),
      totalPointsEarned: account.totalPointsEarned.getValue(),
      totalPointsRedeemed: account.totalPointsRedeemed.getValue(),
      lifetimePoints: account.lifetimePoints.getValue(),
      tier: account.tier.getValue(),
      joinedAt: account.joinedAt,
      lastActivityAt: account.lastActivityAt ?? null,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }
}
