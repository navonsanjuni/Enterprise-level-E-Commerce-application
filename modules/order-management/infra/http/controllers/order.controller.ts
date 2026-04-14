import { FastifyReply } from "fastify";
import { AuthenticatedRequest } from "@/api/src/shared/interfaces/authenticated-request.interface";
import { ResponseHelper } from "@/api/src/shared/response.helper";
import {
  CreateOrderCommand,
  CreateOrderHandler,
  UpdateOrderStatusCommand,
  UpdateOrderStatusCommandHandler,
  UpdateOrderTotalsCommand,
  UpdateOrderTotalsCommandHandler,
  MarkOrderPaidCommand,
  MarkOrderPaidCommandHandler,
  MarkOrderFulfilledCommand,
  MarkOrderFulfilledCommandHandler,
  CancelOrderCommand,
  CancelOrderCommandHandler,
  DeleteOrderCommand,
  DeleteOrderCommandHandler,
  GetOrderQuery,
  GetOrderHandler,
  ListOrdersQuery,
  ListOrdersHandler,
  GetOrderAddressQuery,
  GetOrderAddressHandler,
  ListOrderShipmentsQuery,
  ListOrderShipmentsHandler,
  OrderManagementService,
  ShipmentManagementService,
} from "../../../application";

export interface AddressInput {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface CreateOrderBody {
  guestToken?: string;
  items: Array<{
    variantId: string;
    quantity: number;
    isGift?: boolean;
    giftMessage?: string;
  }>;
  shippingAddress: AddressInput;
  billingAddress?: AddressInput;
  source?: string;
  currency?: string;
}

export interface TrackOrderQuerystring {
  orderNumber?: string;
  contact?: string;
  trackingNumber?: string;
}

export interface ListOrdersQuerystring {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "createdAt" | "updatedAt" | "orderNumber";
  sortOrder?: "asc" | "desc";
}

export interface UpdateOrderStatusBody {
  status: string;
}

export interface UpdateOrderTotalsBody {
  totals: {
    tax: number;
    shipping: number;
    discount: number;
  };
}

const STAFF_ROLES = ["ADMIN", "INVENTORY_STAFF", "CUSTOMER_SERVICE", "ANALYST"];

export class OrderController {
  private createOrderHandler: CreateOrderHandler;
  private getOrderHandler: GetOrderHandler;
  private listOrdersHandler: ListOrdersHandler;
  private updateOrderStatusHandler: UpdateOrderStatusCommandHandler;
  private updateOrderTotalsHandler: UpdateOrderTotalsCommandHandler;
  private markOrderPaidHandler: MarkOrderPaidCommandHandler;
  private markOrderFulfilledHandler: MarkOrderFulfilledCommandHandler;
  private cancelOrderHandler: CancelOrderCommandHandler;
  private deleteOrderHandler: DeleteOrderCommandHandler;
  private getOrderAddressHandler: GetOrderAddressHandler;
  private listOrderShipmentsHandler: ListOrderShipmentsHandler;
  private shipmentService: ShipmentManagementService;

  constructor(
    orderManagementService: OrderManagementService,
    shipmentService: ShipmentManagementService,
  ) {
    this.shipmentService = shipmentService;
    this.createOrderHandler = new CreateOrderHandler(orderManagementService);
    this.getOrderHandler = new GetOrderHandler(orderManagementService);
    this.listOrdersHandler = new ListOrdersHandler(orderManagementService);
    this.updateOrderStatusHandler = new UpdateOrderStatusCommandHandler(orderManagementService);
    this.updateOrderTotalsHandler = new UpdateOrderTotalsCommandHandler(orderManagementService);
    this.markOrderPaidHandler = new MarkOrderPaidCommandHandler(orderManagementService);
    this.markOrderFulfilledHandler = new MarkOrderFulfilledCommandHandler(orderManagementService);
    this.cancelOrderHandler = new CancelOrderCommandHandler(orderManagementService);
    this.deleteOrderHandler = new DeleteOrderCommandHandler(orderManagementService);
    this.getOrderAddressHandler = new GetOrderAddressHandler(orderManagementService);
    this.listOrderShipmentsHandler = new ListOrderShipmentsHandler(shipmentService);
  }

