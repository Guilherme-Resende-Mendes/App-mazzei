# Mazzei API

Plataforma onde restaurantes contratam freelancers. API REST construida com **Clean Architecture**, **DDD**, **SOLID** e **Repository Pattern**.

## Stack

- Node.js >= 20 + TypeScript
- Express 5
- Prisma ORM (PostgreSQL)
- JWT + Refresh Token (cookie httpOnly)
- Bcrypt (bcryptjs)
- Zod (validacao)
- tsyringe (injecao de dependencia)
- Helmet, CORS, Rate Limit
- Swagger (OpenAPI 3) via `zod-to-openapi`
- Jest + Supertest (testes)
- ESLint + Prettier
- Docker + Docker Compose

## Arquitetura

```
HTTP -> Routes -> Controllers -> Use Cases -> Repositories (interfaces) -> Infrastructure -> Database
```

Toda dependencia aponta para dentro. A regra de negocio (domain + application) nunca depende de Express, Prisma ou SQL.

```
src/
  application/    # use-cases, dto, interfaces (providers, unit of work), mappers
  domain/         # entities, value-objects, enums, services, exceptions, repositories (interfaces)
  infrastructure/ # prisma client, repositories concretos, mappers, providers (hash, auth)
  http/           # controllers, routes, middlewares, validators
  config/         # env, container (DI), swagger
  shared/         # errors, utils, constants
tests/
  unit/           # dominio, use-cases, http
  integration/    # rotas via Supertest
  support/        # repositorios em memoria e fakes
```

## Como rodar (desenvolvimento)

1. Copie o arquivo de ambiente e ajuste os valores:

```bash
cp .env.example .env
```

2. Suba o banco de dados:

```bash
docker compose up -d db
```

3. Instale as dependencias e gere o client Prisma:

```bash
npm install
npm run prisma:generate
```

4. Rode as migrations e o seed:

```bash
npm run prisma:migrate
npm run prisma:seed
```

5. Suba a API em modo dev:

```bash
npm run dev
```

A API sobe em `http://localhost:3333` com prefixo `/api` (configuravel via `API_PREFIX`). A documentacao Swagger fica em `http://localhost:3333/docs` e o JSON em `http://localhost:3333/docs.json`.

## Como rodar (Docker completo)

```bash
docker compose up --build
```

Isso sobe o Postgres, aplica as migrations e inicia a API.

## Scripts

| Script | Descricao |
| --- | --- |
| `npm run dev` | API em modo watch (tsx) |
| `npm run build` | Compila TypeScript para `dist/` |
| `npm start` | Executa a build de producao |
| `npm run lint` | Lint com ESLint |
| `npm run lint:fix` | Lint com correcao automatica |
| `npm run format` | Formata com Prettier |
| `npm test` | Testes unitarios + integracao |
| `npm run test:cov` | Testes com relatorio de cobertura (meta 80%) |
| `npm run prisma:generate` | Gera o Prisma Client |
| `npm run prisma:migrate` | Cria/aplica migrations em dev |
| `npm run prisma:deploy` | Aplica migrations em producao |
| `npm run prisma:seed` | Popula o catalogo de cargos (`positions`) |
| `npm run prisma:studio` | Abre o Prisma Studio |

## Padrao de resposta

Sucesso:

```json
{ "success": true, "data": {} }
```

Erro:

```json
{ "success": false, "message": "...", "errors": [] }
```

## Convencoes de contrato

- **Datas de vaga**: `startDate` e `endDate` no formato `DD/MM/AAAA HH:mm`, interpretadas em UTC. Nao existe campo `date` separado de horario.
- **Timestamps de auditoria**: `createdAt`, `updatedAt`, `requestedAt`, `respondedAt` em ISO 8601.
- **Valores monetarios**: enviados como `number` com no maximo 2 casas decimais e retornados como string com 2 casas fixas (ex.: `"100.10"`), preservando a escala de `DECIMAL(10,2)`.
- **Paginacao**: query `page` e `perPage` (max 100); resposta com `items`, `total`, `page`, `perPage`, `totalPages`.
- **Autenticacao**: header `Authorization: Bearer {accessToken}` em todas as rotas exceto `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout` e `/health`.
- **Endereco de perfil**: objeto `address` com `rua`, `bairro`, `numero` (opcional), `complemento` (opcional) e `cep` (8 digitos). No cadastro e na atualizacao, o CEP e validado via ViaCEP e a rua/bairro informados devem corresponder ao retorno do servico quando disponivel.
- **CPF/CNPJ e telefone**: aceitam mascara na entrada; sao normalizados para apenas digitos antes de persistir.
  - Candidato (`document`): CPF valido (11 digitos + digitos verificadores).
  - Restaurante (`cpfCnpj`): CPF ou CNPJ valido.
  - Telefone (`phone`): celular brasileiro (11 digitos, com DDD) ou fixo (10 digitos, com DDD). Aceita prefixo `+55`. Validado no cadastro e quando enviado em atualizacoes.
