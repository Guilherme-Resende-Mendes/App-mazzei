import { z } from 'zod';
import { Role } from '../../domain/enums/Role';

export const registerBodySchema = z
  .object({
    email: z.email({ message: 'E-mail invalido' }).max(255),
    password: z
      .string()
      .min(8, 'A senha deve ter ao menos 8 caracteres')
      .max(72, 'A senha deve ter no maximo 72 caracteres'),
    role: z.enum([Role.CLIENT, Role.OWNER]),
  })
  .strict();

export const loginBodySchema = z
  .object({
    email: z.email({ message: 'E-mail invalido' }).max(255),
    password: z.string().min(1, 'Senha obrigatoria').max(72),
  })
  .strict();

export const refreshBodySchema = z
  .object({
    refreshToken: z.string().min(1).optional(),
  })
  .strict()
  .default({});

export type RegisterBody = z.infer<typeof registerBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
export type RefreshBody = z.infer<typeof refreshBodySchema>;
