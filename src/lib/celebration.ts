import confetti from 'canvas-confetti';

export function celebrateMajorGoal(isShared: boolean = false): void {
  const colors = isShared
    ? ['#ff375f', '#0a84ff', '#34c759', '#bf5af2']
    : ['#0a84ff', '#409cff', '#64b5ff'];

  confetti({
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
    confetti({
      particleCount: 30,
      angle: 60,
      spread: 40,
      origin: { x: 0, y: 0.65 },
      colors,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 30,
      angle: 120,
      spread: 40,
      origin: { x: 1, y: 0.65 },
      colors,
      disableForReducedMotion: true,
    });
  }, 200);
}
