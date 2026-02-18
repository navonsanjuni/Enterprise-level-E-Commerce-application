import { FastifyRequest, FastifyReply } from "fastify";

export function requireRole(allowedRoles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { role?: string } | undefined;

    if (!user) {
      return reply.status(401).send({
        success: false,
        statusCode: 401,
        message: "Authentication required.",
      });
    }

    const userRole = user.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return reply.status(403).send({
        success: false,
        statusCode: 403,
        message: `Access denied. Required roles: ${allowedRoles.join(", ")}.`,
      });
    }
  };
}

// Common role presets for athletic shoes e-commerce
export const RolePermissions = {
  ADMIN_ONLY: requireRole(["ADMIN", "SUPER_ADMIN"]),
  STAFF_LEVEL: requireRole(["ADMIN", "SUPER_ADMIN", "STAFF"]),
  CUSTOMER_CARE: requireRole(["ADMIN", "SUPER_ADMIN", "STAFF", "CUSTOMER_CARE"]),
  AUTHENTICATED: requireRole(["ADMIN", "SUPER_ADMIN", "STAFF", "CUSTOMER_CARE", "CUSTOMER"]),
};

export function hasRole(request: FastifyRequest, allowedRoles: string[]): boolean {
  const user = request.user as { role?: string } | undefined;
  if (!user?.role) return false;
  return allowedRoles.includes(user.role);
}
