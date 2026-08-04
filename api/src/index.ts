import cors from "cors";
import express from "express";
import { areasRouter } from "./routes/areas.js";
import { cargosRouter } from "./routes/cargos.js";
import { candidatosRouter } from "./routes/candidatos.js";
import { contratacoesRouter } from "./routes/contratacoes.js";
import { restaurantesRouter } from "./routes/restaurantes.js";
import { vagasRouter } from "./routes/vagas.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/areas", areasRouter);
app.use("/cargos", cargosRouter);
app.use("/restaurantes", restaurantesRouter);
app.use("/candidatos", candidatosRouter);
app.use("/vagas", vagasRouter);
app.use("/contratacoes", contratacoesRouter);

app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);
    const pgErr = err as { code?: string; detail?: string; message?: string };
    if (pgErr.code === "23505") {
      return res.status(409).json({ error: "conflito", detail: pgErr.detail });
    }
    if (pgErr.code === "23503") {
      return res
        .status(400)
        .json({ error: "referencia_invalida", detail: pgErr.detail });
    }
    if (pgErr.code === "23514") {
      return res
        .status(400)
        .json({ error: "regra_violada", detail: pgErr.detail });
    }
    res.status(500).json({ error: "erro_interno" });
  },
);

app.listen(port, () => {
  console.log(`API Mazzei em http://localhost:${port}`);
});
