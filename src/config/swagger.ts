import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi';
import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { z } from 'zod';
import {
  loginBodySchema,
  refreshBodySchema,
  registerBodySchema,
} from '../http/validators/auth.validators';
import {
  createCandidateBodySchema,
  createRestaurantBodySchema,
  grantBadgeBodySchema,
  updateCandidateBodySchema,
  updateRestaurantBodySchema,
} from '../http/validators/profile.validators';
import {
  createJobBodySchema,
  finishJobBodySchema,
  rescheduleJobBodySchema,
  updateJobBodySchema,
} from '../http/validators/job.validators';
import { acceptCandidateBodySchema } from '../http/validators/application.validators';
import { env } from './env';

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

const userResponseSchema = registry.register(
  'User',
  z
    .object({
      id: z.string(),
      email: z.string(),
      role: z.enum(['OWNER', 'CLIENT', 'ADMIN']),
      active: z.boolean(),
      lastLoginAt: z.string().nullable(),
      createdAt: z.string(),
      updatedAt: z.string(),
    })
    .openapi('User'),
);

const authDataSchema = z.object({
  user: userResponseSchema,
  accessToken: z.string(),
});

function successEnvelope<T extends z.ZodTypeAny>(data: T) {
  return z.object({ success: z.literal(true), data });
}

const errorEnvelope = registry.register(
  'ErrorResponse',
  z
    .object({
      success: z.literal(false),
      message: z.string(),
      errors: z.array(z.string()),
    })
    .openapi('ErrorResponse'),
);

const jsonContent = <T extends z.ZodTypeAny>(schema: T) => ({
  'application/json': { schema },
});

const finishJobBodyExample = {
  evaluations: [
    {
      hiringId: 'uuid-contratacao-1',
      deliveryRating: 4.5,
      punctualityRating: 5,
    },
    {
      hiringId: 'uuid-contratacao-2',
      deliveryRating: 3,
      punctualityRating: 4,
    },
  ],
};

const errorResponse = (description: string) => ({
  description,
  content: jsonContent(errorEnvelope),
});

