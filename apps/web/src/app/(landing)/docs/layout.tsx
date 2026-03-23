import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "ClauBoard documentation: features, architecture, configuration, plugins, security, and getting started guide for the open-source AI agent dashboard.",
  alternates: { canonical: "/docs" },
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
