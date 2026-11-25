
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CirclePlay,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  const reduceMotion = useReducedMotion() ?? false;

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.08,
        delayChildren: reduceMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0 : 0.55,
        ease: EASE,
      },
    },
  };

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate flex min-h-[620px] items-center overflow-hidden bg-brand-dark sm:min-h-[680px] lg:min-h-[720px]"
    >
      {/* Full Background Wedding Image */}
      <Image
        src="/images/hero-wedding.jpg"
        alt="Beautiful romantic wedding celebration"
        fill
        priority
        quality={90}
        sizes="100vw"
        className="absolute inset-0 -z-20 object-cover object-center"
      />

      {/* Dark Overlay for Text Readability */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/55 to-black/20"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/40 via-transparent to-black/10"
      />

      {/* Hero Content */}
      <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <motion.div
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
          variants={containerVariants}
          className="max-w-3xl"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white shadow-sm backdrop-blur-md sm:px-4 sm:tracking-[0.2em]">
              <Sparkles
                className="size-3.5 shrink-0 text-brand-soft"
                aria-hidden="true"
              />
              YOUR DREAM WEDDING STARTS HERE
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            id="hero-heading"
            variants={itemVariants}
            className="mt-6 text-[2.05rem] font-semibold leading-[1.12] tracking-tight text-white sm:mt-7 sm:text-5xl sm:leading-[1.08] lg:text-[3.75rem] xl:text-[4.25rem]"
          >
            Plan Your{" "}
            <span className="block">
              <span className="text-brand-soft underline decoration-brand-soft/40 decoration-[0.12em] underline-offset-[0.15em]">
                Perfect Wedding
              </span>
              ,
            </span>{" "}
            Without the Stress.
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="mt-5 max-w-2xl text-pretty text-base leading-7 text-white/85 sm:mt-6 sm:text-lg sm:leading-8"
          >
            Discover trusted wedding professionals, beautiful venues, and
            everything you need to turn your dream wedding into an
            unforgettable celebration.
          </motion.p>

          {/* Buttons */}
          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Link
              href="/services"
              className={cn(
                buttonVariants(),
                "group h-12 w-full justify-center rounded-full border-transparent bg-brand px-6 text-sm font-semibold text-white shadow-lg shadow-black/20 transition-all hover:bg-brand-dark hover:shadow-xl focus-visible:ring-brand/30 sm:w-auto",
              )}
            >
              Explore Wedding Services
              <ArrowRight
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>

            <span
              aria-disabled="true"
              title="How It Works section coming soon"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-12 w-full cursor-default justify-center rounded-full border-white/50 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-md hover:border-white/50 hover:bg-white/10 hover:text-white sm:w-auto",
              )}
            >
              <CirclePlay className="size-4 text-brand-soft" aria-hidden="true" />
              Discover How It Works
              <span className="ml-0.5 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white">
                Soon
              </span>
            </span>
          </motion.div>

          {/* Trust Message */}
          <motion.p
            variants={itemVariants}
            className="mt-6 flex max-w-md items-start gap-2.5 text-sm leading-6 text-white/85"
          >
            <ShieldCheck
              className="mt-0.5 size-4 shrink-0 text-brand-soft"
              aria-hidden="true"
            />
            Find trusted wedding professionals for your special day.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
