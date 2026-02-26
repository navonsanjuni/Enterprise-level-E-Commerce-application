import { FastifyRequest, FastifyReply } from "fastify";
import {
  CreateSupplierCommand,
  CreateSupplierCommandHandler,
  UpdateSupplierCommand,
  UpdateSupplierCommandHandler,
  DeleteSupplierCommand,
  DeleteSupplierCommandHandler,
  GetSupplierQuery,
  GetSupplierQueryHandler,
  ListSuppliersQuery,
  ListSuppliersQueryHandler,
} from "../../../application";
import { SupplierManagementService } from "../../../application/services/supplier-management.service";

export class SupplierController {
  private createSupplierHandler: CreateSupplierCommandHandler;
  private updateSupplierHandler: UpdateSupplierCommandHandler;
  private deleteSupplierHandler: DeleteSupplierCommandHandler;
  private getSupplierHandler: GetSupplierQueryHandler;
  private listSuppliersHandler: ListSuppliersQueryHandler;

  constructor(private readonly supplierService: SupplierManagementService) {
    // Initialize CQRS handlers
    this.createSupplierHandler = new CreateSupplierCommandHandler(
      supplierService,
    );
    this.updateSupplierHandler = new UpdateSupplierCommandHandler(
      supplierService,
    );
    this.deleteSupplierHandler = new DeleteSupplierCommandHandler(
      supplierService,
    );
    this.getSupplierHandler = new GetSupplierQueryHandler(supplierService);
    this.listSuppliersHandler = new ListSuppliersQueryHandler(supplierService);
  }

  async getSupplier(
    request: FastifyRequest<{ Params: { supplierId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { supplierId } = request.params;

      const query: GetSupplierQuery = {
        supplierId,
      };

      const result = await this.getSupplierHandler.handle(query);

      if (result.success && result.data) {
        return reply.code(200).send({
          success: true,
          data: result.data,
        });
      } else if (result.success && result.data === null) {
        return reply.code(404).send({
          success: false,
          error: "Supplier not found",
        });
      } else {
        return reply.code(400).send({
          success: false,
          error: result.error || "Failed to get supplier",
          errors: result.errors,
        });
      }
    } catch (error) {
      request.log.error(error, "Failed to get supplier");
      return reply.code(500).send({
        success: false,
        error: "Internal server error",
        message: "Failed to retrieve supplier",
      });
    }
  }

  async listSuppliers(
    request: FastifyRequest<{
      Querystring: { limit?: number; offset?: number };
    }>,
    reply: FastifyReply,
  ) {
    try {
      const { limit, offset } = request.query;

      const query: ListSuppliersQuery = {
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
      };

      const result = await this.listSuppliersHandler.handle(query);

      if (result.success && result.data) {
        return reply.code(200).send({
          success: true,
          data: result.data,
        });
      } else {
        return reply.code(400).send({
          success: false,
          error: result.error || "Failed to list suppliers",
          errors: result.errors,
        });
      }
    } catch (error) {
      request.log.error(error, "Failed to list suppliers");
      return reply.code(500).send({
        success: false,
        error: "Internal server error",
        message: "Failed to retrieve suppliers",
      });
    }
  }

  async createSupplier(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as any;

      const command: CreateSupplierCommand = {
        name: body.name,
        leadTimeDays: body.leadTimeDays,
        contacts: body.contacts,
      };

      const result = await this.createSupplierHandler.handle(command);

      if (result.success && result.data) {
        const supplier = result.data;

        return reply.code(201).send({
          success: true,
          data: {
            supplierId: supplier.getSupplierId().getValue(),
            name: supplier.getName(),
            leadTimeDays: supplier.getLeadTimeDays(),
            contacts: supplier.getContacts(),
          },
          message: "Supplier created successfully",
        });
      } else {
        return reply.code(400).send({
          success: false,
          error: result.error || "Supplier creation failed",
          errors: result.errors,
        });
      }
    } catch (error) {
      request.log.error(error, "Failed to create supplier");
      return reply.code(500).send({
        success: false,
        error: "Internal server error",
        message: "Failed to create supplier",
      });
    }
  }

  async updateSupplier(
    request: FastifyRequest<{ Params: { supplierId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { supplierId } = request.params;
      const body = request.body as any;

      const command: UpdateSupplierCommand = {
        supplierId,
        name: body.name,
        leadTimeDays: body.leadTimeDays,
        contacts: body.contacts,
      };

      const result = await this.updateSupplierHandler.handle(command);

      if (result.success && result.data) {
        const supplier = result.data;

        return reply.code(200).send({
          success: true,
          data: {
            supplierId: supplier.getSupplierId().getValue(),
            name: supplier.getName(),
            leadTimeDays: supplier.getLeadTimeDays(),
            contacts: supplier.getContacts(),
          },
          message: "Supplier updated successfully",
        });
      } else {
        return reply.code(400).send({
          success: false,
          error: result.error || "Supplier update failed",
          errors: result.errors,
        });
      }
    } catch (error) {
      request.log.error(error, "Failed to update supplier");
      return reply.code(500).send({
        success: false,
        error: "Internal server error",
        message: "Failed to update supplier",
      });
    }
  }

  async deleteSupplier(
    request: FastifyRequest<{ Params: { supplierId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { supplierId } = request.params;

      const command: DeleteSupplierCommand = {
        supplierId,
      };

      const result = await this.deleteSupplierHandler.handle(command);

      if (result.success) {
        return reply.code(200).send({
          success: true,
          message: "Supplier deleted successfully",
        });
      } else {
        return reply.code(400).send({
          success: false,
          error: result.error || "Supplier deletion failed",
          errors: result.errors,
        });
      }
    } catch (error) {
      request.log.error(error, "Failed to delete supplier");
      return reply.code(500).send({
        success: false,
        error: "Internal server error",
        message: "Failed to delete supplier",
      });
    }
  }
}