registry.registerPath({
  method: 'post',
  path: '/auth/register',
  tags: ['Auth'],
  summary: 'Cria uma conta (client ou owner)',
  request: {
    body: { content: jsonContent(registerBodySchema) },
  },
  responses: {
    201: {
      description: 'Usuario criado',
      content: jsonContent(successEnvelope(userResponseSchema)),
    },
    400: errorResponse('Dados invalidos'),
    409: errorResponse('E-mail ja cadastrado'),
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/login',
  tags: ['Auth'],
  summary: 'Autentica e emite access token (refresh via cookie httpOnly)',
  request: {
    body: { content: jsonContent(loginBodySchema) },
  },
  responses: {
    200: {
      description: 'Autenticado',
      content: jsonContent(successEnvelope(authDataSchema)),
    },
    401: errorResponse('Credenciais invalidas'),
    403: errorResponse('Usuario inativo'),
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/refresh',
  tags: ['Auth'],
  summary: 'Rotaciona o refresh token e emite novo access token',
  request: {
    body: { content: jsonContent(refreshBodySchema) },
  },
  responses: {
    200: {
      description: 'Novo par de tokens',
      content: jsonContent(successEnvelope(authDataSchema)),
    },
    401: errorResponse('Refresh token invalido ou expirado'),
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/logout',
  tags: ['Auth'],
  summary: 'Revoga o refresh token e limpa o cookie',
  responses: {
    200: {
      description: 'Logout realizado',
      content: jsonContent(successEnvelope(z.object({ message: z.string() }))),
    },
    401: errorResponse('Refresh token invalido ou expirado'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/auth/me',
  tags: ['Auth'],
  summary: 'Retorna o perfil do usuario autenticado',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Perfil do usuario',
      content: jsonContent(successEnvelope(userResponseSchema)),
    },
    401: errorResponse('Nao autenticado'),
    404: errorResponse('Usuario nao encontrado'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/health',
  tags: ['Health'],
  summary: 'Healthcheck',
  responses: {
    200: {
      description: 'Servico saudavel',
      content: jsonContent(
        successEnvelope(z.object({ status: z.string(), uptime: z.number() })),
      ),
    },
  },
});

// ============================================================
// Schemas de resposta (Profiles, Jobs, Applications, Reviews)
// ============================================================

const restaurantResponseSchema = registry.register(
  'Restaurant',
  z
    .object({
      id: z.string(),
      userId: z.string(),
      name: z.string(),
      cpfCnpj: z.string(),
      address: z.string(),
      phone: z.string(),
      requirementLevel: z.number().nullable(),
      active: z.boolean(),
      createdAt: z.string(),
      updatedAt: z.string(),
    })
    .openapi('Restaurant'),
);

const candidateBadgeSchema = z.object({
  badge: z.enum(['PONTUAL', 'FLEXIVEL']),
  grantedAt: z.string(),
});

const candidateResponseSchema = registry.register(
  'Candidate',
  z
    .object({
      id: z.string(),
      userId: z.string(),
      name: z.string(),
      document: z.string(),
      address: z.string(),
      phone: z.string(),
      positionId: z.string(),
      expectedSalary: z.number(),
      overallRating: z.number(),
      bio: z.string().nullable(),
      badges: z.array(candidateBadgeSchema),
      active: z.boolean(),
      createdAt: z.string(),
      updatedAt: z.string(),
    })
    .openapi('Candidate'),
);

const positionResponseSchema = registry.register(
  'Position',
  z
    .object({
      id: z.string(),
      area: z.enum(['COZINHA', 'SALAO', 'BAR']),
      name: z.string(),
      level: z.number(),
      active: z.boolean(),
    })
    .openapi('Position'),
);

const jobResponseSchema = registry.register(
  'Job',
  z
    .object({
      id: z.string(),
      restaurantId: z.string(),
      positionId: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      peopleCount: z.number(),
      status: z.enum(['ABERTA', 'PREENCHIDA', 'CANCELADA', 'CONCLUIDA']),
      active: z.boolean(),
      notes: z.string().nullable(),
      createdAt: z.string(),
      updatedAt: z.string(),
    })
    .openapi('Job'),
);

const paginatedJobsSchema = registry.register(
  'PaginatedJobs',
  z
    .object({
      items: z.array(jobResponseSchema),
      total: z.number(),
      page: z.number(),
      perPage: z.number(),
      totalPages: z.number(),
    })
    .openapi('PaginatedJobs'),
);

const hiringResponseSchema = registry.register(
  'Hiring',
  z
    .object({
      id: z.string(),
      jobId: z.string(),
      candidateId: z.string(),
      restaurantId: z.string(),
      agreedPrice: z.string().nullable(),
      status: z.enum([
        'SOLICITADA',
        'ACEITA',
        'RECUSADA',
        'CONCLUIDA',
        'CANCELADA',
      ]),
      requestedAt: z.string(),
      respondedAt: z.string().nullable(),
      deliveryRating: z.number().nullable(),
      punctualityRating: z.number().nullable(),
      cancellationFault: z.boolean(),
      createdAt: z.string(),
      updatedAt: z.string(),
    })
    .openapi('Hiring'),
);

const reviewResponseSchema = registry.register(
  'CandidateReview',
  z
    .object({
      hiringId: z.string(),
      jobId: z.string(),
      deliveryRating: z.number(),
      punctualityRating: z.number(),
      average: z.number(),
      concludedAt: z.string(),
    })
    .openapi('CandidateReview'),
);

const messageSchema = z.object({ message: z.string() });

const idParam = {
  params: z.object({ id: z.string().uuid() }),
};

// ============================================================
// Paths - Restaurants
// ============================================================

registry.registerPath({
  method: 'post',
  path: '/restaurants',
  tags: ['Restaurants'],
  summary: 'Cria o perfil de restaurante (OWNER)',
  security: [{ bearerAuth: [] }],
  request: { body: { content: jsonContent(createRestaurantBodySchema) } },
  responses: {
    201: {
      description: 'Perfil criado',
      content: jsonContent(successEnvelope(restaurantResponseSchema)),
    },
    401: errorResponse('Nao autenticado'),
    403: errorResponse('Sem permissao'),
    409: errorResponse('Perfil ou CPF/CNPJ ja existente'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/restaurants/me',
  tags: ['Restaurants'],
  summary: 'Retorna o perfil de restaurante do usuario (OWNER)',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Perfil',
      content: jsonContent(successEnvelope(restaurantResponseSchema)),
    },
    401: errorResponse('Nao autenticado'),
    404: errorResponse('Perfil nao encontrado'),
  },
});

registry.registerPath({
  method: 'put',
  path: '/restaurants/me',
  tags: ['Restaurants'],
  summary: 'Atualiza o perfil de restaurante (OWNER)',
  security: [{ bearerAuth: [] }],
  request: { body: { content: jsonContent(updateRestaurantBodySchema) } },
  responses: {
    200: {
      description: 'Perfil atualizado',
      content: jsonContent(successEnvelope(restaurantResponseSchema)),
    },
    401: errorResponse('Nao autenticado'),
    404: errorResponse('Perfil nao encontrado'),
  },
});

registry.registerPath({
  method: 'delete',
  path: '/restaurants/me',
  tags: ['Restaurants'],
  summary: 'Remove (soft delete) o perfil de restaurante (OWNER)',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Perfil removido',
      content: jsonContent(successEnvelope(messageSchema)),
    },
    401: errorResponse('Nao autenticado'),
    404: errorResponse('Perfil nao encontrado'),
  },
});

// ============================================================
// Paths - Candidates
// ============================================================

registry.registerPath({
  method: 'post',
  path: '/candidates',
  tags: ['Candidates'],
  summary: 'Cria o perfil de candidato (CLIENT)',
  security: [{ bearerAuth: [] }],
  request: { body: { content: jsonContent(createCandidateBodySchema) } },
  responses: {
    201: {
      description: 'Perfil criado',
      content: jsonContent(successEnvelope(candidateResponseSchema)),
    },
    401: errorResponse('Nao autenticado'),
    409: errorResponse('Perfil ou documento ja existente'),
    422: errorResponse('Cargo invalido ou inativo'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/candidates/me',
  tags: ['Candidates'],
  summary: 'Retorna o perfil de candidato do usuario (CLIENT)',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Perfil',
      content: jsonContent(successEnvelope(candidateResponseSchema)),
    },
    401: errorResponse('Nao autenticado'),
    404: errorResponse('Perfil nao encontrado'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/candidates/me/reviews',
  tags: ['Reviews'],
  summary: 'Historico de avaliacoes do candidato autenticado (CLIENT)',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Avaliacoes',
      content: jsonContent(successEnvelope(z.array(reviewResponseSchema))),
    },
    401: errorResponse('Nao autenticado'),
  },
});

registry.registerPath({
  method: 'put',
  path: '/candidates/me',
  tags: ['Candidates'],
  summary: 'Atualiza o perfil de candidato (CLIENT)',
  security: [{ bearerAuth: [] }],
  request: { body: { content: jsonContent(updateCandidateBodySchema) } },
  responses: {
    200: {
      description: 'Perfil atualizado',
      content: jsonContent(successEnvelope(candidateResponseSchema)),
    },
    401: errorResponse('Nao autenticado'),
    404: errorResponse('Perfil nao encontrado'),
    422: errorResponse('Cargo invalido ou inativo'),
  },
});

registry.registerPath({
  method: 'delete',
  path: '/candidates/me',
  tags: ['Candidates'],
  summary: 'Remove (soft delete) o perfil de candidato (CLIENT)',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Perfil removido',
      content: jsonContent(successEnvelope(messageSchema)),
    },
    401: errorResponse('Nao autenticado'),
    404: errorResponse('Perfil nao encontrado'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/candidates/{id}',
  tags: ['Candidates'],
  summary: 'Retorna um perfil de candidato por id',
  security: [{ bearerAuth: [] }],
  request: idParam,
  responses: {
    200: {
      description: 'Perfil',
      content: jsonContent(successEnvelope(candidateResponseSchema)),
    },
    401: errorResponse('Nao autenticado'),
    404: errorResponse('Perfil nao encontrado'),
  },
});

registry.registerPath({
  method: 'post',
  path: '/candidates/{id}/badges',
  tags: ['Candidates'],
  summary: 'Concede um selo ao candidato (ADMIN)',
  security: [{ bearerAuth: [] }],
  request: { ...idParam, body: { content: jsonContent(grantBadgeBodySchema) } },
  responses: {
    201: {
      description: 'Selo concedido',
      content: jsonContent(successEnvelope(candidateResponseSchema)),
    },
    403: errorResponse('Sem permissao'),
    404: errorResponse('Candidato nao encontrado'),
    409: errorResponse('Selo ja concedido'),
  },
});

registry.registerPath({
  method: 'delete',
  path: '/candidates/{id}/badges/{badge}',
  tags: ['Candidates'],
  summary: 'Revoga um selo do candidato (ADMIN)',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().uuid(),
      badge: z.enum(['PONTUAL', 'FLEXIVEL']),
    }),
  },
  responses: {
    200: {
      description: 'Selo revogado',
      content: jsonContent(successEnvelope(candidateResponseSchema)),
    },
    403: errorResponse('Sem permissao'),
    404: errorResponse('Candidato ou selo nao encontrado'),
  },
});

