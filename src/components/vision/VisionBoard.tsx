import { useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { readImageFile } from '../../lib/imageUpload';
import { useStore } from '../../store/useStore';
import type { Goal } from '../../types';

interface VisionBoardProps {
  vision: Goal;
  editable?: boolean;
}

export function VisionBoard({ vision, editable = false }: VisionBoardProps) {
  const updateGoal = useStore((s) => s.updateGoal);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageUrl = vision.inspirationImageUrl;

  const handleFile = async (file: File) => {
    const dataUrl = await readImageFile(file);
    if (dataUrl) updateGoal(vision.id, { inspirationImageUrl: dataUrl });
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateGoal(vision.id, { inspirationImageUrl: undefined });
  };

  return (
    <div className="vision-board">
      {imageUrl ? (
        <div className="relative h-36 w-full overflow-hidden">
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="vision-board-scrim" />
          {editable && (
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center"
              aria-label="Retirer l'image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : editable ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="vision-board-empty"
        >
          <ImagePlus className="w-5 h-5 text-aw-faint mb-2" strokeWidth={1.5} />
          <span className="text-[11px] text-aw-faint">Vision board</span>
        </button>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
