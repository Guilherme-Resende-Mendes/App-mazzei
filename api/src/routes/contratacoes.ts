import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { getValidated, validate } from "../middleware/validate.js";
import {
  AvaliarContratacaoSchema,
  CreateContratacaoSchema,
  ResponderContratacaoSchema,
  type ContratacaoDto,
} from "../types/dto.js";

export const contratacoesRouter = Router();

contratacoesRouter.get("/", async (req, res, next) => {
  try {
    const { candidato_id, restaurante_id, vaga_id, status } = req.query;
    const clauses: string[] = [];
    const params: unknown[] = [];

    if (typeof candidato_id === "string") {
      params.push(candidato_id);
      clauses.push(`candidato_id = $${params.length}`);
    }
    if (typeof restaurante_id === "string") {
      params.push(restaurante_id);
      clauses.push(`restaurante_id = $${params.length}`);
    }
    if (typeof vaga_id === "string") {
      params.push(vaga_id);
      clauses.push(`vaga_id = $${params.length}`);
    }
    if (typeof status === "string") {
      params.push(status);
      clauses.push(`status = $${params.length}`);
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const { rows } = await query<ContratacaoDto>(
      `SELECT id, vaga_id, candidato_id, restaurante_id, preco_acordado, status,
              solicitado_em::text, respondido_em::text,
              nota_entrega, nota_pontualidade, attr_cancelamento
       FROM contratacoes
       ${where}
       ORDER BY solicitado_em DESC`,
      params,
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/** Restaurante solicita candidato para uma vaga */
contratacoesRouter.post(
  "/",
  validate(CreateContratacaoSchema),
  async (req, res, next) => {
    try {
      const body = getValidated<z.infer<typeof CreateContratacaoSchema>>(req);
      const { rows } = await query<ContratacaoDto>(
        `INSERT INTO contratacoes
           (vaga_id, candidato_id, restaurante_id, preco_acordado)
         VALUES ($1, $2, $3, $4)
         RETURNING id, vaga_id, candidato_id, restaurante_id, preco_acordado, status,
                   solicitado_em::text, respondido_em::text,
                   nota_entrega, nota_pontualidade, attr_cancelamento`,
        [
          body.vaga_id,
          body.candidato_id,
          body.restaurante_id,
          body.preco_acordado ?? null,
        ],
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      next(err);
    }
  },
);

/** Candidato aceita ou recusa */
contratacoesRouter.patch(
  "/:id/responder",
  validate(ResponderContratacaoSchema),
  async (req, res, next) => {
    try {
      const body = getValidated<z.infer<typeof ResponderContratacaoSchema>>(req);
      const { rows } = await query<ContratacaoDto>(
        `UPDATE contratacoes
         SET status = $2,
             preco_acordado = COALESCE($3, preco_acordado),
             respondido_em = now()
         WHERE id = $1 AND status = 'solicitada'
         RETURNING id, vaga_id, candidato_id, restaurante_id, preco_acordado, status,
                   solicitado_em::text, respondido_em::text,
                   nota_entrega, nota_pontualidade, attr_cancelamento`,
        [req.params.id, body.status, body.preco_acordado ?? null],
      );
      if (!rows[0]) {
        return res.status(404).json({
          error: "contratacao_nao_encontrada_ou_nao_pendente",
        });
      }
      res.json(rows[0]);
    } catch (err) {
      next(err);
    }
  },
);

/** Restaurante avalia após conclusão */
contratacoesRouter.patch(
  "/:id/avaliar",
  validate(AvaliarContratacaoSchema),
  async (req, res, next) => {
    try {
      const body = getValidated<z.infer<typeof AvaliarContratacaoSchema>>(req);
      const { rows } = await query<ContratacaoDto>(
        `UPDATE contratacoes
         SET status = 'concluida',
             nota_entrega = $2,
             nota_pontualidade = $3,
             attr_cancelamento = COALESCE($4, attr_cancelamento)
         WHERE id = $1 AND status = 'aceita'
         RETURNING id, vaga_id, candidato_id, restaurante_id, preco_acordado, status,
                   solicitado_em::text, respondido_em::text,
                   nota_entrega, nota_pontualidade, attr_cancelamento`,
        [
          req.params.id,
          body.nota_entrega,
          body.nota_pontualidade,
          body.attr_cancelamento ?? false,
        ],
      );
      if (!rows[0]) {
        return res.status(404).json({
          error: "contratacao_nao_encontrada_ou_nao_aceita",
        });
      }
      res.json(rows[0]);
    } catch (err) {
      next(err);
    }
  },
);
