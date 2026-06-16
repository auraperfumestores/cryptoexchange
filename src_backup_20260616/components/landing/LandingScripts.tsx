'use client';

import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useNavbarScroll } from '@/hooks/useNavbarScroll';

export default function LandingScripts() {
  useScrollAnimation();
  useNavbarScroll();
  return null;
}
