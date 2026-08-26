import { Reveal } from '@/components/Reveal';
import { getAllVols, getVol } from '@/lib/vols';

export function generateStaticParams() {
  const vols = getAllVols();

  // Next reports an empty result as "missing generateStaticParams()", which
  // gives no hint about the actual cause. Fail with something actionable.
  if (vols.length === 0) {
    throw new Error(
      'data/vols.json is empty, so there is nobody to build pages for. ' +
        'Add at least one vol (npm run admin) before building.',
    );
  }

  return vols.map((v) => ({ slug: v.slug }));
}

export const dynamicParams = false;

export default async function VolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vol = getVol(slug);
  if (!vol) return null;

  return <Reveal vol={vol} />;
}
