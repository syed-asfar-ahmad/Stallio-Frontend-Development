import { useEffect, useId, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import type { Container } from '@tsparticles/engine';
import { loadSlim } from '@tsparticles/slim';
import { motion, useAnimation, useReducedMotion } from 'motion/react';

import { cn } from '@/lib/utils';

type ParticlesProps = {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
};

export const SparklesCore = ({
  id,
  className,
  background,
  minSize,
  maxSize,
  speed,
  particleColor,
  particleDensity,
}: ParticlesProps) => {
  const reduce = useReducedMotion();
  const [init, setInit] = useState(false);
  const controls = useAnimation();
  const generatedId = useId();

  useEffect(() => {
    if (reduce) return;
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, [reduce]);

  const particlesLoaded = async (container?: Container) => {
    if (container) {
      controls.start({
        opacity: 1,
        transition: { duration: 1 },
      });
    }
  };

  if (reduce) return null;

  return (
    <motion.div animate={controls} className={cn('opacity-0', className)}>
      {init && (
        <Particles
          id={id || generatedId}
          className="h-full w-full"
          particlesLoaded={particlesLoaded}
          options={{
            background: {
              color: { value: background || '#0d47a1' },
            },
            fullScreen: { enable: false, zIndex: 1 },
            fpsLimit: 120,
            detectRetina: true,
            particles: {
              number: {
                value: particleDensity || 120,
                density: { enable: true, width: 400, height: 400 },
              },
              color: { value: particleColor || '#ffffff' },
              shape: { type: 'circle' },
              opacity: {
                value: { min: 0.1, max: 1 },
                animation: {
                  enable: true,
                  speed: speed || 4,
                  sync: false,
                  startValue: 'random',
                },
              },
              size: {
                value: { min: minSize || 1, max: maxSize || 3 },
              },
              move: {
                enable: true,
                speed: { min: 0.1, max: 1 },
                direction: 'none',
                outModes: { default: 'out' },
              },
            },
          }}
        />
      )}
    </motion.div>
  );
};
