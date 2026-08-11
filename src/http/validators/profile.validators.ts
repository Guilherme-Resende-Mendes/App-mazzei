import { z } from 'zod';
import { Area } from '../../domain/enums/Area';
import { Badge } from '../../domain/enums/Badge';

export const createRestaurantBodySchema = z
  .object({
    name: z.string().min(1, 'Nome obrigatorio').max(255),
    cpfCnpj: z.string().min(11, 'CPF/CNPJ invalido').max(20),
    address: z.string().min(1, 'Endereco obrigatorio'),
    phone: z.string().min(8, 'Telefone invalido').max(30),
    requirementLevel: z.number().int().min(1).max(5).nullable().optional(),
    bio: z.string().max(2000).nullable().optional(),
  })
  .strict();

export const updateRestaurantBodySchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    address: z.string().min(1).optional(),
    phone: z.string().min(8).max(30).optional(),
    requirementLevel: z.number().int().min(1).max(5).nullable().optional(),
    bio: z.string().max(2000).nullable().optional(),
  })
  .strict();

export const createCandidateBodySchema = z
  .object({
    name: z.string().min(1, 'Nome obrigatorio').max(255),
    document: z.string().min(11, 'Documento invalido').max(30),
    address: z.string().min(1, 'Endereco obrigatorio'),
    phone: z.string().min(8, 'Telefone invalido').max(30),
    positionId: z.uuid('Cargo invalido'),
    bio: z.string().max(2000).nullable().optional(),
  })
  .strict();

export const updateCandidateBodySchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    address: z.string().min(1).optional(),
    phone: z.string().min(8).max(30).optional(),
    positionId: z.uuid().optional(),
    bio: z.string().max(2000).nullable().optional(),
  })
  .strict();

export const grantBadgeBodySchema = z
  .object({
    badge: z.enum([Badge.PONTUAL, Badge.FLEXIVEL]),
  })
  .strict();

export const listPositionsQuerySchema = z
  .object({
    area: z.enum([Area.COZINHA, Area.SALAO, Area.BAR]).optional(),
  })
  .strict();
