import { z } from "zod";

export const session = z.object({
  id: z.number().int(),
  shopSessionId: z.string(),
  customerId: z.string(),
  orderId: z.number().int(),
  createdTs: z.string().datetime(),
  updatedTs: z.string().datetime(),
});

export const SessionModel = {
  tableName: "checkout_sessions",
  primaryKeys: ["checkout_session_id"],
  schema: session,
  serializer: (obj: Record<string, string | number | boolean>) => {
    return {
      ...obj,
      createdTs: new Date(obj.createdTs as string).toISOString(),
      updatedTs: new Date(obj.updatedTs as string).toISOString(),
    };
  },
  serializerObject: session,
};
