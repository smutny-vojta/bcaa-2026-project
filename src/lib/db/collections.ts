import type { Collection, Db } from "mongodb";
import { getMongoClient } from "@/lib/db/mongoClient";
import type { Route } from "@/features/routes/types";
import type { DelayRecord } from "@/features/delay-records/types";

const DB_NAME = process.env.MONGODB_DB ?? "bcaa";
const ROUTES_COLLECTION = "routes";
const DELAY_RECORDS_COLLECTION = "delay_records";

export async function getDb(): Promise<Db> {
  const client = getMongoClient();
  await client.connect();
  return client.db(DB_NAME);
}

export async function getRoutesCollection(): Promise<Collection<Route>> {
  const db = await getDb();
  return db.collection<Route>(ROUTES_COLLECTION);
}

export async function getDelayRecordsCollection(): Promise<
  Collection<DelayRecord>
> {
  const db = await getDb();
  return db.collection<DelayRecord>(DELAY_RECORDS_COLLECTION);
}
