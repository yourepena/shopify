import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";

/** An error that carries the HTTP status the client should see. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export const notFound: RequestHandler = (req, _res) => {
  throw new HttpError(404, `No route for ${req.method} ${req.path}`);
};

/**
 * Single place that turns any thrown value into a JSON error response.
 * Express 5 forwards rejected promises from async handlers here automatically.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, details: err.details });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
};
