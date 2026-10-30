import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getPublicWorks } from "@/lib/actions/works";

type Props = {
  params: Promise<{ id: string }>;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://designrobel.com";

/** Resolve an OG image URL — handles both absolute (Supabase) and relative (/works/...) paths */
function resolveOgImage(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // Strip any leading slash so we can control the join
  return `${SITE_URL.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const works = await getPublicWorks();
  const work =
    works.find((w) => w.id === id) ||
    (id === "nike-dunk-low-retro-ui" ? works.find((w) => w.id === "nike-dunk-low-retro") : null);

  if (!work) {
    return {
      title: "Project not found — design robel",
    };
  }

  // Use the landscape mediaUrl (or dedicated posterUrl for videos) for optimal 1200x630 OG previews
  const ogImageUrl = work.posterUrl || work.mediaUrl;

  const resolvedOg = resolveOgImage(ogImageUrl);
  const title = `${work.title} — design robel`;
  const description = work.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${SITE_URL}/works/${id}`,
      images: [
        {
          url: resolvedOg,
          width: 1200,
          height: 630,
          alt: work.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [resolvedOg],
    },
  };
}

/**
 * /works/[id] — this page exists only to serve rich link previews (OG meta).
 * Once the metadata is scraped by social crawlers, we redirect the browser
 * back to the homepage (which opens the lightbox via the hash).
 */
export default async function WorkDetailPage({ params }: Props) {
  const { id } = await params;
  const works = await getPublicWorks();
  const work =
    works.find((w) => w.id === id) ||
    (id === "nike-dunk-low-retro-ui" ? works.find((w) => w.id === "nike-dunk-low-retro") : null);

  if (!work) notFound();

  // Redirect human visitors back to the portfolio with a hash anchor
  // so the lightbox can open for that project
  redirect(`/#work-${work.id}`);
}

