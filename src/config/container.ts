import 'reflect-metadata';
import { container } from 'tsyringe';

import { HashProvider } from '../application/interfaces/HashProvider';
import { TokenProvider } from '../application/interfaces/TokenProvider';
import { UnitOfWork } from '../application/interfaces/UnitOfWork';
import { UserRepository } from '../domain/repositories/UserRepository';
import { RefreshTokenRepository } from '../domain/repositories/RefreshTokenRepository';
import { RestaurantRepository } from '../domain/repositories/RestaurantRepository';
import { CandidateRepository } from '../domain/repositories/CandidateRepository';
import { BadgeRepository } from '../domain/repositories/BadgeRepository';
import { CandidateBadgeRepository } from '../domain/repositories/CandidateBadgeRepository';
import { PositionRepository } from '../domain/repositories/PositionRepository';
import { JobRepository } from '../domain/repositories/JobRepository';
import { HiringRepository } from '../domain/repositories/HiringRepository';

import { AuthenticateUserUseCase } from '../application/use-cases/auth/AuthenticateUserUseCase';
import { GetProfileUseCase } from '../application/use-cases/auth/GetProfileUseCase';
import { LogoutUseCase } from '../application/use-cases/auth/LogoutUseCase';
import { RefreshTokenUseCase } from '../application/use-cases/auth/RefreshTokenUseCase';
import { RegisterUserUseCase } from '../application/use-cases/auth/RegisterUserUseCase';

import { CreateRestaurantProfileUseCase } from '../application/use-cases/profiles/CreateRestaurantProfileUseCase';
import { UpdateRestaurantProfileUseCase } from '../application/use-cases/profiles/UpdateRestaurantProfileUseCase';
import { GetRestaurantProfileUseCase } from '../application/use-cases/profiles/GetRestaurantProfileUseCase';
import { GetRestaurantOwnCpfCnpjUseCase } from '../application/use-cases/profiles/GetRestaurantOwnCpfCnpjUseCase';
import { GetRestaurantOwnPhoneUseCase } from '../application/use-cases/profiles/GetRestaurantOwnPhoneUseCase';
import { DeleteRestaurantProfileUseCase } from '../application/use-cases/profiles/DeleteRestaurantProfileUseCase';
import { CreateCandidateProfileUseCase } from '../application/use-cases/profiles/CreateCandidateProfileUseCase';
import { UpdateCandidateProfileUseCase } from '../application/use-cases/profiles/UpdateCandidateProfileUseCase';
import { GetCandidateProfileUseCase } from '../application/use-cases/profiles/GetCandidateProfileUseCase';
import { GetCandidateOwnCpfUseCase } from '../application/use-cases/profiles/GetCandidateOwnCpfUseCase';
import { GetCandidateOwnPhoneUseCase } from '../application/use-cases/profiles/GetCandidateOwnPhoneUseCase';
import { DeleteCandidateProfileUseCase } from '../application/use-cases/profiles/DeleteCandidateProfileUseCase';
import { ListPositionsUseCase } from '../application/use-cases/profiles/ListPositionsUseCase';

import { GrantCandidateBadgeUseCase } from '../application/use-cases/badges/GrantCandidateBadgeUseCase';
import { RevokeCandidateBadgeUseCase } from '../application/use-cases/badges/RevokeCandidateBadgeUseCase';
import { GetCandidateBadgesUseCase } from '../application/use-cases/badges/GetCandidateBadgesUseCase';
import { ListHiringBadgesUseCase } from '../application/use-cases/badges/ListHiringBadgesUseCase';
import { ListBadgesUseCase } from '../application/use-cases/badges/ListBadgesUseCase';

