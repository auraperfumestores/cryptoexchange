'use client';

import { useEffect } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useNavbarScroll } from '@/hooks/useNavbarScroll';

export default function LandingScripts() {
  useScrollAnimation();
  useNavbarScroll();

  useEffect(() => {
    const btns = document.querySelectorAll<HTMLButtonElement>('[data-mobile-toggle]');
    const menu = document.querySelector<HTMLElement>('[data-mobile-menu]');
    if (!btns.length || !menu) return;

    const toggle = () => menu.classList.toggle('is-open');
    const closeOnLink = (e: Event) => {
      if ((e.target as HTMLElement).closest('a')) menu.classList.remove('is-open');
    };

    btns.forEach(b => b.addEventListener('click', toggle));
    menu.addEventListener('click', closeOnLink);
    return () => {
      btns.forEach(b => b.removeEventListener('click', toggle));
      menu.removeEventListener('click', closeOnLink);
    };
  }, []);

  return null;
}
