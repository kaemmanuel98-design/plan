type ConfettiFn = (options?: Record<string, unknown>) => void;

let confettiLoader: Promise<ConfettiFn> | null = null;

function loadConfetti(): Promise<ConfettiFn> {
  if (!confettiLoader) {
    confettiLoader = import('canvas-confetti').then((m) => m.default as ConfettiFn);
  }
  return confettiLoader;
}

export async function celebrateMajorGoal(isShared: boolean = false): Promise<void> {
  const fire = await loadConfetti();
  const colors = isShared
    ? ['#ff375f', '#0a84ff', '#34c759', '#bf5af2']
    : ['#0a84ff', '#409cff', '#64b5ff'];

  fire({
    particleCount: 60,
    spread: 55,
    origin: { y: 0.7 },
    colors,
    ticks: 120,
    gravity: 0.8,
    scalar: 0.9,
    disableForReducedMotion: true,
  });

  setTimeout(() => {
    void loadConfetti().then((burst) => {
      burst({
        particleCount: 30,
        angle: 60,
        spread: 40,
        origin: { x: 0, y: 0.65 },
        colors,
        disableForReducedMotion: true,
      });
      burst({
        particleCount: 30,
        angle: 120,
        spread: 40,
        origin: { x: 1, y: 0.65 },
        colors,
        disableForReducedMotion: true,
      });
    });
  }, 200);
}
