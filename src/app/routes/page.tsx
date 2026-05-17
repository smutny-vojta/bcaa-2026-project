import CreateRoute from "@/features/routes/components/create-route";
import { listRoutes } from "@/features/routes/actions/listRoutes";
import RoutesArchiveFilter from "@/features/routes/components/routes-archive-filter";
import RouteCard from "@/features/routes/components/route-card";
import { parseArchivedFilter } from "@/features/routes/utils/archivedFilter";
import { unwrapActionResult } from "@/lib/unwrapActionResult";
import PageTitleBar from "@/shared/components/page-title-bar";

export const dynamic = "force-dynamic";

type RoutesPageProps = {
  searchParams?: Promise<{ archived?: string }>;
};

export default async function Page({ searchParams }: RoutesPageProps) {
  const params = await searchParams;
  const archivedFilter = parseArchivedFilter(params?.archived);

  const routes = unwrapActionResult(
    await listRoutes({
      archivedAt: archivedFilter,
    }),
  );

  return (
    <>
      <PageTitleBar title="Routes" actionButton={<CreateRoute />} />
      <RoutesArchiveFilter archivedFilter={archivedFilter} />

      <div className="grid grid-cols-3 gap-4">
        {routes.map((route) => (
          <RouteCard key={route.id} {...route} />
        ))}
      </div>
    </>
  );
}
