import { FastifyRequest, RouteGenericInterface } from "fastify";

export interface AuthenticatedUser {
  id: string;
  userId: string;
  email: string;
  role?: string;
}

export interface AuthenticatedRequest<
  RouteGeneric extends RouteGenericInterface = any,
> extends FastifyRequest<RouteGeneric> {
  user: AuthenticatedUser;
}
