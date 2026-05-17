"use client";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/shared/components/ui/navigation-menu";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

// REF: https://ui.shadcn.com/docs/components/radix/navigation-menu

const navigationItems: { title: string; href: string }[] = [
  {
    title: "Zpoždění linek",
    href: "/delay-records",
  },
  {
    title: "Linky",
    href: "/routes?archived=false",
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = navigationItems.find((item) =>
    isNavigationItemActive(item.href, pathname, searchParams),
  );

  return (
    <NavigationMenu className="bg-primary max-w-none h-12 md:h-16 min-w-screen flex-none">
      <div className="container flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="TrackTrack"
            width={32}
            height={32}
            loading="eager"
          />
          <span className="font-bold text-lg text-background">TrackTrack</span>
        </Link>
        <NavigationMenuList className="gap-2">
          {navigationItems.map((item) => (
            <NavigationMenuItem key={item.href}>
              <ListItem
                title={item.title}
                href={item.href}
                active={active === item}
              />
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </div>
    </NavigationMenu>
  );
}

function ListItem({
  title,
  href,
  active = false,
}: React.ComponentPropsWithoutRef<"li"> & { href: string; active: boolean }) {
  return (
    <NavigationMenuLink asChild className="hover:text-foreground">
      <Link
        href={href}
        className={`leading-none bg-transparent ${active ? "text-background font-bold" : "text-white-light"}`}
      >
        {title}
      </Link>
    </NavigationMenuLink>
  );
}

function isNavigationItemActive(
  href: string,
  pathname: string,
  searchParams: ReturnType<typeof useSearchParams>,
) {
  const [itemPathname, itemSearch = ""] = href.split("?");

  if (pathname !== itemPathname) {
    return false;
  }

  if (!itemSearch) {
    return searchParams.size === 0;
  }

  const itemParams = new URLSearchParams(itemSearch);

  for (const [key, value] of itemParams.entries()) {
    if (searchParams.get(key) !== value) {
      return false;
    }
  }

  return true;
}