- **Dados sensiveis de perfil**: `document`/`cpf`/`cpfCnpj` e `phone` nao aparecem em `GET /me` nem em `GET /candidates/:id`. O dono do perfil consulta esses campos pelos endpoints dedicados `/me/cpf`, `/me/cpf-cnpj` e `/me/phone`.

## Modulos e endpoints

Todos implementados seguindo a skill `feature-clean-arch`.

### Auth (`/api/auth`)

| Metodo | Rota | Acesso |
| --- | --- | --- |
| POST | `/register` | publico |
| POST | `/login` | publico |
| POST | `/refresh` | publico |
| POST | `/logout` | publico |
| GET | `/me` | autenticado |

### Restaurants (`/api/restaurants`)

| Metodo | Rota | Acesso |
| --- | --- | --- |
| POST | `/` | OWNER |
| GET | `/me` | OWNER |
| GET | `/me/cpf-cnpj` | OWNER |
| GET | `/me/phone` | OWNER |
| PUT | `/me` | OWNER |
| DELETE | `/me` | OWNER |

### Candidates (`/api/candidates`)

| Metodo | Rota | Acesso |
| --- | --- | --- |
| POST | `/` | CLIENT |
| GET | `/me` | CLIENT |
| GET | `/me/cpf` | CLIENT |
| GET | `/me/phone` | CLIENT |
| GET | `/me/reviews` | CLIENT |
| PUT | `/me` | CLIENT |
| DELETE | `/me` | CLIENT |
| GET | `/:id` | OWNER |
| POST | `/:id/badges` | ADMIN |
| DELETE | `/:id/badges/:badge` | ADMIN |

### Positions (`/api/positions`)

| Metodo | Rota | Acesso |
| --- | --- | --- |
| GET | `/` | autenticado |

### Jobs (`/api/jobs`)

| Metodo | Rota | Acesso |
| --- | --- | --- |
| GET | `/` | autenticado (vagas abertas e ativas) |
| GET | `/mine` | OWNER |
| POST | `/` | OWNER |
| GET | `/:id` | autenticado |
| PUT | `/:id` | OWNER |
| DELETE | `/:id` | OWNER (soft delete) |
| POST | `/:id/activate` | OWNER |
| POST | `/:id/deactivate` | OWNER |
| POST | `/:id/cancel` | OWNER |
| POST | `/:id/finish` | OWNER |
| POST | `/:id/reschedule` | OWNER |
| POST | `/:id/applications` | CLIENT (candidatar-se) |
| GET | `/:id/applications` | OWNER |

### Applications (`/api/applications`)

| Metodo | Rota | Acesso |
| --- | --- | --- |
| GET | `/mine` | CLIENT |
| POST | `/:id/cancel` | CLIENT |
| POST | `/:id/accept` | OWNER (requer `agreedPrice`) |
| POST | `/:id/reject` | OWNER |

Transicoes de estado (activate, cancel, finish, reschedule, accept, reject) usam `POST` em action endpoints por serem comandos de dominio com regras e efeitos colaterais, e nao CRUD generico.

## Regras de dominio

### Vaga (`Job`)

- Status: `ABERTA`, `PREENCHIDA`, `CANCELADA`, `CONCLUIDA`.
- A flag `active` e independente do status: uma vaga `ABERTA` com `active: false` fica oculta da listagem publica e nao aceita candidaturas. Pode ser criada assim (`"active": false`) e reativada via `/activate`.
- Ao atingir `peopleCount` aceites, a vaga passa a `PREENCHIDA` automaticamente.
- `reschedule` permitido em `ABERTA` e `PREENCHIDA`; bloqueado em `CANCELADA` e `CONCLUIDA`.
- Cancelar a vaga cancela as candidaturas pendentes.
- `finish` avalia as contratacoes `ACEITA`: `evaluations` e obrigatorio quando existem candidatos aceitos, com uma entrada por `hiringId` e notas `deliveryRating`/`punctualityRating` de 0 a 5.

### Candidatura (`Hiring`)

- Status: `SOLICITADA`, `ACEITA`, `RECUSADA`, `CONCLUIDA`, `CANCELADA`.
- Existe unicidade por par vaga + candidato (`@@unique([jobId, candidateId])`).
- **Re-candidatura**: se o candidato cancelou (`CANCELADA`), uma nova candidatura reativa o registro existente e volta para `SOLICITADA`. Nos demais status a nova candidatura e bloqueada com `409`.
- Cancelar uma candidatura `ACEITA` marca `cancellationFault` (falta), que impacta a reputacao do candidato.
- Apenas contratacoes `CONCLUIDA` sem falta e com as duas notas entram no calculo da nota geral.

## Testes

```bash
npm test
npm run test:cov
```

Testes unitarios cobrem dominio, use-cases e middlewares usando repositorios em memoria (`tests/support`). Testes de integracao exercitam as rotas com Supertest.
