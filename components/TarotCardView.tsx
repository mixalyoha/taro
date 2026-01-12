
import React from 'react';
import { motion } from 'framer-motion';
import { TarotCard } from '../types';

interface TarotCardViewProps {
  card?: TarotCard;
  isRevealed: boolean;
  onReveal?: () => void;
  className?: string;
  delay?: number;
  showDetails?: boolean;
}

const TarotCardView: React.FC<TarotCardViewProps> = ({ card, isRevealed, onReveal, className = "", delay = 0, showDetails = false }) => {
  return (
    <motion.div
      initial={{ y: 60, opacity: 0, scale: 0.85, rotateX: 10 }}
      animate={{ y: 0, opacity: 1, scale: 1, rotateX: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 120, 
        damping: 25,
        delay: delay 
      }}
      whileHover={!isRevealed ? { 
        scale: 1.08, 
        y: -5,
        transition: { duration: 0.4, ease: "easeOut" }
      } : {}}
      whileTap={{ scale: 0.95 }}
      onClick={!isRevealed ? onReveal : undefined}
      className={`relative w-40 h-64 cursor-pointer perspective-2000 ${className}`}
      style={{ zIndex: isRevealed ? 50 : 1 }}
    >
      <motion.div
        animate={{ 
          rotateY: isRevealed ? 180 : 0,
          rotateZ: isRevealed ? [0, -3, 3, 0] : 0,
          scale: isRevealed ? [1, 1.1, 1] : 1,
          z: isRevealed ? 100 : 0
        }}
        transition={{ 
          rotateY: { type: "spring", stiffness: 80, damping: 15 },
          rotateZ: { duration: 0.6, times: [0, 0.2, 0.5, 1], ease: "easeInOut" },
          scale: { duration: 0.5 },
          z: { duration: 0.5 }
        }}
        className="w-full h-full relative preserve-3d"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Card Back (Рубашка) */}
        <div 
          className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.6)] border-[1.5px] border-violet-500/30 bg-[#0d041a] flex items-center justify-center backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="absolute inset-2 border border-violet-400/10 rounded-xl"></div>
          
          <motion.div 
            animate={{ 
              rotate: [0, 360],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute w-36 h-36 rounded-full border border-violet-500/10 flex items-center justify-center"
          >
             <div className="w-28 h-28 rounded-full border border-indigo-500/5"></div>
          </motion.div>

          <div className="relative z-10 text-violet-400/30 text-4xl select-none filter blur-[0.2px] font-mystic">✵</div>
          
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-violet-600/20 via-transparent to-transparent"></div>
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
        </div>

        {/* Card Front (Лицо) */}
        <div 
          className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] border-[1.5px] border-violet-400/40 bg-[#0a0515] flex flex-col backface-hidden rotate-y-180"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {card && (
            <>
              <div className="h-[70%] overflow-hidden relative">
                <motion.img 
                  initial={{ scale: 1.2, filter: 'grayscale(0.5) brightness(0.4)' }}
                  animate={isRevealed ? { 
                    scale: 1, 
                    filter: 'grayscale(0) brightness(1)',
                    transition: { delay: 0.3, duration: 1.5, ease: "easeOut" }
                  } : {}}
                  src={card.image_url} 
                  alt={card.name} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0515] via-transparent to-transparent opacity-95"></div>
                <div className="absolute top-2 left-2 right-2 flex justify-between px-1">
                   <span className="text-violet-400/40 text-[9px] font-mystic">✧</span>
                   <span className="text-violet-400/40 text-[9px] font-mystic">✦</span>
                </div>
              </div>
              <div className="p-2 flex-grow flex flex-col justify-center items-center text-center bg-[#0a0515]">
                <h3 className="font-mystic text-[12px] text-violet-300 uppercase tracking-[0.2em] purple-text-glow">{card.name}</h3>
                <div className="h-[0.5px] w-12 bg-gradient-to-r from-transparent via-violet-500/50 to-transparent my-2"></div>
                <p className="text-[10px] text-indigo-200/60 leading-tight italic line-clamp-2 px-1 font-light">
                  {card.meaning}
                </p>
              </div>
              
              {isRevealed && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.3, 0] }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="absolute inset-0 pointer-events-none bg-gradient-to-b from-violet-500/5 to-transparent"
                />
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TarotCardView;
