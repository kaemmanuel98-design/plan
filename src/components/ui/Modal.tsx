import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'md' | 'lg' | 'xl';
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-[var(--aw-overlay)]"
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-[430px] glass-panel-elevated max-h-[92dvh] overflow-y-auto safe-bottom"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="sticky top-0 bg-aw-white z-10 px-5 pt-3 pb-4 border-b border-aw-line">
              <div className="w-10 h-1 bg-aw-line rounded-full mx-auto mb-4" />
              {title && (
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl pr-4">{title}</h2>
                  <button onClick={onClose} className="btn-ghost !min-w-[40px] !min-h-[40px]">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
