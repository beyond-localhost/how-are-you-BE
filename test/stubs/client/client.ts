import type { paths } from "./schema.js";
/**
 * The frontend uses openapi-fetch as a type safety guard.
 */
import createOpenAPIFetchClient from "openapi-fetch";

export const createClient = (port: number) =>
  createOpenAPIFetchClient<paths>({
    baseUrl: `http://localhost:${port}`,
  });

export type OpenAPIClient = ReturnType<typeof createClient>;
