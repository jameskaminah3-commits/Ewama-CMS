import express, { type Express, type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { appendFile } from "node:fs/promises";
import { resolve } from "node:path";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Drizzle wraps the real Postgres error ("relation does not exist",
// ECONNREFUSED, auth failure, ...) in err.cause; log the whole chain.
function describeError(err: unknown): unknown {
  if (!(err instanceof Error)) return err;
  const out: Record<string, unknown> = { message: err.message, stack: err.stack };
  const code = (err as { code?: unknown }).code;
  if (code !== undefined) out["code"] = code;
  if (err.cause !== undefined) out["cause"] = describeError(err.cause);
  return out;
}

app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const error = describeError(err);
  logger.error({ err: error, method: req.method, url: req.originalUrl }, "Unhandled API request error");

  const entry = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}\n${JSON.stringify(error)}\n\n`;
  void appendFile(resolve(process.cwd(), "stderr.log"), entry, "utf8").catch(() => undefined);

  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
