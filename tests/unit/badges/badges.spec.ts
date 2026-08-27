import { Badge } from '../../../src/domain/entities/Badge';
import { Candidate } from '../../../src/domain/entities/Candidate';
import { Hiring } from '../../../src/domain/entities/Hiring';
import { Restaurant } from '../../../src/domain/entities/Restaurant';
import { Rating } from '../../../src/domain/value-objects/Rating';
import { GetCandidateBadgesUseCase } from '../../../src/application/use-cases/badges/GetCandidateBadgesUseCase';
import { GrantCandidateBadgeUseCase } from '../../../src/application/use-cases/badges/GrantCandidateBadgeUseCase';
import { ListBadgesUseCase } from '../../../src/application/use-cases/badges/ListBadgesUseCase';
import { ListHiringBadgesUseCase } from '../../../src/application/use-cases/badges/ListHiringBadgesUseCase';
import { RevokeCandidateBadgeUseCase } from '../../../src/application/use-cases/badges/RevokeCandidateBadgeUseCase';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnprocessableEntityError,
} from '../../../src/shared/errors/AppError';
import {
  BADGE_FLEXIVEL,
  BADGE_PONTUAL,
  InMemoryBadgeRepository,
} from '../../support/InMemoryBadgeRepository';
import { InMemoryCandidateBadgeRepository } from '../../support/InMemoryCandidateBadgeRepository';
import { InMemoryCandidateRepository } from '../../support/InMemoryCandidateRepository';
import { InMemoryHiringRepository } from '../../support/InMemoryHiringRepository';
import { InMemoryRestaurantRepository } from '../../support/InMemoryRestaurantRepository';
import { testAddressEntity } from '../../support/validTestAddress';

const OWNER_USER = 'owner-user';
const OTHER_OWNER_USER = 'other-owner-user';
const CLIENT_USER = 'client-user';

interface Scenario {
  catalog: InMemoryBadgeRepository;
  grants: InMemoryCandidateBadgeRepository;
  candidateId: string;
  concludedHiringId: string;
  secondConcludedHiringId: string;
  acceptedHiringId: string;
  foreignHiringId: string;
  grant: GrantCandidateBadgeUseCase;
  revoke: RevokeCandidateBadgeUseCase;
  getBadges: GetCandidateBadgesUseCase;
  listHiringBadges: ListHiringBadgesUseCase;
  listCatalog: ListBadgesUseCase;
}

/**
 * Monta um restaurante com tres contratacoes do mesmo freelancer: duas concluidas,
 * uma apenas aceita, mais uma contratacao de outro restaurante.
 */
function buildScenario(catalogItems?: Badge[]): Scenario {
  const restaurants = new InMemoryRestaurantRepository();
  const candidates = new InMemoryCandidateRepository();
  const hirings = new InMemoryHiringRepository();
  const catalog = new InMemoryBadgeRepository(catalogItems);
  const grants = new InMemoryCandidateBadgeRepository();

  const restaurant = Restaurant.create({
    userId: OWNER_USER,
    name: 'Cantina',
    cpfCnpj: '1',
    address: testAddressEntity(),
    phone: '9',
  });
  const otherRestaurant = Restaurant.create({
    userId: OTHER_OWNER_USER,
    name: 'Bistro',
    cpfCnpj: '2',
    address: testAddressEntity(),
    phone: '8',
  });
  restaurants.items.push(restaurant, otherRestaurant);

  const candidate = Candidate.create({
    userId: CLIENT_USER,
    name: 'Freelancer',
    document: '3',
    address: testAddressEntity(),
    phone: '7',
    positionId: 'pos-1',
  });
  candidates.items.push(candidate);

  const makeHiring = (
    jobId: string,
    restaurantId: string,
    conclude: boolean,
  ): Hiring => {
    const hiring = Hiring.create({
      jobId,
      candidateId: candidate.id,
      restaurantId,
      hourlyRate: 100,
    });
    hiring.accept(null);
    if (conclude) hiring.conclude(Rating.create(5), Rating.create(5));
    hirings.items.push(hiring);
    return hiring;
  };

  const concluded = makeHiring('job-1', restaurant.id, true);
  const secondConcluded = makeHiring('job-2', restaurant.id, true);
  const accepted = makeHiring('job-3', restaurant.id, false);
  const foreign = makeHiring('job-4', otherRestaurant.id, true);

  return {
    catalog,
    grants,
    candidateId: candidate.id,
    concludedHiringId: concluded.id,
    secondConcludedHiringId: secondConcluded.id,
    acceptedHiringId: accepted.id,
    foreignHiringId: foreign.id,
    grant: new GrantCandidateBadgeUseCase(
      restaurants,
      hirings,
      catalog,
      grants,
    ),
    revoke: new RevokeCandidateBadgeUseCase(
      restaurants,
      hirings,
      catalog,
      grants,
    ),
    getBadges: new GetCandidateBadgesUseCase(candidates, catalog, grants),
    listHiringBadges: new ListHiringBadgesUseCase(
      restaurants,
      hirings,
      catalog,
      grants,
    ),
    listCatalog: new ListBadgesUseCase(catalog),
  };
}

