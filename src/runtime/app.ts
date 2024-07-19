import { serve, type ServerType } from "@hono/node-server";
import { apiReference } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";

import auth from "~/controllers/auth.controllers";
import misc from "~/controllers/misc.controller";
import question from "~/controllers/question.controller";
import user from "~/controllers/user.controllers";
import { depsMiddleware, honoApp } from "./hono";

export const createApp = async (port: number): Promise<ServerType> => {
  const app = honoApp();
  app.use(depsMiddleware);
  app.use(
    cors({
      origin: ["http://localhost:5173"],
      credentials: true,
      allowHeaders: ["content-type"],
      exposeHeaders: ["content-type"],
    }),
  );
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
  app.route("/", auth);
  app.route("/", user);
  app.route("/", question);
  app.route("/", misc);

  const server = serve(app);
  return new Promise<ServerType>((res) => {
    server.listen(port, () => {
      console.log(`Server listening on port: ${port}`);
      res(server);
    });
  });
};
