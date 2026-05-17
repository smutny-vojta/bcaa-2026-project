import { unwrapActionResult } from "@/lib/unwrapActionResult";
import PageTitleBar from "@/shared/components/page-title-bar";

import { getDelayRecord } from "@/features/delay-records/actions/getDelayRecord";
import UpdateDelayRecord from "@/features/delay-records/components/update-delay-record";
import DeleteDelayRecord from "@/features/delay-records/components/delete-delay-record";
import { Badge } from "@/shared/components/ui/badge";
import { formatDate } from "@/shared/utils/date";
import { formatTime } from "@/shared/utils/time";
import Link from "next/link";
import { LucideArrowLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import IconResolver from "@/shared/components/icon-resolver";
import { getRoute } from "@/features/routes/actions/getRoute";
import { Card, CardContent } from "@/shared/components/ui/card";
import { VehicleType } from "@/shared/constants/enums";
import DelayDetailTable from "../../../features/delay-records/components/delay-detail-table";
import { delayRecordStateLabels } from "@/features/delay-records/constants";
import { vehicleTypeLabels } from "@/features/routes/constants";

export const dynamic = "force-dynamic";

type DelayRecordDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: DelayRecordDetailPageProps) {
  const { id } = await params;
  const delayRecord = unwrapActionResult(await getDelayRecord(id));
  const route = unwrapActionResult(await getRoute(delayRecord.routeId));

  return (
    <>
      <div className="flex justify-between">
        <Button variant="outline" className="mb-4 bg-white-dark" asChild>
          <Link href="/delay-records" className="flex gap-x-2 items-center">
            <LucideArrowLeft /> Zpět
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <UpdateDelayRecord record={delayRecord} />
          <DeleteDelayRecord recordId={delayRecord.id} />
        </div>
      </div>

      <PageTitleBar
        icon={
          <IconResolver type={route.type} color="text-foreground" size={28} />
        }
        title={`${route.route}`}
        actionButton={
          <Badge variant="outline" className="border-white-dark">
            {delayRecordStateLabels[delayRecord.state]}
          </Badge>
        }
      />

      <Card className="bg-gray-dark">
        <CardContent className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div className="flex flex-col gap-y-0">
            <p className="text-white-light text-lg font-bold leading-5">
              Linka
            </p>
            <p className="col-start-2 text-sm leading-4 text-white-dark">
              {delayRecord.tripCode}
            </p>
          </div>
          <div className="flex flex-col gap-y-0">
            <p className="text-white-light text-lg font-bold leading-5">
              Dopravce
            </p>
            <p className="col-start-2 text-sm leading-4 text-white-dark">
              {route.carrier}
            </p>
          </div>
          <div className="flex flex-col gap-y-0">
            <p className="text-white-light text-lg font-bold leading-5">
              Datum
            </p>
            <p className="col-start-2 text-sm leading-4 text-white-dark">
              {delayRecord.scheduled
                ? formatDate(new Date(delayRecord.scheduled))
                : "—"}
            </p>
          </div>
          <div className="flex flex-col gap-y-0">
            <p className="text-white-light text-lg font-bold leading-5">
              Dopravní prostředek
            </p>
            <p className="col-start-2 text-sm leading-4 text-white-dark">
              {vehicleTypeLabels[route.type]}
            </p>
          </div>
        </CardContent>
      </Card>

      <DelayDetailTable delayRecord={delayRecord} />
    </>
  );
}
