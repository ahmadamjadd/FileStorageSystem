import { createFileRoute } from "@tanstack/react-router";
import { FileBrowser } from "@/components/FileBrowser";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/folder/$folderId")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Folder — Stash" },
      { name: "description", content: "Browse the files and subfolders inside this Stash folder." },
      { property: "og:title", content: "Folder — Stash" },
      {
        property: "og:description",
        content: "Browse the files and subfolders inside this Stash folder.",
      },
    ],
  }),
  component: FolderRoute,
});

function FolderRoute() {
  const { folderId } = Route.useParams();
  return (
    <RequireAuth>
      <FileBrowser folderId={folderId} />
    </RequireAuth>
  );
}
