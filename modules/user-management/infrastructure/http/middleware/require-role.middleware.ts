import { FastifyRequest, FastifyReply } from "fastify";
import { UserRole } from "../../../domain/enums/user-role.enum";

export function requireRole(...roles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const role = request.user?.role;
    if (!role || !roles.includes(role as UserRole)) {
      return reply.status(403).send({
        success: false,
        statusCode: 403,
        message: "Insufficient permissions",
      });
    }
  };
}
