import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { getValidated, validate } from "../middleware/validate.js";
import { AreaTipoSchema, type CargoDto } from "../types/dto.js";

export const cargosRouter = Router();

const ListCargosQuerySchema = z.object({
  area: AreaTipoSchema.optional(),
  ativo: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? true : v === "true")),
});

cargosRouter.get(
  "/",
  validate(ListCargosQuerySchema, "query"),
  async (req, res, next) => {
    try {
      const { area, ativo } = getValidated<
        z.infer<typeof ListCargosQuerySchema>
      >(req, "query");

      const clauses: string[] = [];
      const params: unknown[] = [];

      if (ativo) {
        clauses.push("ativo = true");
      }
      if (area) {
        params.push(area);
        clauses.push(`area_id = $${params.length}`);
      }

      const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
      const { rows } = await query<CargoDto>(
        `SELECT id, area_id, nome, nivel, ativo
         FROM cargos
         ${where}
         ORDER BY area_id, nivel, nome`,
        params,
      );
      res.json(rows);
    } catch (err) {
      next(err);
    }
  },
);
