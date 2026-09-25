import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/AuthForm";

export const Route = createFileRoute("/register")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Create account — Stash" },
      { name: "description", content: "Create a Stash account and start organising your files." },
      { property: "og:title", content: "Create account — Stash" },
      {
        property: "og:description",
        content: "Create a Stash account and start organising your files.",
      },
    ],
  }),
  component: () => <AuthForm mode="register" />,
});