import { CreateJobUseCase } from '../application/use-cases/jobs/CreateJobUseCase';
import { UpdateJobUseCase } from '../application/use-cases/jobs/UpdateJobUseCase';
import { RescheduleJobUseCase } from '../application/use-cases/jobs/RescheduleJobUseCase';
import { ActivateJobUseCase } from '../application/use-cases/jobs/ActivateJobUseCase';
import { DeactivateJobUseCase } from '../application/use-cases/jobs/DeactivateJobUseCase';
import { DeleteJobUseCase } from '../application/use-cases/jobs/DeleteJobUseCase';
import { CancelJobUseCase } from '../application/use-cases/jobs/CancelJobUseCase';
import { FinishJobUseCase } from '../application/use-cases/jobs/FinishJobUseCase';
import { ListRestaurantJobsUseCase } from '../application/use-cases/jobs/ListRestaurantJobsUseCase';
import { ListOpenJobsUseCase } from '../application/use-cases/jobs/ListOpenJobsUseCase';
import { GetJobUseCase } from '../application/use-cases/jobs/GetJobUseCase';

import { ApplyForJobUseCase } from '../application/use-cases/applications/ApplyForJobUseCase';
import { CancelApplicationUseCase } from '../application/use-cases/applications/CancelApplicationUseCase';
import { ListCandidateApplicationsUseCase } from '../application/use-cases/applications/ListCandidateApplicationsUseCase';
import { ListJobApplicationsUseCase } from '../application/use-cases/applications/ListJobApplicationsUseCase';
import { AcceptCandidateUseCase } from '../application/use-cases/applications/AcceptCandidateUseCase';
import { RejectCandidateUseCase } from '../application/use-cases/applications/RejectCandidateUseCase';

import { ListCandidateReviewsUseCase } from '../application/use-cases/reviews/ListCandidateReviewsUseCase';

import { prisma } from '../infrastructure/database/prisma/client';
import { PrismaUserRepository } from '../infrastructure/database/repositories/PrismaUserRepository';
import { PrismaRefreshTokenRepository } from '../infrastructure/database/repositories/PrismaRefreshTokenRepository';
import { PrismaRestaurantRepository } from '../infrastructure/database/repositories/PrismaRestaurantRepository';
import { PrismaCandidateRepository } from '../infrastructure/database/repositories/PrismaCandidateRepository';
import { PrismaBadgeRepository } from '../infrastructure/database/repositories/PrismaBadgeRepository';
import { PrismaCandidateBadgeRepository } from '../infrastructure/database/repositories/PrismaCandidateBadgeRepository';
import { PrismaPositionRepository } from '../infrastructure/database/repositories/PrismaPositionRepository';
import { PrismaJobRepository } from '../infrastructure/database/repositories/PrismaJobRepository';
import { PrismaHiringRepository } from '../infrastructure/database/repositories/PrismaHiringRepository';
import { PrismaUnitOfWork } from '../infrastructure/database/PrismaUnitOfWork';
import { BcryptHashProvider } from '../infrastructure/providers/hash/BcryptHashProvider';
import { JwtTokenProvider } from '../infrastructure/providers/auth/JwtTokenProvider';
import { ViaCepLookupProvider } from '../infrastructure/providers/address/ViaCepLookupProvider';

import { AuthController } from '../http/controllers/AuthController';
import { RestaurantController } from '../http/controllers/RestaurantController';
import { CandidateController } from '../http/controllers/CandidateController';
import { BadgeController } from '../http/controllers/BadgeController';
import { PositionController } from '../http/controllers/PositionController';
import { JobController } from '../http/controllers/JobController';
import { ApplicationController } from '../http/controllers/ApplicationController';
import { TOKENS } from './tokens';

/**
 * Composition Root: unico lugar que conhece implementacoes concretas.
 * Dominio e aplicacao permanecem livres do framework de DI.
 */

// ============================================================
// Infraestrutura (repositorios, providers, unit of work)
// ============================================================
container.registerInstance<UserRepository>(
  TOKENS.UserRepository,
  new PrismaUserRepository(prisma),
);

container.registerInstance<RefreshTokenRepository>(
  TOKENS.RefreshTokenRepository,
  new PrismaRefreshTokenRepository(prisma),
);

container.registerInstance<RestaurantRepository>(
  TOKENS.RestaurantRepository,
  new PrismaRestaurantRepository(prisma),
);

container.registerInstance<CandidateRepository>(
  TOKENS.CandidateRepository,
  new PrismaCandidateRepository(prisma),
);

container.registerInstance<BadgeRepository>(
  TOKENS.BadgeRepository,
  new PrismaBadgeRepository(prisma),
);

