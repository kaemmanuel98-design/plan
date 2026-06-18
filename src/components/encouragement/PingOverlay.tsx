import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
import { usePingStore } from '../../store/usePingStore';
import type { SpaceType } from '../../types';

const FROM_LABEL: Record<SpaceType, string> = {
  user_a: 'Monsieur',
  user_b: 'Madame',
  shared: 'Couple',
};

export function PingOverlay() {
  const activeAnimation = usePingStore((s) => s.activeAnimation);
  const dismissAnimation = usePingStore((s) => s.dismissAnimation);

  return (
    <AnimatePresence>
      {activeAnimation && (
        <motion.div
          className="ping-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismissAnimation}
        >
          <motion.div
            className="ping-burst"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          >
            <div className="ping-orbit">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.span
                  key={i}
                  className="ping-particle"
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{
                    scale: [0, 1, 0.8],
                    x: Math.cos((i / 5) * Math.PI * 2) * 48,
                    y: Math.sin((i / 5) * Math.PI * 2) * 48,
                  }}
                  transition={{ duration: 0.9, delay: i * 0.06, ease: 'easeOut' }}
                >
                  <Heart className="w-4 h-4 fill-current" />
                </motion.span>
              ))}
            </div>
            <Sparkles className="w-8 h-8 text-aw-accent mx-auto mb-3" />
            <p className="font-display text-xl text-center">
              {FROM_LABEL[activeAnimation.fromSpace]} vous encourage
            </p>
            {activeAnimation.taskTitle && (
              <p className="text-[11px] text-aw-muted text-center mt-2 line-clamp-2">
                {activeAnimation.taskTitle}
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
