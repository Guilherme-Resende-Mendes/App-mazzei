import { Router } from "express";
import { z } from "zod";
import { pool, query } from "../db.js";
import { getValidated, validate } from "../middleware/validate.js";
import {
  CreateCandidatoSchema,
  ListCandidatosQuerySchema,
  type CandidatoBuscaDto,
  type CandidatoDto,
} from "../types/dto.js";

export const candidatosRouter = Router();

candidatosRouter.get(
  "/",
  validate(ListCandidatosQuerySchema, "query"),
  async (req, res, next) => {
    try {
      const filters = getValidated<z.infer<typeof ListCandidatosQuerySchema>>(
        req,
        "query",
      );

      const clauses: string[] = [];
      const params: unknown[] = [];

      if (filters.area) {
        params.push(filters.area);
        clauses.push(`area_id = $${params.length}`);
      }
      if (filters.cargo_id) {
        params.push(filters.cargo_id);
        clauses.push(`cargo_id = $${params.length}`);
      }
      if (filters.nota_min !== undefined) {
        params.push(filters.nota_min);
        clauses.push(`nota_geral >= $${params.length}`);
      }

      const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
      const { rows } = await query<CandidatoBuscaDto>(
        `SELECT id, nome, telefone, pretensao_salarial, nota_geral, bio,
                cargo_id, cargo_nome, cargo_nivel, area_id, area_nome, selos
         FROM vw_candidatos_busca
         ${where}
         ORDER BY nota_geral DESC, nome`,
        params,
      );
      res.json(rows);
    } catch (err) {
      next(err);
    }
  },
);

candidatosRouter.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await query<CandidatoDto>(
      `SELECT id, nome, documento, endereco, telefone, cargo_id,
              pretensao_salarial, nota_geral, bio, ativo
       FROM candidatos
       WHERE id = $1`,
      [req.params.id],
    );
    if (!rows[0]) {
      return res.status(404).json({ error: "candidato_nao_encontrado" });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

candidatosRouter.get("/:id/historico", async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT candidato_id, candidato_nome, vezes_contratado,
              restaurantes_distintos, ultimo_preco, nota_geral, pretensao_salarial
       FROM vw_historico_candidato
       WHERE candidato_id = $1`,
      [req.params.id],
    );
    if (!rows[0]) {
      return res.status(404).json({ error: "candidato_nao_encontrado" });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

candidatosRouter.post(
  "/",
  validate(CreateCandidatoSchema),
  async (req, res, next) => {
    const client = await pool.connect();
    try {
      const body = getValidated<z.infer<typeof CreateCandidatoSchema>>(req);
      await client.query("BEGIN");

      const { rows } = await client.query<CandidatoDto>(
        `INSERT INTO candidatos
           (nome, documento, endereco, telefone, cargo_id, pretensao_salarial, bio)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, nome, documento, endereco, telefone, cargo_id,
                   pretensao_salarial, nota_geral, bio, ativo`,
        [
          body.nome,
          body.documento,
          body.endereco,
          body.telefone,
          body.cargo_id,
          body.pretensao_salarial,
          body.bio ?? null,
        ],
      );

      const candidato = rows[0];
      if (body.selos?.length) {
        for (const selo of body.selos) {
          await client.query(
            `INSERT INTO candidato_selos (candidato_id, selo) VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [candidato.id, selo],
          );
        }
      }

      await client.query("COMMIT");
      res.status(201).json(candidato);
    } catch (err) {
      await client.query("ROLLBACK");
      next(err);
    } finally {
      client.release();
    }
  },
);