const slugsOf = (result: { badges: { slug: string }[] }): string[] =>
  result.badges.map((item) => item.slug);

const countOf = (
  result: { badges: { slug: string; count: number }[] },
  slug: string,
): number => result.badges.find((item) => item.slug === slug)?.count ?? 0;

describe('Badges use cases', () => {
  it('devolve apenas a concessao criada ao conceder um selo', async () => {
    const s = buildScenario();

    const result = await s.grant.execute({
      userId: OWNER_USER,
      hiringId: s.concludedHiringId,
      badge: 'PONTUAL',
    });

    expect(result).toEqual({
      slug: 'PONTUAL',
      name: 'Pontual',
      description: 'Chegou no horario combinado.',
      icon: null,
      candidateId: s.candidateId,
      hiringId: s.concludedHiringId,
      grantedAt: expect.any(String),
    });
  });

  it('aceita o slug em qualquer caixa', async () => {
    const s = buildScenario();

    const result = await s.grant.execute({
      userId: OWNER_USER,
      hiringId: s.concludedHiringId,
      badge: 'pontual',
    });

    expect(result.slug).toBe('PONTUAL');
  });

  it('devolve placar vazio quando o candidato nao tem nenhum selo', async () => {
    const s = buildScenario();

    const result = await s.getBadges.executeByUserId(CLIENT_USER);

    expect(result.totalGranted).toBe(0);
    expect(result.badges).toEqual([]);
  });

  it('omite do placar os selos nunca concedidos', async () => {
    const s = buildScenario();

    await s.grant.execute({
      userId: OWNER_USER,
      hiringId: s.concludedHiringId,
      badge: 'FLEXIVEL',
    });

    const result = await s.getBadges.executeByUserId(CLIENT_USER);

    expect(slugsOf(result)).toEqual(['FLEXIVEL']);
    expect(result.badges[0]).toEqual({
      slug: 'FLEXIVEL',
      name: 'Flexivel',
      description: 'Se adaptou bem as necessidades do turno.',
      icon: null,
      count: 1,
      lastGrantedAt: expect.any(String),
    });
  });

  it('lista o catalogo completo em rota separada, inclusive selos sem concessao', async () => {
    const s = buildScenario();

    const result = await s.listCatalog.execute();

    expect(result.map((item) => item.slug)).toEqual(['PONTUAL', 'FLEXIVEL']);
  });

  it('mantem a ordem do catalogo no placar', async () => {
    const s = buildScenario();

    await s.grant.execute({
      userId: OWNER_USER,
      hiringId: s.concludedHiringId,
      badge: 'FLEXIVEL',
    });
    await s.grant.execute({
      userId: OWNER_USER,
      hiringId: s.concludedHiringId,
      badge: 'PONTUAL',
    });

    const result = await s.getBadges.executeByCandidateId(s.candidateId);

    expect(slugsOf(result)).toEqual(['PONTUAL', 'FLEXIVEL']);
  });

  it('acumula o mesmo selo entre trabalhos diferentes', async () => {
    const s = buildScenario();

    await s.grant.execute({
      userId: OWNER_USER,
      hiringId: s.concludedHiringId,
      badge: 'PONTUAL',
    });
    await s.grant.execute({
      userId: OWNER_USER,
      hiringId: s.secondConcludedHiringId,
      badge: 'PONTUAL',
    });

    const result = await s.getBadges.executeByCandidateId(s.candidateId);

    expect(result.totalGranted).toBe(2);
    expect(slugsOf(result)).toEqual(['PONTUAL']);
    expect(countOf(result, 'PONTUAL')).toBe(2);
    expect(result.badges[0].lastGrantedAt).not.toBeNull();
  });

  it('recusa o mesmo selo duas vezes no mesmo trabalho', async () => {
    const s = buildScenario();

    await s.grant.execute({
      userId: OWNER_USER,
      hiringId: s.concludedHiringId,
      badge: 'PONTUAL',
    });

    await expect(
      s.grant.execute({
        userId: OWNER_USER,
        hiringId: s.concludedHiringId,
        badge: 'PONTUAL',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('recusa selo antes da conclusao do trabalho', async () => {
    const s = buildScenario();

    await expect(
      s.grant.execute({
        userId: OWNER_USER,
        hiringId: s.acceptedHiringId,
        badge: 'PONTUAL',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('recusa selo em contratacao de outro restaurante', async () => {
    const s = buildScenario();

    await expect(
      s.grant.execute({
        userId: OWNER_USER,
        hiringId: s.foreignHiringId,
        badge: 'PONTUAL',
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('recusa quem nao tem perfil de restaurante', async () => {
    const s = buildScenario();

    await expect(
      s.grant.execute({
        userId: CLIENT_USER,
        hiringId: s.concludedHiringId,
        badge: 'PONTUAL',
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('recusa slug fora do catalogo', async () => {
    const s = buildScenario();

    await expect(
      s.grant.execute({
        userId: OWNER_USER,
        hiringId: s.concludedHiringId,
        badge: 'INEXISTENTE',
      }),
    ).rejects.toBeInstanceOf(UnprocessableEntityError);
  });

  it('recusa conceder selo inativo', async () => {
    const retired = Badge.restore({
      slug: 'ANTIGO',
      name: 'Antigo',
      description: null,
      icon: null,
      active: false,
      sortOrder: 3,
    });
    const s = buildScenario([BADGE_PONTUAL, BADGE_FLEXIVEL, retired]);

    await expect(
      s.grant.execute({
        userId: OWNER_USER,
        hiringId: s.concludedHiringId,
        badge: 'ANTIGO',
      }),
    ).rejects.toBeInstanceOf(UnprocessableEntityError);
  });

  it('mantem no placar o selo aposentado depois de concedido', async () => {
    const willRetire = Badge.restore({
      slug: 'SAZONAL',
      name: 'Sazonal',
      description: null,
      icon: null,
      active: true,
      sortOrder: 3,
    });
    const s = buildScenario([BADGE_PONTUAL, BADGE_FLEXIVEL, willRetire]);

    await s.grant.execute({
      userId: OWNER_USER,
      hiringId: s.concludedHiringId,
      badge: 'SAZONAL',
    });

    const index = s.catalog.items.findIndex((item) => item.slug === 'SAZONAL');
    s.catalog.items[index] = Badge.restore({
      slug: 'SAZONAL',
      name: 'Sazonal',
      description: null,
      icon: null,
      active: false,
      sortOrder: 3,
    });

    const summary = await s.getBadges.executeByCandidateId(s.candidateId);
    expect(slugsOf(summary)).toEqual(['SAZONAL']);
    expect(countOf(summary, 'SAZONAL')).toBe(1);

    const catalog = await s.listCatalog.execute();
    expect(catalog.map((item) => item.slug)).not.toContain('SAZONAL');
  });

  it('revoga apenas a concessao daquele trabalho', async () => {
    const s = buildScenario();

    await s.grant.execute({
      userId: OWNER_USER,
      hiringId: s.concludedHiringId,
      badge: 'PONTUAL',
    });
    await s.grant.execute({
      userId: OWNER_USER,
      hiringId: s.secondConcludedHiringId,
      badge: 'PONTUAL',
    });

    const result = await s.revoke.execute({
      userId: OWNER_USER,
      hiringId: s.concludedHiringId,
      badge: 'PONTUAL',
    });

    expect(countOf(result, 'PONTUAL')).toBe(1);
  });

  it('remove o selo do placar quando a ultima concessao e revogada', async () => {
    const s = buildScenario();

    await s.grant.execute({
      userId: OWNER_USER,
      hiringId: s.concludedHiringId,
      badge: 'PONTUAL',
    });

    const result = await s.revoke.execute({
      userId: OWNER_USER,
      hiringId: s.concludedHiringId,
      badge: 'PONTUAL',
    });

    expect(result.totalGranted).toBe(0);
    expect(result.badges).toEqual([]);
  });

  it('recusa revogar selo inexistente', async () => {
    const s = buildScenario();

    await expect(
      s.revoke.execute({
        userId: OWNER_USER,
        hiringId: s.concludedHiringId,
        badge: 'FLEXIVEL',
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('lista apenas os selos concedidos na contratacao consultada', async () => {
    const s = buildScenario();

    await s.grant.execute({
      userId: OWNER_USER,
      hiringId: s.concludedHiringId,
      badge: 'PONTUAL',
    });
    await s.grant.execute({
      userId: OWNER_USER,
      hiringId: s.secondConcludedHiringId,
      badge: 'FLEXIVEL',
    });

    const result = await s.listHiringBadges.execute({
      userId: OWNER_USER,
      hiringId: s.concludedHiringId,
    });

    expect(result.totalGranted).toBe(1);
    expect(slugsOf(result)).toEqual(['PONTUAL']);
  });

  it('devolve lista vazia para contratacao sem selos', async () => {
    const s = buildScenario();

    const result = await s.listHiringBadges.execute({
      userId: OWNER_USER,
      hiringId: s.concludedHiringId,
    });

    expect(result.totalGranted).toBe(0);
    expect(result.badges).toEqual([]);
  });

  it('recusa consultar selos de candidato inexistente', async () => {
    const s = buildScenario();

    await expect(
      s.getBadges.executeByCandidateId('nao-existe'),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
