"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Route } from "../types";
import IconResolver from "@/shared/components/icon-resolver";
import { Button } from "@/shared/components/ui/button";
import RouteArchiveButton from "@/features/routes/components/route-archive-button";
import UpdateRoute from "@/features/routes/components/update-route";

export default function RouteCard({
  id,
  archivedAt,
  carrier,
  route,
  stops,
  type,
  createdAt,
  updatedAt,
}: Route) {
  return (
    <div key={id} className="w-full h-fit min-w-xs *:p-3 flex">
      <div
        className={`p-3 rounded-l ${archivedAt ? "bg-foreground" : "bg-primary"}`}
      >
        <IconResolver type={type} size={20} />
      </div>
      <div className="w-full flex flex-col gap-3 rounded-r bg-white-light">
        <div className="flex justify-between">
          <div>
            <p className="font-bold text-lg">{route}</p>
            <p className="text-gray-light text-sm/3.5 font-medium">
              {stops[0]?.stop} - {stops[stops.length - 1]?.stop}
            </p>
          </div>
          {archivedAt ? (
            <Badge variant="outline" className="border-white-dark">
              Archivováno
            </Badge>
          ) : (
            <div className="flex gap-x-2">
              <UpdateRoute
                route={{
                  id,
                  archivedAt,
                  carrier,
                  route,
                  stops,
                  type,
                  createdAt,
                  updatedAt,
                }}
              />
              <RouteArchiveButton routeId={id} />
            </div>
          )}
        </div>
        <div className="grid grid-cols-[max-content_1fr] gap-x-2 gap-y-1">
          <span className="text-gray-light text-sm/6 font-medium">
            Dopravce:
          </span>
          <span>{carrier}</span>
          <span className="text-gray-light text-sm/6 font-medium">
            Zastávky:
          </span>
          <span className="text-base/snug">
            {stops.map((stop, index) => (
              <span key={index}>
                {stop.stop}
                {index < stops.length - 1 && " - "}
              </span>
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}
