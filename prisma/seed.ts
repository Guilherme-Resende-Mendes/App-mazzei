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

interface BadgeSeed {
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
}

/**
 * Catalogo inicial de selos. Novos selos podem entrar aqui ou direto na tabela
 * `selos`, sem migration nem deploy. `icone` fica a cargo do produto.
 */
const badges: BadgeSeed[] = [
  {
    slug: 'PONTUAL',
    name: 'Pontual',
    description: 'Chegou no horario combinado.',
    sortOrder: 1,
  },
  {
    slug: 'FLEXIVEL',
    name: 'Flexivel',
    description: 'Se adaptou bem as necessidades do turno.',
    sortOrder: 2,
  },
];

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

  // A migration cria os selos convertidos do enum apenas com slug e nome, para nao
  // quebrar as FKs. O seed e o dono do conteudo que declara; `icone` e `ativo` ficam
  // por conta do produto e nao sao sobrescritos.
  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { slug: badge.slug },
      update: {
        name: badge.name,
        description: badge.description,
        sortOrder: badge.sortOrder,
      },
      create: badge,
    });
  }

  const totalPositions = await prisma.position.count();
  const totalBadges = await prisma.badge.count();
  console.info(
    `Seed concluido. Cargos: ${totalPositions}. Selos: ${totalBadges}.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error('Falha ao executar seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
