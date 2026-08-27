import { z } from 'zod';

/**
 * Forma do slug, nao existencia: rejeita lixo evidente com 400, enquanto a
 * existencia no catalogo e checada no use case (422).
 */
const badgeSlugSchema = z
  .string()
  .trim()
  .min(2)
  .max(50)
  .regex(/^[A-Za-z][A-Za-z0-9_]*$/, 'Selo invalido');

export const grantBadgeBodySchema = z
  .object({
    badge: badgeSlugSchema,
  })
  .strict();

export const badgeParamsSchema = z.object({
  badge: badgeSlugSchema,
});
