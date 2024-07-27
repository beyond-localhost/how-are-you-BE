import fs from "node:fs";
import openapiTS, { astToString } from "openapi-typescript";

export async function resolveOpenapiSchema(hostURL: string) {
  fs.writeFileSync("./schema.ts", astToString(await openapiTS(hostURL)));
}

resolveOpenapiSchema("http://localhost:7777/swagger");
