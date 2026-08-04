import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { getValidated, validate } from "../middleware/validate.js";
import {
  CreateVagaSchema,
  ListVagasQuerySchema,
  type VagaDto,
} from "../types/dto.js";

export const vagasRouter = Router();

vagasRouter.get(
  "/",
  validate(ListVagasQuerySchema, "query"),
  async (req, res, next) => {
    try {
      const filters = getValidated<z.infer<typeof ListVagasQuerySchema>>(
        req,
        "query",
      );

      const clauses: string[] = [];
      const params: unknown[] = [];

      if (filters.cargo_id) {
        params.push(filters.cargo_id);
        clauses.push(`v.cargo_id = $${params.length}`);
      }
      if (filters.restaurante_id) {
        params.push(filters.restaurante_id);
        clauses.push(`v.restaurante_id = $${params.length}`);
      }
      if (filters.status) {
        params.push(filters.status);
        clauses.push(`v.status = $${params.length}`);
      }
      if (filters.data) {
        params.push(filters.data);
        clauses.push(`v.data = $${params.length}`);
      }
      if (filters.area) {
        params.push(filters.area);
        clauses.push(`c.area_id = $${params.length}`);
      }

      const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
      const { rows } = await query<
        VagaDto & { cargo_nome: string; area_id: string; area_nome: string }
      >(
        `SELECT v.id, v.restaurante_id, v.cargo_id, v.data::text,
                v.horario_inicio::text, v.horario_fim::text,
                v.qtd_pessoas, v.status, v.observacao,
                c.nome AS cargo_nome, a.id AS area_id, a.nome AS area_nome
         FROM vagas v
         JOIN cargos c ON c.id = v.cargo_id
         JOIN areas a ON a.id = c.area_id
         ${where}
         ORDER BY v.data DESC, v.horario_inicio`,
        params,
      );
      res.json(rows);
    } catch (err) {
      next(err);
    }
  },
);

vagasRouter.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await query<VagaDto>(
      `SELECT id, restaurante_id, cargo_id, data::text,
              horario_inicio::text, horario_fim::text,
              qtd_pessoas, status, observacao
       FROM vagas
       WHERE id = $1`,
      [req.params.id],
    );
    if (!rows[0]) {
      return res.status(404).json({ error: "vaga_nao_encontrada" });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

vagasRouter.post(
  "/",
  validate(CreateVagaSchema),
  async (req, res, next) => {
    try {
      const body = getValidated<z.infer<typeof CreateVagaSchema>>(req);
      const { rows } = await query<VagaDto>(
        `INSERT INTO vagas
           (restaurante_id, cargo_id, data, horario_inicio, horario_fim, qtd_pessoas, observacao)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, restaurante_id, cargo_id, data::text,
                   horario_inicio::text, horario_fim::text,
                   qtd_pessoas, status, observacao`,
        [
          body.restaurante_id,
          body.cargo_id,
          body.data,
          body.horario_inicio,
          body.horario_fim,
          body.qtd_pessoas,
          body.observacao ?? null,
        ],
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      next(err);
    }
  },
);
