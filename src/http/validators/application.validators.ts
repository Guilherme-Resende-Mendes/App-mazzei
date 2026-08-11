import { z } from 'zod';
import { hasAtMostTwoDecimalPlaces } from '../../shared/utils/money';

export const applyForJobBodySchema = z
  .object({
    hourlyRate: z
      .number()
      .min(0)
      .refine(hasAtMostTwoDecimalPlaces, {
        message: 'hourlyRate deve ter no maximo 2 casas decimais',
      }),
  })
  .strict();

export const acceptCandidateBodySchema = z
  .object({
    agreedPrice: z
      .number()
      .min(0)
      .refine(hasAtMostTwoDecimalPlaces, {
        message: 'agreedPrice deve ter no maximo 2 casas decimais',
      }),
  })
  .strict();
