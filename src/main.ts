import { resolveEnv } from "./env";
import { apiReference } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import auth from "./controllers/auth.controllers";
import misc from "./controllers/misc.controller";
import question from "./controllers/question.controller";
import user from "./controllers/user.controllers";
import { depsMiddleware, honoApp } from "./runtime/hono";
import { serve } from "@hono/node-server";

const env = resolveEnv();

const app = honoApp();
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    allowHeaders: ["content-type"],
    exposeHeaders: ["content-type"],
  }),
);
app.use(depsMiddleware);
app.route("/", auth);
app.route("/", user);
app.route("/", question);
app.route("/", misc);
app.get(
  "/docs",
  apiReference({
    spec: {
      url: "/swagger",
    },
  }),
);
app.doc("/swagger", {
  openapi: "3.1.0",
  info: { title: "How are you - API", version: "1.0.0" },
  tags: [
    { name: "Auth", description: "Authentication related API" },
    { name: "User", description: "User related API" },
    { name: "Misc", description: "The miscellaneous data related API" },
    { name: "Question", description: "The question related API" },
  ],
});

serve({
  fetch: app.fetch,
  port: env.Server.Port,
});
