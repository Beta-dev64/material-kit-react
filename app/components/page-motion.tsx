'use client';

import { animate } from 'animejs';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function PageMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>('[data-reveal]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion || !('IntersectionObserver' in window)) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          observer.unobserve(entry.target);
          animate(entry.target, {
            opacity: [0, 1],
            translateY: ['18px', '0px'],
            duration: 680,
            ease: 'outCubic',
          });
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -36px 0px' },
    );

    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
