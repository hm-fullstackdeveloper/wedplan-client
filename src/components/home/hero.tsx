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
      className="relative overflow-hidden bg-page"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -right-32 -top-40 size-[34rem] rounded-full bg-brand-light/75 blur-3xl" />
        <div className="absolute -bottom-48 -left-32 size-[30rem] rounded-full bg-brand-soft/30 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-16 lg:px-8 lg:py-16 xl:py-20">
        <motion.div
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
          variants={containerVariants}
          className="max-w-xl"
        >
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/15 bg-surface/80 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-dark shadow-sm backdrop-blur-sm sm:px-4 sm:tracking-[0.2em]">
              <Sparkles className="size-3.5 shrink-0 text-brand" aria-hidden="true" />
              YOUR DREAM WEDDING STARTS HERE
            </span>
          </motion.div>

          <motion.h1
            id="hero-heading"
            variants={itemVariants}
            className="mt-6 text-[2.05rem] font-semibold leading-[1.12] tracking-tight text-text-primary sm:mt-7 sm:text-5xl sm:leading-[1.08] lg:text-[3.25rem] xl:text-[3.75rem]"
          >
            Plan Your{" "}
            <span className="block">
              <span className="text-brand underline decoration-brand/25 decoration-[0.12em] underline-offset-[0.15em]">
                Perfect Wedding
              </span>
              ,
            </span>{" "}
            Without the Stress.
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-5 max-w-lg text-pretty text-base leading-7 text-text-secondary sm:mt-6 sm:text-lg sm:leading-8"
          >
            Discover trusted wedding professionals, beautiful venues, and
            everything you need to turn your dream wedding into an
            unforgettable celebration.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Link
              href="/services"
              className={cn(
                buttonVariants(),
                "group h-12 w-full justify-center rounded-full border-transparent bg-brand px-6 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-all hover:bg-brand-dark hover:shadow-xl focus-visible:ring-brand/30 sm:w-auto",
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
                "h-12 w-full cursor-default justify-center rounded-full border-border-custom bg-surface/70 px-5 text-sm font-semibold text-text-primary backdrop-blur-sm hover:border-border-custom hover:bg-surface/70 hover:text-text-primary sm:w-auto",
              )}
            >
              <CirclePlay className="size-4 text-brand" aria-hidden="true" />
              Discover How It Works
              <span className="ml-0.5 rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-medium text-brand-dark">
                Soon
              </span>
            </span>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="mt-6 flex max-w-md items-start gap-2.5 text-sm leading-6 text-text-secondary"
          >
            <ShieldCheck
              className="mt-0.5 size-4 shrink-0 text-brand"
              aria-hidden="true"
            />
            Find trusted wedding professionals for your special day.
          </motion.p>
        </motion.div>

        <motion.div
          initial={
            reduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }
          }
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: reduceMotion ? 0 : 0.85,
            delay: reduceMotion ? 0 : 0.2,
            ease: EASE,
          }}
          className="relative mx-auto w-full max-w-md lg:ml-auto lg:max-w-[500px]"
        >
          <div
            aria-hidden="true"
            className="absolute -inset-3 rounded-[2.5rem] border border-brand/15 bg-brand-light/35"
          />

          <div className="relative rounded-[2rem] border border-white/70 bg-surface p-2 shadow-2xl shadow-brand-dark/15">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.6rem] bg-brand-light">
              <Image
                src="/images/hero-wedding.jpg"
                alt="Bride and groom holding a romantic wedding bouquet in warm evening light"
                fill
                preload
                quality={85}
                sizes="(min-width: 1024px) 500px, (min-width: 640px) 448px, calc(100vw - 32px)"
                className="object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-brand-dark/20 via-transparent to-transparent"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
