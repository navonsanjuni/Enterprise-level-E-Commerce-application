import { FastifyReply } from "fastify";
import { AuthenticatedRequest } from "@/api/src/shared/interfaces/authenticated-request.interface";
import { ResponseHelper } from "@/api/src/shared/response.helper";
import {
  LogOrderEventCommand,
  LogOrderEventCommandHandler,
  ListOrderEventsQuery,
  ListOrderEventsHandler,
  GetOrderEventQuery,
  GetOrderEventHandler,
  OrderEventService,
} from "../../../application";

export interface LogEventRequest {
  Params: { orderId: string };
  Body: {
    eventType: string;
    payload?: Record<string, unknown>;
  };
}

export interface GetEventsRequest {
  Params: { orderId: string };
  Querystring: {
    eventType?: string;
    limit?: number;
    offset?: number;
    sortBy?: "createdAt" | "eventId";
    sortOrder?: "asc" | "desc";
  };
}

export interface GetEventRequest {
  Params: {
    orderId: string;
    eventId: string;
  };
}

export class OrderEventController {
  private logEventHandler: LogOrderEventCommandHandler;
  private listOrderEventsHandler: ListOrderEventsHandler;
  private getOrderEventHandler: GetOrderEventHandler;

  constructor(orderEventService: OrderEventService) {
    this.logEventHandler = new LogOrderEventCommandHandler(orderEventService);
    this.listOrderEventsHandler = new ListOrderEventsHandler(orderEventService);
    this.getOrderEventHandler = new GetOrderEventHandler(orderEventService);
  }

  async logEvent(
    request: AuthenticatedRequest<LogEventRequest>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const command: LogOrderEventCommand = {
        orderId: request.params.orderId,
        eventType: request.body.eventType,
        payload: request.body.payload,
      };
      const result = await this.logEventHandler.handle(command);
      return ResponseHelper.fromCommand(reply, result, "Event logged successfully", 201);
    } catch (error: unknown) {
      return ResponseHelper.error(reply, error);
    }
  }

  async getEvents(
    request: AuthenticatedRequest<GetEventsRequest>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const query: ListOrderEventsQuery = {
        orderId: request.params.orderId,
        eventType: request.query.eventType,
        limit: request.query.limit,
        offset: request.query.offset,
        sortBy: request.query.sortBy,
        sortOrder: request.query.sortOrder,
      };
      const result = await this.listOrderEventsHandler.handle(query);
      return ResponseHelper.ok(reply, "Order events retrieved successfully", result.data);
    } catch (error: unknown) {
      return ResponseHelper.error(reply, error);
    }
  }

  async getEvent(
    request: AuthenticatedRequest<GetEventRequest>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const eventId = parseInt(request.params.eventId, 10);

      if (isNaN(eventId)) {
        return ResponseHelper.badRequest(reply, "Invalid event ID");
      }

      const query: GetOrderEventQuery = { eventId };
      const result = await this.getOrderEventHandler.handle(query);
      return ResponseHelper.ok(reply, "Order event retrieved successfully", result.data);
    } catch (error: unknown) {
      return ResponseHelper.error(reply, error);
    }
  }
}