// ============================================================
// Paths - Positions
// ============================================================

registry.registerPath({
  method: 'get',
  path: '/positions',
  tags: ['Positions'],
  summary: 'Lista os cargos do catalogo (filtro opcional por area)',
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      area: z.enum(['COZINHA', 'SALAO', 'BAR']).optional(),
    }),
  },
  responses: {
    200: {
      description: 'Cargos',
      content: jsonContent(successEnvelope(z.array(positionResponseSchema))),
    },
    401: errorResponse('Nao autenticado'),
  },
});

// ============================================================
// Paths - Jobs
// ============================================================

registry.registerPath({
  method: 'get',
  path: '/jobs',
  tags: ['Jobs'],
  summary: 'Lista vagas abertas (filtros + paginacao)',
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      area: z.enum(['COZINHA', 'SALAO', 'BAR']).optional(),
      positionId: z.string().uuid().optional(),
      fromStartDate: z.string().optional(),
      page: z.number().optional(),
      perPage: z.number().optional(),
    }),
  },
  responses: {
    200: {
      description: 'Vagas abertas',
      content: jsonContent(successEnvelope(paginatedJobsSchema)),
    },
    401: errorResponse('Nao autenticado'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/jobs/mine',
  tags: ['Jobs'],
  summary: 'Lista as vagas do restaurante autenticado (OWNER)',
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      status: z
        .enum(['ABERTA', 'PREENCHIDA', 'CANCELADA', 'CONCLUIDA'])
        .optional(),
      active: z.boolean().optional(),
      page: z.number().optional(),
      perPage: z.number().optional(),
    }),
  },
  responses: {
    200: {
      description: 'Vagas do restaurante',
      content: jsonContent(successEnvelope(paginatedJobsSchema)),
    },
    401: errorResponse('Nao autenticado'),
    403: errorResponse('Sem permissao'),
  },
});

