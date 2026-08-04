import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { getValidated, validate } from "../middleware/validate.js";
import {
  CreateRestauranteSchema,
  type RestauranteDto,
} from "../types/dto.js";

export const restaurantesRouter = Router();

restaurantesRouter.get("/", async (_req, res, next) => {
  try {
    const { rows } = await query<RestauranteDto>(
      `SELECT id, nome, cpf_cnpj, endereco, telefone, nivel_exigencia, ativo
       FROM restaurantes
       WHERE ativo
       ORDER BY nome`,
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

restaurantesRouter.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await query<RestauranteDto>(
      `SELECT id, nome, cpf_cnpj, endereco, telefone, nivel_exigencia, ativo
       FROM restaurantes
       WHERE id = $1`,
      [req.params.id],
    );
    if (!rows[0]) {
      return res.status(404).json({ error: "restaurante_nao_encontrado" });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

restaurantesRouter.post(
  "/",
  validate(CreateRestauranteSchema),
  async (req, res, next) => {
    try {
      const body = getValidated<z.infer<typeof CreateRestauranteSchema>>(req);
      const { rows } = await query<RestauranteDto>(
        `INSERT INTO restaurantes (nome, cpf_cnpj, endereco, telefone, nivel_exigencia)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, nome, cpf_cnpj, endereco, telefone, nivel_exigencia, ativo`,
        [
          body.nome,
          body.cpf_cnpj,
          body.endereco,
          body.telefone,
          body.nivel_exigencia ?? null,
        ],
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      next(err);
    }
  },
);
