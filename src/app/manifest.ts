import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TrackTrack: A public transportation delay tracker",
    short_name: "TrackTrack",
    description: "A simple webb app to track delays in public transportation.",
    start_url: "/",
    icons: [
      { src: "favicons/icon-192.png", type: "image/png", sizes: "192x192" },
      { src: "favicons/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    theme_color: "#ededed",
    background_color: "#0a0a0a",
    display: "standalone",
  };
}
