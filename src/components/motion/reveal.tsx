"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Scroll-triggered reveal. Respects prefers-reduced-motion: when reduced motion
 * is requested the content renders in its final, fully-visible state.
 *
 * SSR-safe: the first server and client render both output the final visible
 * state (no opacity:0). Animation is enabled only after mount, which avoids a
 * hydration mismatch and means content is never invisible if JS fails.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  as = "div",
  once = true,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span";
  once?: boolean;
}) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const Comp = motion[as];
  const animate = mounted && !reduced;

  if (!animate) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </Comp>
  );
}

export const revealItemVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
};

/**
 * Staggers direct children into view. Give each child a <RevealItem>.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
  delay = 0,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  as?: "div" | "ul" | "section";
}) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const Comp = motion[as];
  const animate = mounted && !reduced;

  if (!animate) {
    const Static = as;
    return (
      <Static className={className}>
        {/* Wrap children so RevealItem still renders its visible fallback */}
        {children}
      </Static>
    );
  }

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };

  return (
    <Comp
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </Comp>
  );
}

export function RevealItem({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const Comp = motion[as];
  const animate = mounted && !reduced;

  if (!animate) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Comp className={className} variants={revealItemVariants}>
      {children}
    </Comp>
  );
}

/**
 * Subtle parallax on decorative background layers only — never on text or
 * controls. Skipped entirely under reduced-motion or before mount.
 */
export function Parallax({
  children,
  className,
  distance = 12,
}: {
  children: React.ReactNode;
  className?: string;
  distance?: number;
}) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ y: -distance }}
      whileInView={{ y: distance }}
      viewport={{ once: false, margin: "100px" }}
      transition={{ ease: "linear", duration: 1.2 }}
      style={{ willChange: "transform" }}
    >
      {children}
    </motion.div>
  );
}