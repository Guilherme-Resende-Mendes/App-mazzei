import { z } from 'zod';
import { Area } from '../../domain/enums/Area';
import {
  isValidBrazilianPhone,
  isValidCpf,
  isValidCpfOrCnpj,
  normalizeBrazilianPhone,
  normalizeDigits,
} from '../../shared/utils/brValidation';

const cpfBodySchema = z
  .string()
  .trim()
  .min(1, 'CPF obrigatorio')
  .transform(normalizeDigits)
  .refine(isValidCpf, 'CPF invalido');

const cpfCnpjBodySchema = z
  .string()
  .trim()
  .min(1, 'CPF/CNPJ obrigatorio')
  .transform(normalizeDigits)
  .refine(isValidCpfOrCnpj, 'CPF/CNPJ invalido');

const phoneBodySchema = z
  .string()
  .trim()
  .min(1, 'Telefone obrigatorio')
  .transform(normalizeBrazilianPhone)
  .refine(isValidBrazilianPhone, 'Telefone invalido');

export const addressResponseSchema = z.object({
  rua: z.string(),
  bairro: z.string(),
  numero: z.string().nullable(),
  complemento: z.string().nullable(),
  cep: z.string(),
});

export const addressBodySchema = z
  .object({
    rua: z.string().trim().min(1, 'Rua obrigatoria').max(255),
    bairro: z.string().trim().min(1, 'Bairro obrigatorio').max(100),
    numero: z.string().trim().max(20).nullable().optional(),
    complemento: z.string().trim().max(100).nullable().optional(),
    cep: z
      .string()
      .trim()
      .min(1, 'CEP obrigatorio')
      .transform((value) => value.replace(/\D/g, ''))
      .refine((value) => /^\d{8}$/.test(value), 'CEP invalido'),
  })
  .strict()
  .transform((value) => ({
    rua: value.rua,
    bairro: value.bairro,
    numero: value.numero?.trim() ? value.numero.trim() : null,
    complemento: value.complemento?.trim() ? value.complemento.trim() : null,
    cep: value.cep,
  }));

export const createRestaurantBodySchema = z
  .object({
    name: z.string().min(1, 'Nome obrigatorio').max(255),
    cpfCnpj: cpfCnpjBodySchema,
    address: addressBodySchema,
    phone: phoneBodySchema,
    requirementLevel: z.number().int().min(1).max(5).nullable().optional(),
    bio: z.string().max(2000).nullable().optional(),
  })
  .strict();

export const updateRestaurantBodySchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    address: addressBodySchema.optional(),
    phone: phoneBodySchema.optional(),
    requirementLevel: z.number().int().min(1).max(5).nullable().optional(),
    bio: z.string().max(2000).nullable().optional(),
  })
  .strict();

export const createCandidateBodySchema = z
  .object({
    name: z.string().min(1, 'Nome obrigatorio').max(255),
    document: cpfBodySchema,
    address: addressBodySchema,
    phone: phoneBodySchema,
    positionId: z.uuid('Cargo invalido'),
    bio: z.string().max(2000).nullable().optional(),
  })
  .strict();

export const updateCandidateBodySchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    address: addressBodySchema.optional(),
    phone: phoneBodySchema.optional(),
    positionId: z.uuid().optional(),
    bio: z.string().max(2000).nullable().optional(),
  })
  .strict();

export const listPositionsQuerySchema = z
  .object({
    area: z.enum([Area.COZINHA, Area.SALAO, Area.BAR]).optional(),
  })
  .strict();
