import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  Area,
} from '../src/infrastructure/database/prisma/generated/client';

const connectionString = process.env.DATABASE_URL ?? '';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

interface PositionSeed {
  area: Area;
  name: string;
  level: number;
}

const positions: PositionSeed[] = [
  { area: Area.COZINHA, name: 'Auxiliar de Cozinha', level: 1 },
  { area: Area.COZINHA, name: 'Cozinheiro', level: 2 },
  { area: Area.COZINHA, name: 'Chef de Partie', level: 3 },
  { area: Area.COZINHA, name: 'Sous Chef', level: 4 },
  { area: Area.COZINHA, name: 'Chef Executivo', level: 5 },
  { area: Area.SALAO, name: 'Auxiliar de Salao', level: 1 },
  { area: Area.SALAO, name: 'Garcom', level: 2 },
  { area: Area.SALAO, name: 'Maitre', level: 3 },
  { area: Area.BAR, name: 'Barback', level: 1 },
  { area: Area.BAR, name: 'Bartender', level: 2 },
  { area: Area.BAR, name: 'Head Bartender', level: 3 },
];

async function main(): Promise<void> {
  for (const position of positions) {
    const existing = await prisma.position.findFirst({
      where: { area: position.area, level: position.level },
    });

    if (existing) {
      continue;
    }

    await prisma.position.create({ data: position });
  }

  const total = await prisma.position.count();
  console.info(`Seed concluido. Cargos cadastrados: ${total}`);
}

main()
  .catch((error: unknown) => {
    console.error('Falha ao executar seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
