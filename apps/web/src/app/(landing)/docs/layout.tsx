import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "ClauBoard documentation: features, architecture, configuration, plugins, security, and getting started guide for the open-source AI agent dashboard.",
  alternates: { canonical: "/docs" },
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://clauboard.dev" },
    { "@type": "ListItem", position: 2, name: "Documentation", item: "https://clauboard.dev/docs" },
  ],
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {children}
    </>
  );
}
