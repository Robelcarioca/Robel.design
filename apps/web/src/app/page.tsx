import { getPublicWorks } from "@/lib/actions/works";
import { PortfolioView } from "@/components/public/portfolio-view";

export const revalidate = 60; // revalidate on interval or on-demand via revalidatePath

export default async function HomePage() {
  const works = await getPublicWorks();

  return <PortfolioView works={works} />;
}
