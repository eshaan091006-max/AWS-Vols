import { Decoy } from '@/components/Decoy';

/**
 * The bare domain must reveal nothing: no vol list, no hint that per-vol pages
 * exist. Friendly rather than an error page, so a curious visitor just shrugs.
 */
export default function Home() {
  return <Decoy line="nothing to see here. yet." />;
}
