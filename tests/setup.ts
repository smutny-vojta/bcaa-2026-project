const DEFAULT_TEST_DB = "bcaa_test";
const workerId = process.env.VITEST_WORKER_ID ?? "0";

const baseDbName = process.env.MONGODB_DB ?? DEFAULT_TEST_DB;

if (!/test/i.test(baseDbName)) {
  throw new Error(
    `MONGODB_DB must be a test database. Received: ${baseDbName}`,
  );
}

process.env.MONGODB_DB = `${baseDbName}_${workerId}`;