registry.registerPath({
  method: 'post',
  path: '/jobs',
  tags: ['Jobs'],
  summary: 'Cria uma vaga (OWNER)',
  security: [{ bearerAuth: [] }],
  request: { body: { content: jsonContent(createJobBodySchema) } },
  responses: {
    201: {
      description: 'Vaga criada',
      content: jsonContent(successEnvelope(jobResponseSchema)),
    },
    401: errorResponse('Nao autenticado'),
    403: errorResponse('Sem permissao'),
    422: errorResponse('Cargo invalido ou agendamento invalido'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/jobs/{id}',
  tags: ['Jobs'],
  summary: 'Retorna uma vaga por id',
  security: [{ bearerAuth: [] }],
  request: idParam,
  responses: {
    200: {
      description: 'Vaga',
      content: jsonContent(successEnvelope(jobResponseSchema)),
    },
    401: errorResponse('Nao autenticado'),
    404: errorResponse('Vaga nao encontrada'),
  },
});

registry.registerPath({
  method: 'put',
  path: '/jobs/{id}',
  tags: ['Jobs'],
  summary: 'Atualiza uma vaga aberta (OWNER)',
  security: [{ bearerAuth: [] }],
  request: { ...idParam, body: { content: jsonContent(updateJobBodySchema) } },
  responses: {
    200: {
      description: 'Vaga atualizada',
      content: jsonContent(successEnvelope(jobResponseSchema)),
    },
    403: errorResponse('Sem permissao / nao e o dono'),
    404: errorResponse('Vaga nao encontrada'),
    422: errorResponse('Transicao invalida'),
  },
});

registry.registerPath({
  method: 'delete',
  path: '/jobs/{id}',
  tags: ['Jobs'],
  summary: 'Remove (soft delete) uma vaga (OWNER)',
  security: [{ bearerAuth: [] }],
  request: idParam,
  responses: {
    200: {
      description: 'Vaga removida',
      content: jsonContent(successEnvelope(messageSchema)),
    },
    403: errorResponse('Sem permissao / nao e o dono'),
    404: errorResponse('Vaga nao encontrada'),
  },
});

for (const action of ['activate', 'deactivate', 'cancel'] as const) {
  registry.registerPath({
    method: 'post',
    path: `/jobs/{id}/${action}`,
    tags: ['Jobs'],
    summary: `Acao de vaga: ${action} (OWNER)`,
    security: [{ bearerAuth: [] }],
    request: idParam,
    responses: {
      200: {
        description: 'Vaga atualizada',
        content: jsonContent(successEnvelope(jobResponseSchema)),
      },
      403: errorResponse('Sem permissao / nao e o dono'),
      404: errorResponse('Vaga nao encontrada'),
      422: errorResponse('Transicao invalida'),
    },
  });
}

registry.registerPath({
  method: 'post',
  path: '/jobs/{id}/reschedule',
  tags: ['Jobs'],
  summary: 'Reagenda uma vaga (OWNER)',
  security: [{ bearerAuth: [] }],
  request: {
    ...idParam,
    body: { content: jsonContent(rescheduleJobBodySchema) },
  },
  responses: {
    200: {
      description: 'Vaga reagendada',
      content: jsonContent(successEnvelope(jobResponseSchema)),
    },
    403: errorResponse('Sem permissao / nao e o dono'),
    404: errorResponse('Vaga nao encontrada'),
    422: errorResponse('Agendamento ou transicao invalida'),
  },
});

registry.registerPath({
  method: 'post',
  path: '/jobs/{id}/finish',
  tags: ['Jobs'],
  summary: 'Conclui a vaga avaliando as contratacoes aceitas (OWNER)',
  security: [{ bearerAuth: [] }],
  request: {
    ...idParam,
    body: {
      content: {
        'application/json': {
          schema: finishJobBodySchema,
          example: finishJobBodyExample,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Vaga concluida',
      content: jsonContent(successEnvelope(jobResponseSchema)),
    },
    400: errorResponse('Avaliacoes inconsistentes'),
    403: errorResponse('Sem permissao / nao e o dono'),
    404: errorResponse('Vaga nao encontrada'),
  },
});

// ============================================================
// Paths - Applications
// ============================================================

registry.registerPath({
  method: 'post',
  path: '/jobs/{id}/applications',
  tags: ['Applications'],
  summary: 'Candidata-se a uma vaga (CLIENT)',
  security: [{ bearerAuth: [] }],
  request: idParam,
  responses: {
    201: {
      description: 'Candidatura criada',
      content: jsonContent(successEnvelope(hiringResponseSchema)),
    },
    403: errorResponse('Sem permissao'),
    404: errorResponse('Vaga nao encontrada'),
    409: errorResponse('Ja candidatado ou vaga indisponivel'),
    422: errorResponse('Vaga com data passada'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/jobs/{id}/applications',
  tags: ['Applications'],
  summary: 'Lista as candidaturas de uma vaga (OWNER)',
  security: [{ bearerAuth: [] }],
  request: idParam,
  responses: {
    200: {
      description: 'Candidaturas',
      content: jsonContent(successEnvelope(z.array(hiringResponseSchema))),
    },
    403: errorResponse('Sem permissao / nao e o dono'),
    404: errorResponse('Vaga nao encontrada'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/applications/mine',
  tags: ['Applications'],
  summary: 'Lista as candidaturas do candidato autenticado (CLIENT)',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Candidaturas',
      content: jsonContent(successEnvelope(z.array(hiringResponseSchema))),
    },
    401: errorResponse('Nao autenticado'),
    403: errorResponse('Sem permissao'),
  },
});

registry.registerPath({
  method: 'post',
  path: '/applications/{id}/cancel',
  tags: ['Applications'],
  summary: 'Cancela a propria candidatura (CLIENT)',
  security: [{ bearerAuth: [] }],
  request: idParam,
  responses: {
    200: {
      description: 'Candidatura cancelada',
      content: jsonContent(successEnvelope(hiringResponseSchema)),
    },
    403: errorResponse('Sem permissao / nao e o dono'),
    404: errorResponse('Candidatura nao encontrada'),
    422: errorResponse('Transicao invalida'),
  },
});

const acceptCandidateBodyExample = {
  agreedPrice: 100.1,
};

registry.registerPath({
  method: 'post',
  path: '/applications/{id}/accept',
  tags: ['Applications'],
  summary: 'Aceita uma candidatura (OWNER)',
  security: [{ bearerAuth: [] }],
  request: {
    ...idParam,
    body: {
      content: {
        'application/json': {
          schema: acceptCandidateBodySchema,
          example: acceptCandidateBodyExample,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Candidatura aceita',
      content: jsonContent(successEnvelope(hiringResponseSchema)),
    },
    403: errorResponse('Sem permissao'),
    404: errorResponse('Candidatura nao encontrada'),
    409: errorResponse('Vaga fechada ou ja preenchida'),
  },
});

registry.registerPath({
  method: 'post',
  path: '/applications/{id}/reject',
  tags: ['Applications'],
  summary: 'Recusa uma candidatura (OWNER)',
  security: [{ bearerAuth: [] }],
  request: idParam,
  responses: {
    200: {
      description: 'Candidatura recusada',
      content: jsonContent(successEnvelope(hiringResponseSchema)),
    },
    403: errorResponse('Sem permissao'),
    404: errorResponse('Candidatura nao encontrada'),
    422: errorResponse('Transicao invalida'),
  },
});

export function buildOpenApiDocument(): ReturnType<
  OpenApiGeneratorV3['generateDocument']
> {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'Mazzei API',
      version: '1.0.0',
      description:
        'API da plataforma onde restaurantes contratam freelancers. Modulos: Auth, Restaurants, Candidates, Positions, Jobs, Applications e Reviews.',
    },
    servers: [{ url: env.API_PREFIX }],
  });
}

export function setupSwagger(app: Express): void {
  const document = buildOpenApiDocument();

  app.get('/docs.json', (_req, res) => {
    res.json(document);
  });

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(document));
}
