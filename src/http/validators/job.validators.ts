import { z } from 'zod';
import { Area } from '../../domain/enums/Area';
import { JobStatus } from '../../domain/enums/JobStatus';
import { JobSchedule } from '../../domain/value-objects/JobSchedule';

const dateTimeSchema = z
  .string()
  .regex(
    /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/,
    'Data/horario deve ser DD/MM/AAAA HH:mm',
  )
  .superRefine((value, ctx) => {
    try {
      JobSchedule.parseDateTimeString(value);
    } catch {
      ctx.addIssue({ code: 'custom', message: 'Data/horario invalido' });
    }
  });

export const createJobBodySchema = z
  .object({
    positionId: z.uuid('Cargo invalido'),
    startDate: dateTimeSchema,
    endDate: dateTimeSchema,
    peopleCount: z.number().int().min(1, 'Minimo de 1 pessoa'),
    notes: z.string().max(2000).nullable().optional(),
    active: z.boolean().optional(),
  })
  .strict();

export const updateJobBodySchema = z
  .object({
    positionId: z.uuid().optional(),
    peopleCount: z.number().int().min(1).optional(),
    notes: z.string().max(2000).nullable().optional(),
  })
  .strict();

export const rescheduleJobBodySchema = z
  .object({
    startDate: dateTimeSchema,
    endDate: dateTimeSchema,
  })
  .strict();

export const finishJobBodySchema = z
  .object({
    evaluations: z
      .array(
        z
          .object({
            hiringId: z.uuid(),
            deliveryRating: z.number().min(0).max(5),
            punctualityRating: z.number().min(0).max(5),
          })
          .strict(),
      )
      .default([]),
  })
  .strict();

export const listOpenJobsQuerySchema = z
  .object({
    area: z.enum([Area.COZINHA, Area.SALAO, Area.BAR]).optional(),
    positionId: z.uuid().optional(),
    fromStartDate: dateTimeSchema.optional(),
    page: z.coerce.number().int().min(1).optional(),
    perPage: z.coerce.number().int().min(1).max(100).optional(),
  })
  .strict();

export const listRestaurantJobsQuerySchema = z
  .object({
    status: z
      .enum([
        JobStatus.ABERTA,
        JobStatus.PREENCHIDA,
        JobStatus.CANCELADA,
        JobStatus.CONCLUIDA,
      ])
      .optional(),
    active: z.coerce.boolean().optional(),
    page: z.coerce.number().int().min(1).optional(),
    perPage: z.coerce.number().int().min(1).max(100).optional(),
  })
  .strict();
