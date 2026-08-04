import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

type Target = "body" | "query" | "params";
type ValidatedBag = Partial<Record<Target, unknown>>;

type RequestWithValidated = Request & { validated?: ValidatedBag };

export function validate<T>(schema: ZodType<T>, target: Target = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req[target]);
    if (!parsed.success) {
      return res.status(400).json({
        error: "validation_error",
        details: parsed.error.flatten(),
      });
    }
    const r = req as RequestWithValidated;
    r.validated = { ...r.validated, [target]: parsed.data };
    next();
  };
}

export function getValidated<T>(req: Request, target: Target = "body"): T {
  return (req as RequestWithValidated).validated?.[target] as T;
}
