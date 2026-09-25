import { createFileRoute } from "@tanstack/react-router";
import { FileBrowser } from "@/components/FileBrowser";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "My Files — Stash" },
      {
        name: "description",
        content: "Stash is a calm, minimal place to keep your folders and files organised.",
      },
      { property: "og:title", content: "My Files — Stash" },
      {
        property: "og:description",
        content: "Stash is a calm, minimal place to keep your folders and files organised.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <RequireAuth>
      <FileBrowser folderId={null} />
    </RequireAuth>
  );
}
