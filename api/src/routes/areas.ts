import { Router } from "express";
import { query } from "../db.js";
import type { AreaDto } from "../types/dto.js";

export const areasRouter = Router();

areasRouter.get("/", async (_req, res, next) => {
  try {
    const { rows } = await query<AreaDto>(
      `SELECT id, nome FROM areas ORDER BY nome`,
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});
