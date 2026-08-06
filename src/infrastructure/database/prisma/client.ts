import { PrismaPg } from '@prisma/adapter-pg';
import { env } from '../../../config/env';
import { Prisma, PrismaClient } from './generated/client';

/**
 * Instancia unica do PrismaClient (Prisma 7 usa driver adapter para conectar).
 */
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });

export type Database = typeof prisma;

/**
 * Client aceito pelos repositorios: o client normal ou um client transacional
 * (dentro de prisma.$transaction). Ambos expoem os delegates de modelo usados.
 */
export type PrismaClientOrTx = Prisma.TransactionClient;