container.registerInstance<CandidateBadgeRepository>(
  TOKENS.CandidateBadgeRepository,
  new PrismaCandidateBadgeRepository(prisma),
);

container.registerInstance<PositionRepository>(
  TOKENS.PositionRepository,
  new PrismaPositionRepository(prisma),
);

container.registerInstance<JobRepository>(
  TOKENS.JobRepository,
  new PrismaJobRepository(prisma),
);

container.registerInstance<HiringRepository>(
  TOKENS.HiringRepository,
  new PrismaHiringRepository(prisma),
);

container.registerInstance<UnitOfWork>(
  TOKENS.UnitOfWork,
  new PrismaUnitOfWork(prisma),
);

container.registerInstance<HashProvider>(
  TOKENS.HashProvider,
  new BcryptHashProvider(),
);

container.registerInstance<TokenProvider>(
  TOKENS.TokenProvider,
  new JwtTokenProvider(),
);

// ============================================================
// Use cases - Auth
// ============================================================
container.register(RegisterUserUseCase, {
  useFactory: (c) =>
    new RegisterUserUseCase(
      c.resolve<UserRepository>(TOKENS.UserRepository),
      c.resolve<HashProvider>(TOKENS.HashProvider),
    ),
});

container.register(AuthenticateUserUseCase, {
  useFactory: (c) =>
    new AuthenticateUserUseCase(
      c.resolve<UserRepository>(TOKENS.UserRepository),
      c.resolve<RefreshTokenRepository>(TOKENS.RefreshTokenRepository),
      c.resolve<HashProvider>(TOKENS.HashProvider),
      c.resolve<TokenProvider>(TOKENS.TokenProvider),
    ),
});

container.register(RefreshTokenUseCase, {
  useFactory: (c) =>
    new RefreshTokenUseCase(
      c.resolve<UserRepository>(TOKENS.UserRepository),
      c.resolve<RefreshTokenRepository>(TOKENS.RefreshTokenRepository),
      c.resolve<TokenProvider>(TOKENS.TokenProvider),
    ),
});

container.register(LogoutUseCase, {
  useFactory: (c) =>
    new LogoutUseCase(
      c.resolve<RefreshTokenRepository>(TOKENS.RefreshTokenRepository),
      c.resolve<TokenProvider>(TOKENS.TokenProvider),
    ),
});

container.register(GetProfileUseCase, {
  useFactory: (c) =>
    new GetProfileUseCase(c.resolve<UserRepository>(TOKENS.UserRepository)),
});

// ============================================================
// Use cases - Profiles
// ============================================================
container.register(TOKENS.CepLookupProvider, {
  useFactory: () => new ViaCepLookupProvider(),
});

container.register(CreateRestaurantProfileUseCase, {
  useFactory: (c) =>
    new CreateRestaurantProfileUseCase(
      c.resolve<RestaurantRepository>(TOKENS.RestaurantRepository),
      c.resolve(TOKENS.CepLookupProvider),
    ),
});

container.register(UpdateRestaurantProfileUseCase, {
  useFactory: (c) =>
    new UpdateRestaurantProfileUseCase(
      c.resolve<RestaurantRepository>(TOKENS.RestaurantRepository),
      c.resolve(TOKENS.CepLookupProvider),
    ),
});

container.register(GetRestaurantProfileUseCase, {
  useFactory: (c) =>
    new GetRestaurantProfileUseCase(
      c.resolve<RestaurantRepository>(TOKENS.RestaurantRepository),
    ),
});

container.register(GetRestaurantOwnCpfCnpjUseCase, {
  useFactory: (c) =>
    new GetRestaurantOwnCpfCnpjUseCase(
      c.resolve<RestaurantRepository>(TOKENS.RestaurantRepository),
    ),
});

container.register(GetRestaurantOwnPhoneUseCase, {
  useFactory: (c) =>
    new GetRestaurantOwnPhoneUseCase(
      c.resolve<RestaurantRepository>(TOKENS.RestaurantRepository),
    ),
});

container.register(DeleteRestaurantProfileUseCase, {
  useFactory: (c) =>
    new DeleteRestaurantProfileUseCase(
      c.resolve<RestaurantRepository>(TOKENS.RestaurantRepository),
    ),
});

