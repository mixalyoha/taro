
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ORACLE_FULL_MOON } from './constants';
import { TarotCard, SpreadType, ReadingHistoryItem } from './types';
import { interpretReading } from './services/gemini';
import TarotCardView from './components/TarotCardView';

const tg = (window as any).Telegram?.WebApp;

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'reading' | 'result' | 'history'>('home');
  const [question, setQuestion] = useState('');
  const [selectedSpread, setSelectedSpread] = useState<SpreadType>(SpreadType.SINGLE);
  const [drawnCards, setDrawnCards] = useState<TarotCard[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [interpretation, setInterpretation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);
  const [selectedCardDetail, setSelectedCardDetail] = useState<TarotCard | null>(null);

  useEffect(() => {
    if (tg) {
      tg.expand();
      tg.ready();
      tg.backgroundColor = '#030005';
      tg.headerColor = '#030005';
    }
    const saved = localStorage.getItem('oracle_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleStartReading = () => {
    let finalQuestion = question.trim();
    if (!finalQuestion) {
      if (selectedSpread === SpreadType.BOOMERANG) finalQuestion = "Что ждет моих врагов?";
      if (selectedSpread === SpreadType.EX_STATE) finalQuestion = "Что сейчас в жизни у моей бывшей?";
      if (selectedSpread === SpreadType.WEEKLY) finalQuestion = "Каков мой прогноз на ближайшую неделю?";
      if (selectedSpread === SpreadType.SINGLE) finalQuestion = "Послание Космоса на сегодня";
      if (selectedSpread === SpreadType.THREE_CARD) finalQuestion = "Три тайны моей судьбы";
    }
    
    setQuestion(finalQuestion);
    
    tg?.HapticFeedback.impactOccurred('medium');
    const cardCount = selectedSpread === SpreadType.SINGLE ? 1 : 3;
    const shuffled = [...ORACLE_FULL_MOON].sort(() => 0.5 - Math.random());
    setDrawnCards(shuffled.slice(0, cardCount));
    setRevealedCount(0);
    setInterpretation('');
    setSelectedCardDetail(null);
    setView('reading');
  };

  const handleReveal = (index: number) => {
    if (index === revealedCount) {
      tg?.HapticFeedback.impactOccurred('light');
      setRevealedCount(prev => prev + 1);
    }
  };

  const generateInterpretation = async () => {
    setIsLoading(true);
    tg?.HapticFeedback.selectionChanged();
    
    try {
      const result = await interpretReading(question, selectedSpread, drawnCards);
      setInterpretation(result);
      
      if (!result.includes("Ошибка")) {
        const newItem: ReadingHistoryItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          question,
          spreadType: selectedSpread,
          cards: drawnCards,
          interpretation: result
        };
        const updatedHistory = [newItem, ...history].slice(0, 15);
        setHistory(updatedHistory);
        localStorage.setItem('oracle_history', JSON.stringify(updatedHistory));
      }
    } catch (e) {
      setInterpretation("Космический туман скрыл ответ. Попробуйте настроиться еще раз.");
    } finally {
      setIsLoading(false);
      setView('result');
    }
  };

  const pageVariants = {
    initial: { opacity: 0, scale: 1.05 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  const spreads = [
    { type: SpreadType.SINGLE, label: 'Карта дня', icon: '❂' },
    { type: SpreadType.THREE_CARD, label: 'Три тайны', icon: '⚝' },
    { type: SpreadType.BOOMERANG, label: 'Бумеранг', icon: '⟳' },
    { type: SpreadType.EX_STATE, label: 'Бывшая', icon: '❦' },
    { type: SpreadType.WEEKLY, label: 'Неделя', icon: '☪' },
  ];

  return (
    <div className="max-w-md mx-auto h-screen overflow-hidden relative flex flex-col">
      <BackgroundEffects />

      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div 
            key="home"
            {...pageVariants}
            className="flex-grow flex flex-col items-center justify-center px-6 text-center pt-4"
          >
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-bold font-mystic text-violet-300 purple-text-glow leading-tight tracking-wider">Эфирный<br/>Оракул</h1>
              <p className="text-violet-400/50 mt-2 tracking-[0.4em] uppercase text-[9px] font-semibold">Голос Звездной Бездны</p>
            </motion.div>

            <div className="w-full space-y-4">
              <motion.div 
                className="glass-panel p-4 rounded-[1.5rem] border-violet-500/20"
              >
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Задайте вопрос вселенной..."
                  className="w-full bg-transparent border-none text-violet-100 text-base placeholder-violet-900/40 focus:outline-none h-16 resize-none font-light italic text-center"
                />
              </motion.div>

              <div className="grid grid-cols-2 gap-2.5 px-1">
                {spreads.map(spread => (
                  <motion.button
                    key={spread.type}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setSelectedSpread(spread.type)}
                    className={`flex flex-col items-center justify-center py-3 rounded-2xl border transition-all duration-300 ${selectedSpread === spread.type ? 'bg-violet-600/25 border-violet-400 text-violet-200 shadow-[0_0_15px_rgba(139,92,246,0.2)]' : 'bg-white/5 border-white/5 text-violet-900/60'}`}
                  >
                    <span className="text-xl mb-1">{spread.icon}</span>
                    <span className="text-[9px] font-bold uppercase tracking-[0.15em]">{spread.label}</span>
                  </motion.button>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartReading}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-700 py-4.5 rounded-[1.5rem] font-mystic text-lg text-white font-bold shadow-[0_4px_20px_rgba(109,40,217,0.4)] border-t border-violet-400/30"
              >
                Открыть Портал
              </motion.button>

              {history.length > 0 && (
                <button 
                  onClick={() => setView('history')}
                  className="text-violet-500/40 text-[9px] uppercase tracking-[0.3em] hover:text-violet-400 transition-colors pt-3"
                >
                  Шепот Прошлого
                </button>
              )}
            </div>
          </motion.div>
        )}

        {view === 'reading' && (
          <motion.div 
            key="reading"
            {...pageVariants}
            className="flex-grow flex flex-col items-center justify-center py-10 px-4"
          >
            <h2 className="text-2xl font-mystic text-violet-300 mb-2 purple-text-glow tracking-widest uppercase">{selectedSpread}</h2>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-violet-500/40 to-transparent mb-10"></div>

            <div className="flex flex-wrap justify-center gap-4 mb-16 h-72 items-center">
              {drawnCards.map((card, idx) => (
                <TarotCardView
                  key={idx}
                  card={card}
                  isRevealed={idx < revealedCount}
                  onReveal={() => handleReveal(idx)}
                  delay={idx * 0.2}
                />
              ))}
            </div>

            <AnimatePresence>
              {revealedCount === drawnCards.length && (
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generateInterpretation}
                  disabled={isLoading}
                  className="w-full max-w-xs py-5 rounded-[2rem] font-mystic text-lg text-white bg-violet-900/20 border border-violet-400/40 shadow-[0_0_30px_rgba(139,92,246,0.15)] silver-glow"
                >
                  {isLoading ? 'Плету нити судьбы...' : 'Прочитать Связку'}
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {view === 'result' && (
          <motion.div 
            key="result"
            {...pageVariants}
            className="h-full flex flex-col pt-12 pb-8 px-6 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-6 px-2">
              <button onClick={() => setView('home')} className="text-violet-400 text-[10px] uppercase tracking-widest font-bold">Назад</button>
              <span className="font-mystic text-violet-200 uppercase tracking-[0.2em] text-xs">Узор Явлен</span>
              <div className="w-8"></div>
            </div>

            <div className="relative flex justify-center gap-3 mb-8">
               {/* Энергетическая нить между картами */}
               {drawnCards.length > 1 && (
                 <motion.div 
                   initial={{ scaleX: 0 }}
                   animate={{ scaleX: 1 }}
                   transition={{ duration: 1.5, ease: "easeInOut" }}
                   className="absolute top-1/2 left-10 right-10 h-[1.5px] bg-gradient-to-r from-transparent via-violet-400/30 to-transparent z-0 pointer-events-none blur-[1px]"
                 />
               )}
               
              {drawnCards.map((card, idx) => (
                <div 
                  key={idx} 
                  className={`transition-all duration-500 ${drawnCards.length > 1 ? 'w-24 h-40' : 'w-44 h-72'} ${selectedCardDetail?.id === card.id ? 'scale-110 shadow-[0_0_20px_rgba(167,139,250,0.3)] z-10' : 'opacity-80'}`}
                  onClick={() => setSelectedCardDetail(card)}
                >
                  <TarotCardView card={card} isRevealed={true} className="w-full h-full" />
                </div>
              ))}
            </div>

            <div className="glass-panel p-6 rounded-[2.5rem] flex-grow overflow-y-auto custom-scroll mb-6 border-violet-400/10">
              <AnimatePresence mode="wait">
                {selectedCardDetail ? (
                  <motion.div
                    key="card-detail"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-mystic text-violet-300 text-lg uppercase tracking-wider">{selectedCardDetail.name}</h4>
                      <button onClick={() => setSelectedCardDetail(null)} className="text-[9px] text-violet-400/60 uppercase font-bold tracking-widest">✕ Закрыть</button>
                    </div>
                    <div className="bg-violet-900/10 p-5 rounded-2xl border border-violet-400/10 shadow-inner">
                      <p className="text-[13px] text-violet-100/80 leading-relaxed italic mb-4 font-light">
                        {selectedCardDetail.description}
                      </p>
                      <div className="h-px w-full bg-violet-400/5 mb-4"></div>
                      <p className="text-[10px] text-violet-400/50 font-bold uppercase tracking-[0.2em]">
                        Сущность: <span className="text-violet-200 capitalize ml-1">{selectedCardDetail.meaning}</span>
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="interpretation"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-5"
                  >
                    <p className="text-violet-300 font-mystic text-sm mb-6 text-center italic opacity-60 px-4">"{question}"</p>
                    <div className="space-y-4 px-1">
                      {interpretation.split('\n').filter(p => p.trim()).map((para, i) => (
                        <motion.p 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 * i }}
                          key={i} 
                          className="text-violet-100/90 text-[14px] leading-relaxed font-light"
                        >
                          {para.replace(/[*#]/g, '')}
                        </motion.p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setView('home')}
              className="w-full bg-violet-900/10 border border-violet-400/20 py-4.5 rounded-2xl font-mystic text-violet-300 text-[11px] uppercase tracking-[0.3em] silver-glow"
            >
              Новое Гадание
            </motion.button>
          </motion.div>
        )}

        {view === 'history' && (
          <motion.div 
            key="history"
            {...pageVariants}
            className="h-full flex flex-col pt-12 pb-8 px-6"
          >
            <div className="flex justify-between items-center mb-8 px-1">
              <button onClick={() => setView('home')} className="text-violet-400 text-[10px] uppercase tracking-widest font-bold">Назад</button>
              <h2 className="font-mystic text-violet-300 uppercase tracking-[0.15em] text-lg">Архив Светил</h2>
              <div className="w-8"></div>
            </div>

            <div className="space-y-4 overflow-y-auto custom-scroll flex-grow pb-4">
              {history.map((item, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={item.id} 
                  onClick={() => {
                    setQuestion(item.question);
                    setDrawnCards(item.cards);
                    setInterpretation(item.interpretation);
                    setSelectedSpread(item.spreadType);
                    setSelectedCardDetail(null);
                    setView('result');
                  }}
                  className="glass-panel p-5 rounded-[1.8rem] hover:bg-violet-900/20 border-violet-500/10 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[9px] text-violet-500/60 font-bold">{new Date(item.timestamp).toLocaleDateString()}</span>
                    <span className="text-[9px] text-violet-400/40 uppercase italic tracking-tighter group-hover:text-violet-400 transition-colors">{item.spreadType}</span>
                  </div>
                  <p className="text-[13px] font-medium text-violet-100/90 line-clamp-1 mb-3">"{item.question}"</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {item.cards.map((c, i) => (
                      <div key={i} className="text-[8px] px-2.5 py-1 bg-violet-600/10 text-violet-300/80 rounded-full border border-violet-400/10 uppercase tracking-widest font-semibold">{c.name}</div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const BackgroundEffects = () => (
  <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#030005]">
    <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[70%] bg-violet-900/15 blur-[140px] rounded-full"></div>
    <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[70%] bg-indigo-900/10 blur-[140px] rounded-full"></div>
    
    {[...Array(60)].map((_, i) => (
      <motion.div 
        key={i} 
        initial={{ opacity: Math.random(), scale: Math.random() }}
        animate={{ 
          opacity: [0.1, 0.7, 0.1],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: Math.random() * 5 + 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: Math.random() * 5
        }}
        className="absolute bg-white/40 rounded-full"
        style={{
          width: Math.random() * 1.8 + 'px',
          height: Math.random() * 1.8 + 'px',
          top: Math.random() * 100 + '%',
          left: Math.random() * 100 + '%',
        }}
      />
    ))}
  </div>
);

export default App;
