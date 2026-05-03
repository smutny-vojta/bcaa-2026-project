import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "";

if (!uri) {
  throw new Error("MONGODB_URI není nastavena.");
}

let client: MongoClient | null = null;

export function getMongoClient(): MongoClient {
  if (!client) {
    client = new MongoClient(uri);
  }
  return client;
}
