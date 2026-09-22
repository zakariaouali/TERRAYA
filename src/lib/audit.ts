import { prisma } from "./prisma";

export async function audit(input: {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  ip?: string | null;
  userAgent?: string | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        ip: input.ip ?? null,
        userAgent: input.userAgent ?? null,
      },
    });
  } catch {
    // never throw from audit
  }
}
