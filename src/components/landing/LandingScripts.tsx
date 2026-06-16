'use client';

import { useEffect } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useNavbarScroll } from '@/hooks/useNavbarScroll';

export default function LandingScripts() {
  useScrollAnimation();
  useNavbarScroll();

  useEffect(() => {
    const btn = document.querySelector('[data-mobile-toggle]') as HTMLButtonElement | null;
    const menu = document.querySelector('[data-mobile-menu]') as HTMLElement | null;
    if (!btn || !menu) return;

    const toggle = () => menu.classList.toggle('is-open');
    const closeOnLink = (e: Event) => {
      if ((e.target as HTMLElement).closest('a')) menu.classList.remove('is-open');
    };

    btn.addEventListener('click', toggle);
    menu.addEventListener('click', closeOnLink);
    return () => {
      btn.removeEventListener('click', toggle);
      menu.removeEventListener('click', closeOnLink);
    };
  }, []);

  return null;
}
