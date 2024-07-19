import type { paths } from "schema";
/**
 * The frontend uses openapi-fetch as a type safety guard.
 */
import createOpenAPIFetchClient from "openapi-fetch";

export const createClient = (host: string) =>
  createOpenAPIFetchClient<paths>({
    baseUrl: host,
  });

export type OpenAPIClient = ReturnType<typeof createClient>;
