import { z } from 'zod';
import { hasAtMostTwoDecimalPlaces } from '../../shared/utils/money';

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
