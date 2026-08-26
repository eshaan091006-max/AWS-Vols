import { Decoy } from '@/components/Decoy';

/**
 * A mistyped link lands here. Next's default reads "404: This page could not be
 * found", which looks broken and would make a vol think their link is dead.
 */
export default function NotFound() {
  return <Decoy line="that link doesn't look right. check with whoever sent it." />;
}
