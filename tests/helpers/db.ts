import {
  getDelayRecordsCollection,
  getRoutesCollection,
} from "@/lib/db/collections";

export async function resetDatabase(): Promise<void> {
  const routes = await getRoutesCollection();
  const delays = await getDelayRecordsCollection();
  await Promise.all([routes.deleteMany({}), delays.deleteMany({})]);
}