container.register(CreateCandidateProfileUseCase, {
  useFactory: (c) =>
    new CreateCandidateProfileUseCase(
      c.resolve<CandidateRepository>(TOKENS.CandidateRepository),
      c.resolve<PositionRepository>(TOKENS.PositionRepository),
      c.resolve(TOKENS.CepLookupProvider),
    ),
});

container.register(UpdateCandidateProfileUseCase, {
  useFactory: (c) =>
    new UpdateCandidateProfileUseCase(
      c.resolve<CandidateRepository>(TOKENS.CandidateRepository),
      c.resolve<PositionRepository>(TOKENS.PositionRepository),
      c.resolve(TOKENS.CepLookupProvider),
    ),
});

container.register(GetCandidateProfileUseCase, {
  useFactory: (c) =>
    new GetCandidateProfileUseCase(
      c.resolve<CandidateRepository>(TOKENS.CandidateRepository),
    ),
});

container.register(GetCandidateOwnCpfUseCase, {
  useFactory: (c) =>
    new GetCandidateOwnCpfUseCase(
      c.resolve<CandidateRepository>(TOKENS.CandidateRepository),
    ),
});

container.register(GetCandidateOwnPhoneUseCase, {
  useFactory: (c) =>
    new GetCandidateOwnPhoneUseCase(
      c.resolve<CandidateRepository>(TOKENS.CandidateRepository),
    ),
});

container.register(DeleteCandidateProfileUseCase, {
  useFactory: (c) =>
    new DeleteCandidateProfileUseCase(
      c.resolve<CandidateRepository>(TOKENS.CandidateRepository),
    ),
});

container.register(ListPositionsUseCase, {
  useFactory: (c) =>
    new ListPositionsUseCase(
      c.resolve<PositionRepository>(TOKENS.PositionRepository),
    ),
});

// ============================================================
// Use cases - Badges
// ============================================================
container.register(ListBadgesUseCase, {
  useFactory: (c) =>
    new ListBadgesUseCase(c.resolve<BadgeRepository>(TOKENS.BadgeRepository)),
});

container.register(GrantCandidateBadgeUseCase, {
  useFactory: (c) =>
    new GrantCandidateBadgeUseCase(
      c.resolve<RestaurantRepository>(TOKENS.RestaurantRepository),
      c.resolve<HiringRepository>(TOKENS.HiringRepository),
      c.resolve<BadgeRepository>(TOKENS.BadgeRepository),
      c.resolve<CandidateBadgeRepository>(TOKENS.CandidateBadgeRepository),
    ),
});

container.register(RevokeCandidateBadgeUseCase, {
  useFactory: (c) =>
    new RevokeCandidateBadgeUseCase(
      c.resolve<RestaurantRepository>(TOKENS.RestaurantRepository),
      c.resolve<HiringRepository>(TOKENS.HiringRepository),
      c.resolve<BadgeRepository>(TOKENS.BadgeRepository),
      c.resolve<CandidateBadgeRepository>(TOKENS.CandidateBadgeRepository),
    ),
});

container.register(GetCandidateBadgesUseCase, {
  useFactory: (c) =>
    new GetCandidateBadgesUseCase(
      c.resolve<CandidateRepository>(TOKENS.CandidateRepository),
      c.resolve<BadgeRepository>(TOKENS.BadgeRepository),
      c.resolve<CandidateBadgeRepository>(TOKENS.CandidateBadgeRepository),
    ),
});

container.register(ListHiringBadgesUseCase, {
  useFactory: (c) =>
    new ListHiringBadgesUseCase(
      c.resolve<RestaurantRepository>(TOKENS.RestaurantRepository),
      c.resolve<HiringRepository>(TOKENS.HiringRepository),
      c.resolve<BadgeRepository>(TOKENS.BadgeRepository),
      c.resolve<CandidateBadgeRepository>(TOKENS.CandidateBadgeRepository),
    ),
});

