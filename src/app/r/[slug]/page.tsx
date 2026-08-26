import { Reveal } from '@/components/Reveal';
import { getAllVols, getVol } from '@/lib/vols';

export function generateStaticParams() {
  return getAllVols().map((v) => ({ slug: v.slug }));
}

export const dynamicParams = false;

export default async function VolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vol = getVol(slug);
  if (!vol) return null;

  return <Reveal vol={vol} />;
}
