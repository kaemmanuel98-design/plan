import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useToastStore } from '../../store/useToastStore';

export function AppToast() {
  const message = useToastStore((s) => s.message);
  const type = useToastStore((s) => s.type);
  const clear = useToastStore((s) => s.clear);

  useEffect(() => {
    if (!message) return;
    const id = window.setTimeout(clear, 8000);
    return () => window.clearTimeout(id);
  }, [message, clear]);

  if (!message) return null;

  const Icon = type === 'ok' ? CheckCircle2 : type === 'err' ? AlertCircle : Info;

  return (
    <div
      className="app-toast"
      role="alert"
      onClick={clear}
    >
      <Icon className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.5} />
      <p className="text-[12px] leading-relaxed flex-1">{message}</p>
    </div>
  );
}