// ============================================================
// Use cases - Jobs
// ============================================================
container.register(CreateJobUseCase, {
  useFactory: (c) =>
    new CreateJobUseCase(
      c.resolve<RestaurantRepository>(TOKENS.RestaurantRepository),
      c.resolve<JobRepository>(TOKENS.JobRepository),
      c.resolve<PositionRepository>(TOKENS.PositionRepository),
    ),
});

container.register(UpdateJobUseCase, {
  useFactory: (c) =>
    new UpdateJobUseCase(
      c.resolve<RestaurantRepository>(TOKENS.RestaurantRepository),
      c.resolve<JobRepository>(TOKENS.JobRepository),
      c.resolve<PositionRepository>(TOKENS.PositionRepository),
    ),
});

container.register(RescheduleJobUseCase, {
  useFactory: (c) =>
    new RescheduleJobUseCase(
      c.resolve<RestaurantRepository>(TOKENS.RestaurantRepository),
      c.resolve<JobRepository>(TOKENS.JobRepository),
    ),
});

container.register(ActivateJobUseCase, {
  useFactory: (c) =>
    new ActivateJobUseCase(
      c.resolve<RestaurantRepository>(TOKENS.RestaurantRepository),
      c.resolve<JobRepository>(TOKENS.JobRepository),
    ),
});

container.register(DeactivateJobUseCase, {
  useFactory: (c) =>
    new DeactivateJobUseCase(
      c.resolve<RestaurantRepository>(TOKENS.RestaurantRepository),
      c.resolve<JobRepository>(TOKENS.JobRepository),
    ),
});

container.register(DeleteJobUseCase, {
  useFactory: (c) =>
    new DeleteJobUseCase(
      c.resolve<RestaurantRepository>(TOKENS.RestaurantRepository),
      c.resolve<JobRepository>(TOKENS.JobRepository),
    ),
});

container.register(CancelJobUseCase, {
  useFactory: (c) =>
    new CancelJobUseCase(
      c.resolve<RestaurantRepository>(TOKENS.RestaurantRepository),
      c.resolve<JobRepository>(TOKENS.JobRepository),
      c.resolve<UnitOfWork>(TOKENS.UnitOfWork),
    ),
});

container.register(FinishJobUseCase, {
  useFactory: (c) =>
    new FinishJobUseCase(
      c.resolve<RestaurantRepository>(TOKENS.RestaurantRepository),
      c.resolve<JobRepository>(TOKENS.JobRepository),
      c.resolve<UnitOfWork>(TOKENS.UnitOfWork),
    ),
});

container.register(ListRestaurantJobsUseCase, {
  useFactory: (c) =>
    new ListRestaurantJobsUseCase(
      c.resolve<RestaurantRepository>(TOKENS.RestaurantRepository),
      c.resolve<JobRepository>(TOKENS.JobRepository),
    ),
});

container.register(ListOpenJobsUseCase, {
  useFactory: (c) =>
    new ListOpenJobsUseCase(c.resolve<JobRepository>(TOKENS.JobRepository)),
});

container.register(GetJobUseCase, {
  useFactory: (c) =>
    new GetJobUseCase(c.resolve<JobRepository>(TOKENS.JobRepository)),
});

// ============================================================
// Use cases - Applications
// ============================================================
container.register(ApplyForJobUseCase, {
  useFactory: (c) =>
    new ApplyForJobUseCase(
      c.resolve<CandidateRepository>(TOKENS.CandidateRepository),
      c.resolve<JobRepository>(TOKENS.JobRepository),
      c.resolve<HiringRepository>(TOKENS.HiringRepository),
    ),
});

container.register(CancelApplicationUseCase, {
  useFactory: (c) =>
    new CancelApplicationUseCase(
      c.resolve<CandidateRepository>(TOKENS.CandidateRepository),
      c.resolve<HiringRepository>(TOKENS.HiringRepository),
    ),
});

container.register(ListCandidateApplicationsUseCase, {
  useFactory: (c) =>
    new ListCandidateApplicationsUseCase(
      c.resolve<CandidateRepository>(TOKENS.CandidateRepository),
      c.resolve<HiringRepository>(TOKENS.HiringRepository),
    ),
});

