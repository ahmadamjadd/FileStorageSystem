import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/AuthForm";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — Stash" },
      { name: "description", content: "Sign in to your Stash account to reach your files." },
      { property: "og:title", content: "Sign in — Stash" },
      {
        property: "og:description",
        content: "Sign in to your Stash account to reach your files.",
      },
    ],
  }),
  component: () => <AuthForm mode="login" />,
});
