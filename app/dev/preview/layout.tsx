import { notFound } from "next/navigation";

/**
 * Phone-frame preview is for local development only (Cursor Simple Browser).
 * Hidden in production builds so it never ships as a public route.
 */
export default function DevPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return children;
}
