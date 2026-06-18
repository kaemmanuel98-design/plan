import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { usePingStore } from '../../store/usePingStore';

const PARTNER_LABEL: Record<string, string> = {
  user_a: 'Monsieur',
  user_b: 'Madame',
};

export function EncourageButton() {
  const currentSpace = useStore((s) => s.currentSpace);
  const partnerActivity = usePingStore((s) => s.partnerActivity);
  const sendPing = usePingStore((s) => s.sendPing);
  const getPartnerSpace = usePingStore((s) => s.getPartnerSpace);
  const clearPartnerActivity = usePingStore((s) => s.clearPartnerActivity);

  const myPartner = getPartnerSpace(currentSpace);
  if (!myPartner || !partnerActivity) return null;
  if (partnerActivity.space !== myPartner) return null;

  const handleSend = () => {
    sendPing(currentSpace, myPartner, partnerActivity.taskTitle);
    clearPartnerActivity();
  };

  return (
    <motion.button
      type="button"
      className="encourage-fab"
      onClick={handleSend}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileTap={{ scale: 0.92 }}
      aria-label="Envoyer un encouragement"
    >
      <Heart className="w-5 h-5 fill-current" />
      <span className="text-[10px] font-medium mt-0.5">
        {PARTNER_LABEL[partnerActivity.space] ?? 'Partenaire'}
      </span>
    </motion.button>
  );
}