container.register(ListJobApplicationsUseCase, {
  useFactory: (c) =>
    new ListJobApplicationsUseCase(
      c.resolve<RestaurantRepository>(TOKENS.RestaurantRepository),
      c.resolve<JobRepository>(TOKENS.JobRepository),
      c.resolve<HiringRepository>(TOKENS.HiringRepository),
    ),
});

container.register(AcceptCandidateUseCase, {
  useFactory: (c) =>
    new AcceptCandidateUseCase(
      c.resolve<RestaurantRepository>(TOKENS.RestaurantRepository),
      c.resolve<HiringRepository>(TOKENS.HiringRepository),
      c.resolve<UnitOfWork>(TOKENS.UnitOfWork),
    ),
});

container.register(RejectCandidateUseCase, {
  useFactory: (c) =>
    new RejectCandidateUseCase(
      c.resolve<RestaurantRepository>(TOKENS.RestaurantRepository),
      c.resolve<HiringRepository>(TOKENS.HiringRepository),
    ),
});

// ============================================================
// Use cases - Reviews
// ============================================================
container.register(ListCandidateReviewsUseCase, {
  useFactory: (c) =>
    new ListCandidateReviewsUseCase(
      c.resolve<CandidateRepository>(TOKENS.CandidateRepository),
      c.resolve<HiringRepository>(TOKENS.HiringRepository),
    ),
});

// ============================================================
// Controllers
// ============================================================
container.register(AuthController, {
  useFactory: (c) =>
    new AuthController(
      c.resolve(RegisterUserUseCase),
      c.resolve(AuthenticateUserUseCase),
      c.resolve(RefreshTokenUseCase),
      c.resolve(LogoutUseCase),
      c.resolve(GetProfileUseCase),
    ),
});

container.register(RestaurantController, {
  useFactory: (c) =>
    new RestaurantController(
      c.resolve(CreateRestaurantProfileUseCase),
      c.resolve(UpdateRestaurantProfileUseCase),
      c.resolve(GetRestaurantProfileUseCase),
      c.resolve(GetRestaurantOwnCpfCnpjUseCase),
      c.resolve(GetRestaurantOwnPhoneUseCase),
      c.resolve(DeleteRestaurantProfileUseCase),
    ),
});

container.register(CandidateController, {
  useFactory: (c) =>
    new CandidateController(
      c.resolve(CreateCandidateProfileUseCase),
      c.resolve(UpdateCandidateProfileUseCase),
      c.resolve(GetCandidateProfileUseCase),
      c.resolve(GetCandidateOwnCpfUseCase),
      c.resolve(GetCandidateOwnPhoneUseCase),
      c.resolve(DeleteCandidateProfileUseCase),
      c.resolve(GetCandidateBadgesUseCase),
      c.resolve(ListCandidateReviewsUseCase),
    ),
});

container.register(PositionController, {
  useFactory: (c) => new PositionController(c.resolve(ListPositionsUseCase)),
});

container.register(BadgeController, {
  useFactory: (c) => new BadgeController(c.resolve(ListBadgesUseCase)),
});

container.register(JobController, {
  useFactory: (c) =>
    new JobController(
      c.resolve(CreateJobUseCase),
      c.resolve(UpdateJobUseCase),
      c.resolve(GetJobUseCase),
      c.resolve(ListRestaurantJobsUseCase),
      c.resolve(ListOpenJobsUseCase),
      c.resolve(ActivateJobUseCase),
      c.resolve(DeactivateJobUseCase),
      c.resolve(DeleteJobUseCase),
      c.resolve(CancelJobUseCase),
      c.resolve(FinishJobUseCase),
      c.resolve(RescheduleJobUseCase),
    ),
});

container.register(ApplicationController, {
  useFactory: (c) =>
    new ApplicationController(
      c.resolve(ApplyForJobUseCase),
      c.resolve(CancelApplicationUseCase),
      c.resolve(ListCandidateApplicationsUseCase),
      c.resolve(ListJobApplicationsUseCase),
      c.resolve(AcceptCandidateUseCase),
      c.resolve(RejectCandidateUseCase),
      c.resolve(GrantCandidateBadgeUseCase),
      c.resolve(RevokeCandidateBadgeUseCase),
      c.resolve(ListHiringBadgesUseCase),
    ),
});

export { container };