  async getOrder(
    request: AuthenticatedRequest<{ Params: { orderId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const query: GetOrderQuery = { orderId: request.params.orderId };
      const result = await this.getOrderHandler.handle(query);

      if (!result.success || !result.data) {
        return ResponseHelper.notFound(reply, "Order not found");
      }

      const { userId: requesterId, role: userRole } = request.user;
      const isAdminOrStaff = STAFF_ROLES.includes(userRole ?? "");

      if (!isAdminOrStaff && result.data.userId && requesterId && result.data.userId !== requesterId) {
        return ResponseHelper.forbidden(reply, "You are not allowed to view this order");
      }

      return ResponseHelper.ok(reply, "Order retrieved successfully", result.data);
    } catch (error: unknown) {
      return ResponseHelper.error(reply, error);
    }
  }

  async getOrderByOrderNumber(
    request: AuthenticatedRequest<{ Params: { orderNumber: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const query: GetOrderQuery = { orderNumber: request.params.orderNumber };
      const result = await this.getOrderHandler.handle(query);

      if (!result.success || !result.data) {
        return ResponseHelper.notFound(reply, "Order not found");
      }

      const { userId: requesterId, role: userRole } = request.user;
      const isAdminOrStaff = STAFF_ROLES.includes(userRole ?? "");

      if (!isAdminOrStaff && result.data.userId && requesterId && result.data.userId !== requesterId) {
        return ResponseHelper.forbidden(reply, "You are not allowed to view this order");
      }

      return ResponseHelper.ok(reply, "Order retrieved successfully", result.data);
    } catch (error: unknown) {
      return ResponseHelper.error(reply, error);
    }
  }

  async createOrder(
    request: AuthenticatedRequest<{ Body: CreateOrderBody }>,
    reply: FastifyReply,
  ) {
    try {
      const authenticatedUserId = request.user?.userId;
      const { guestToken, items, shippingAddress, billingAddress, source, currency } = request.body;

      if (!authenticatedUserId && !guestToken) {
        return ResponseHelper.badRequest(reply, "Order requires either authentication or guest token");
      }

      if (authenticatedUserId && guestToken) {
        return ResponseHelper.badRequest(reply, "Authenticated users cannot use guest checkout");
      }

      const command: CreateOrderCommand = {
        userId: authenticatedUserId,
        guestToken,
        items,
        shippingAddress,
        billingAddress,
        source: source || "web",
        currency: currency || "USD",
      };

      const result = await this.createOrderHandler.handle(command);
      return ResponseHelper.fromCommand(reply, result, "Order created successfully", 201);
    } catch (error: unknown) {
      return ResponseHelper.error(reply, error);
    }
  }

  async listOrders(
    request: AuthenticatedRequest<{ Querystring: ListOrdersQuerystring }>,
    reply: FastifyReply,
  ) {
    try {
      const { page = 1, limit = 20, status, startDate, endDate, sortBy = "createdAt", sortOrder = "desc" } = request.query;

      const { userId: authenticatedUserId, role: userRole } = request.user;
      const isAdminOrStaff = STAFF_ROLES.includes(userRole ?? "");
      const filterUserId = isAdminOrStaff ? undefined : authenticatedUserId;

      const query: ListOrdersQuery = {
        page,
        limit,
        userId: filterUserId,
        status,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        sortBy,
        sortOrder,
      };

      const result = await this.listOrdersHandler.handle(query);
      return ResponseHelper.ok(reply, "Orders retrieved successfully", result.data);
    } catch (error: unknown) {
      return ResponseHelper.error(reply, error);
    }
  }

  async updateOrderStatus(
    request: AuthenticatedRequest<{ Params: { orderId: string }; Body: UpdateOrderStatusBody }>,
    reply: FastifyReply,
  ) {
    try {
      const command: UpdateOrderStatusCommand = {
        orderId: request.params.orderId,
        status: request.body.status,
      };
      const result = await this.updateOrderStatusHandler.handle(command);
      return ResponseHelper.fromCommand(reply, result, "Order status updated successfully");
    } catch (error: unknown) {
      return ResponseHelper.error(reply, error);
    }
  }

  async updateOrderTotals(
    request: AuthenticatedRequest<{ Params: { orderId: string }; Body: UpdateOrderTotalsBody }>,
    reply: FastifyReply,
  ) {
    try {
      const command: UpdateOrderTotalsCommand = {
        orderId: request.params.orderId,
        totals: request.body.totals,
      };
      const result = await this.updateOrderTotalsHandler.handle(command);
      return ResponseHelper.fromCommand(reply, result, "Order totals updated successfully");
    } catch (error: unknown) {
      return ResponseHelper.error(reply, error);
    }
  }

  async markOrderAsPaid(
    request: AuthenticatedRequest<{ Params: { orderId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const command: MarkOrderPaidCommand = { orderId: request.params.orderId };
      const result = await this.markOrderPaidHandler.handle(command);
      return ResponseHelper.fromCommand(reply, result, "Order marked as paid successfully");
    } catch (error: unknown) {
      return ResponseHelper.error(reply, error);
    }
  }

  async markOrderAsFulfilled(
    request: AuthenticatedRequest<{ Params: { orderId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const command: MarkOrderFulfilledCommand = { orderId: request.params.orderId };
      const result = await this.markOrderFulfilledHandler.handle(command);
      return ResponseHelper.fromCommand(reply, result, "Order marked as fulfilled successfully");
    } catch (error: unknown) {
      return ResponseHelper.error(reply, error);
    }
  }

  async cancelOrder(
    request: AuthenticatedRequest<{ Params: { orderId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const command: CancelOrderCommand = { orderId: request.params.orderId };
      const result = await this.cancelOrderHandler.handle(command);
      return ResponseHelper.fromCommand(reply, result, "Order cancelled successfully");
    } catch (error: unknown) {
      return ResponseHelper.error(reply, error);
    }
  }

  async deleteOrder(
    request: AuthenticatedRequest<{ Params: { orderId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const command: DeleteOrderCommand = { orderId: request.params.orderId };
      const result = await this.deleteOrderHandler.handle(command);
      return ResponseHelper.fromCommand(reply, result, "Order deleted successfully", undefined, 204);
    } catch (error: unknown) {
      return ResponseHelper.error(reply, error);
    }
  }

  async trackOrder(
    request: AuthenticatedRequest<{ Querystring: TrackOrderQuerystring }>,
    reply: FastifyReply,
  ) {
    try {
      const { orderNumber, contact, trackingNumber } = request.query;

      if (!orderNumber && !trackingNumber) {
        return ResponseHelper.badRequest(reply, "Either order number or tracking number is required");
      }

      if (orderNumber && !contact) {
        return ResponseHelper.badRequest(reply, "Email or phone number is required when tracking by order number");
      }

      if (orderNumber && contact) {
        const result = await this.getOrderHandler.handle({ orderNumber });

        if (!result.success || !result.data) {
          return ResponseHelper.notFound(reply, `No order found with order number: ${orderNumber}`);
        }

        const order = result.data;
        const addressQuery: GetOrderAddressQuery = { orderId: order.id };
        const addressResult = await this.getOrderAddressHandler.handle(addressQuery);
        const orderAddress = addressResult.success ? addressResult.data : null;

        const contactLower = contact.toLowerCase().trim();
        const billing = orderAddress?.billingAddress;
        const shipping = orderAddress?.shippingAddress;

        const contactMatches =
          contactLower === (billing?.email as string | undefined)?.toLowerCase().trim() ||
          contactLower === (shipping?.email as string | undefined)?.toLowerCase().trim() ||
          contact === (billing?.phone as string | undefined)?.trim() ||
          contact === (shipping?.phone as string | undefined)?.trim();

        if (!contactMatches) {
          return ResponseHelper.forbidden(reply, "The email or phone number does not match our records for this order.");
        }

        const shipmentsQuery: ListOrderShipmentsQuery = { orderId: order.id };
        const shipmentsResult = await this.listOrderShipmentsHandler.handle(shipmentsQuery);

        return ResponseHelper.ok(reply, "Order tracking retrieved successfully", {
          orderId: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          items: order.items,
          totals: order.totals,
          shipments: shipmentsResult.success ? shipmentsResult.data : [],
          billingAddress: billing || {},
          shippingAddress: shipping || {},
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        });
      }

      if (trackingNumber) {
        const shipment = await this.shipmentService.getShipmentByTrackingNumber(trackingNumber);

        if (!shipment) {
          return ResponseHelper.notFound(reply, "No shipment found for the given tracking number");
        }

        return ResponseHelper.ok(reply, "Shipment tracking retrieved successfully", {
          shipmentId: shipment.shipmentId,
          orderId: shipment.orderId,
          carrier: shipment.carrier,
          service: shipment.service,
          trackingNumber: shipment.trackingNumber,
          shippedAt: shipment.shippedAt,
          deliveredAt: shipment.deliveredAt,
        });
      }

      return ResponseHelper.badRequest(reply, "Invalid tracking request");
    } catch (error: unknown) {
      return ResponseHelper.error(reply, error);
    }
  }
}
