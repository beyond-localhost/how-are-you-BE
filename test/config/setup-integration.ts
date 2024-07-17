import Dockerode from "dockerode";
import getPort from "get-port";
import type { GlobalSetupContext } from "vitest/node";
import { TestDatabase } from "./const";

declare module "vitest" {
  export interface ProvidedContext {
    DB_PORT: number;
  }
}

//   /**
//    * MYSQL seems not to have a Postgresql 'Schema' like.
//    * The 'database' should be the closest one.
//    * When running parallel testing, each file should have its own database.
//    * We can make a name with timestamp + global id
//    */
//   const databaseName = `how-are-you-${Date.now()}-${globalId++}`;
// let globalId = 1;

export default async function setup({ provide }: GlobalSetupContext) {
  const docker = new Dockerode();
  const possiblePort = await getPort({ port: 3306 });

  const image = "mysql:9";
  const pullStream = await docker.pull(image);

  // wait for pull stream
  await new Promise((resolve, reject) =>
    docker.modem.followProgress(pullStream, (err) => (err ? reject(err) : resolve(err)), console.log),
  );

  const container = await docker.createContainer({
    Image: image,
    name: "how-are-you-be-test-rdb",
    Env: ["MYSQL_USER=test", "MYSQL_PASSWORD=test", "MYSQL_ROOT_PASSWORD=root"],
    HostConfig: {
      PortBindings: {
        "3306/tcp": [{ HostPort: `${possiblePort}` }],
      },
    },
  });
  await container.start();
  provide(TestDatabase.Port, possiblePort);

  return async function teardown() {
    try {
      await container.stop();
    } catch {}
    try {
      await container.remove();
    } catch {}
  };
}
