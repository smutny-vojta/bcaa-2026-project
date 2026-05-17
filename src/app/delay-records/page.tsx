import CreateDelayRecord from "@/features/delay-records/components/create-delay-record";
import DelayRecordCard from "@/features/delay-records/components/delay-record-card";
import { getRoutesCollection } from "@/lib/db/collections";
import { getDelayRecordsCollection } from "@/lib/db/collections";
import { serializeDelayRecords, serializeRoutes } from "@/lib/db/serialize";
import PageTitleBar from "@/shared/components/page-title-bar";
import { nowUtcIso } from "@/shared/utils/time";

export const dynamic = "force-dynamic";

export default async function Page() {
  const collection = await getDelayRecordsCollection();
  const routesCollection = await getRoutesCollection();
  const currentTime = nowUtcIso();

  await collection.updateMany(
    { state: "PLANNED", scheduled: { $lte: currentTime } },
    { $set: { state: "ONGOING", updatedAt: currentTime } },
  );

  const delayRecords = serializeDelayRecords(
    await collection.find({}).sort({ scheduled: -1 }).toArray(),
  );
  const routes = serializeRoutes(
    await routesCollection
      .find({ archivedAt: null })
      .sort({ route: 1 })
      .toArray(),
  );

  return (
    <>
      <PageTitleBar
        title="Delay Records"
        actionButton={<CreateDelayRecord routes={routes} />}
      />

      <div className="grid grid-cols-3 gap-4">
        {delayRecords.length > 0 ? (
          delayRecords.map((delayRecord) => (
            <DelayRecordCard key={delayRecord.id} delayRecord={delayRecord} />
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            Zatím zde nejsou žádné záznamy o zpoždění.
          </p>
        )}
      </div>
    </>
  );
}
