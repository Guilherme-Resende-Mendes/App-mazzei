---
name: feature-clean-arch
description: >-
  Guia o desenvolvimento de novas funcionalidades da Mazzei API seguindo Clean
  Architecture, DDD e SOLID, com um formato de resposta obrigatorio. Use sempre
  que o usuario pedir uma nova feature, endpoint, use case, regra de negocio ou
  alteracao no dominio desta API (Express + TypeScript + Prisma).
---

# Feature Clean Architecture (Mazzei API)

Aplique esta skill ao implementar qualquer funcionalidade nova nesta API.

## Forma de Responder

Sempre que o usuario solicitar uma nova funcionalidade:

1. Analise a arquitetura existente.
2. Explique rapidamente a solucao.
3. Liste todos os arquivos que serao criados ou alterados.
4. Explique como essa funcionalidade impacta o dominio.
5. Gere todos os arquivos completos.
6. Nunca utilize pseudocodigo.
7. Nunca omita arquivos.
8. Caso exista uma solucao melhor para escalabilidade, proponha antes de implementar.
9. Sempre considere seguranca, manutencao, desempenho e extensibilidade antes de escrever qualquer codigo.

## Ordem obrigatoria de desenvolvimento

Nunca pule etapas:

1. Modelagem do dominio
2. Entities
3. Value Objects
4. Interfaces dos Repositories
5. DTOs
6. Use Cases
7. Implementacoes Prisma
8. Controllers
9. Routes
10. Middlewares
11. Testes
12. Swagger

## Regras arquiteturais

- Toda dependencia aponta para dentro. Dominio e aplicacao nunca conhecem Express, Prisma, SQL ou HTTP.
- Regra de negocio vive apenas nos Use Cases; cada Use Case tem uma unica responsabilidade.
- Controllers apenas recebem a requisicao, validam entrada (Zod), chamam o Use Case e retornam HTTP. Nunca acessam o banco nem contem regra de negocio.
- Repositorios: interfaces no dominio (`domain/repositories`), implementacoes na infraestrutura (`infrastructure/database/repositories`, prefixo `Prisma`).
- Injecao de dependencia via composition root (`src/config/container.ts`). Nunca instanciar dependencias dentro de Use Cases; recebe-las por construtor (interfaces).
- Nunca usar `any`. Sempre tipar. Sempre `async/await`.
- Nunca retornar senha, hash ou refresh token nas respostas.
- Nomes de dominio em ingles; tabelas/colunas em portugues via `@map`/`@@map` no Prisma.

## Estrutura de pastas

```
src/
  application/    use-cases, dto, interfaces, mappers
  domain/         entities, value-objects, enums, exceptions, repositories
  infrastructure/ database (prisma client, repositories, mappers), providers
  http/           controllers, routes, middlewares, validators
  config/         env, container, swagger, tokens
  shared/         errors, utils, constants
tests/            unit, integration
```

## Padrao de resposta HTTP

Use os helpers em `src/shared/utils/httpResponse.ts`.

Sucesso:

```json
{ "success": true, "data": {} }
```

Erro:

```json
{ "success": false, "message": "...", "errors": [] }
```

## Testes

- Todo Use Case: teste unitario (repositorios in-memory em `tests/support`) e teste de integracao (Supertest) da rota.
- Erros de negocio: use as subclasses de `AppError` (`shared/errors`); invariantes de dominio: subclasses de `DomainException`.
- Cobertura minima 80% (`npm run test:cov`).

## Checklist antes de finalizar

```
- [ ] Etapas 1-12 seguidas na ordem
- [ ] Sem `any`; tudo tipado; async/await
- [ ] Regra de negocio apenas em Use Cases
- [ ] DI via container; nada instanciado dentro de Use Case
- [ ] Zod valida e usa .strict() (anti mass assignment)
- [ ] Migration Prisma + indices/constraints quando aplicavel
- [ ] Testes unitarios + integracao (>= 80%)
- [ ] Swagger: request, response, erros e autenticacao documentados
- [ ] Nenhum dado sensivel exposto (senha/hash/refresh token)
```
