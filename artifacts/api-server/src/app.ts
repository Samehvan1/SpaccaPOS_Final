import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "@workspace/db";
import router from "./routes";
import { logger } from "./lib/logger";

const PostgresStore = connectPgSimple(session);

const app: Express = express();

// Serialize Date objects to ISO strings in all JSON responses
app.set("json replacer", (_key: string, value: unknown) => {
  if (value instanceof Date) return value.toISOString();
  return value;
});

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

// Tell Express it sits behind Replit's HTTPS proxy so req.secure is correct
// and the session cookie's Secure flag is applied properly.
app.set("trust proxy", 1);

app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    store: new PostgresStore({
      pool,
      tableName: "session",
    }),
    secret: process.env.SESSION_SECRET ?? "spacca-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Serve uploaded images (drink photos, etc.)
app.use("/uploads", express.static("uploads"));

app.use("/api", router);

export default app;
