
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
      tg.backgroundColor = '#050507';
      tg.headerColor = '#050507';
    }
    const saved = localStorage.getItem('oracle_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleStartReading = () => {
    if (!question.trim()) {
      tg?.HapticFeedback.notificationOccurred('error');
      return;
    }
    
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
      setInterpretation("Мистическая завеса не позволила получить ответ. Попробуйте еще раз.");
    } finally {
      setIsLoading(false);
      setView('result');
    }
  };

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="max-w-md mx-auto h-screen overflow-hidden relative flex flex-col">
      <BackgroundEffects />

      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div 
            key="home"
            {...pageVariants}
            className="flex-grow flex flex-col items-center justify-center px-8 text-center pt-10"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="mb-12"
            >
              <h1 className="text-4xl font-bold font-mystic text-amber-500 gold-text-glow leading-tight">Оракул<br/>Полной Луны</h1>
              <p className="text-amber-200/40 mt-3 tracking-[0.3em] uppercase text-[10px]">Шепот подсознания</p>
            </motion.div>

            <div className="w-full space-y-6">
              <motion.div 
                whileFocus={{ scale: 1.02 }}
                className="glass-panel p-5 rounded-[2rem] border-amber-500/20"
              >
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ваш вопрос оракулу..."
                  className="w-full bg-transparent border-none text-gray-200 text-lg placeholder-gray-600 focus:outline-none h-20 resize-none font-light italic text-center"
                />
              </motion.div>

              <div className="flex gap-3 px-4">
                {[SpreadType.SINGLE, SpreadType.THREE_CARD].map(type => (
                  <motion.button
                    key={type}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedSpread(type)}
                    className={`flex-1 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border ${selectedSpread === type ? 'bg-amber-600/20 border-amber-500 text-amber-400' : 'bg-white/5 border-white/10 text-gray-500'}`}
                  >
                    {type === SpreadType.SINGLE ? 'Карта дня' : 'Три тайны'}
                  </motion.button>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartReading}
                className="w-full bg-gradient-to-b from-amber-500 to-amber-700 py-5 rounded-[2rem] font-mystic text-lg text-black font-bold shadow-[0_0_25px_rgba(180,83,9,0.3)] transition-all"
              >
                Вскрыть Тайну
              </motion.button>

              {history.length > 0 && (
                <button 
                  onClick={() => setView('history')}
                  className="text-amber-500/40 text-[10px] uppercase tracking-[0.2em] hover:text-amber-500/80 transition-colors pt-4"
                >
                  Листать Прошлое
                </button>
              )}
            </div>
          </motion.div>
        )}

        {view === 'reading' && (
          <motion.div 
            key="reading"
            {...pageVariants}
            className="flex-grow flex flex-col items-center justify-center py-12 px-4"
          >
            <h2 className="text-2xl font-mystic text-amber-500 mb-2 gold-text-glow">Лунный Расклад</h2>
            <p className="text-gray-500 text-[10px] mb-12 uppercase tracking-widest">Проявите скрытое прикосновением</p>

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
                  className="w-full max-w-xs py-5 rounded-[2rem] font-mystic text-lg text-white bg-amber-900/30 border border-amber-500/50 shadow-lg gold-glow"
                >
                  {isLoading ? 'Слушаю шепот Луны...' : 'Услышать Оракул'}
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
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => setView('home')} className="text-amber-500 text-[10px] uppercase tracking-widest">Назад</button>
              <span className="font-mystic text-amber-500 uppercase tracking-widest text-xs">Видение получено</span>
              <div className="w-8"></div>
            </div>

            <div className="flex justify-center gap-3 mb-6">
              {drawnCards.map((card, idx) => (
                <div 
                  key={idx} 
                  className={`transition-all duration-300 ${drawnCards.length > 1 ? 'w-24 h-40' : 'w-40 h-64'} ${selectedCardDetail?.id === card.id ? 'scale-110 shadow-amber-500/20' : ''}`}
                  onClick={() => setSelectedCardDetail(card)}
                >
                  <TarotCardView card={card} isRevealed={true} className="w-full h-full" />
                </div>
              ))}
            </div>

            <div className="glass-panel p-6 rounded-[2rem] flex-grow overflow-y-auto custom-scroll mb-6">
              <AnimatePresence mode="wait">
                {selectedCardDetail ? (
                  <motion.div
                    key="card-detail"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-mystic text-amber-500 text-lg">{selectedCardDetail.name}</h4>
                      <button onClick={() => setSelectedCardDetail(null)} className="text-[10px] text-amber-500/50 uppercase">Закрыть</button>
                    </div>
                    <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10">
                      <p className="text-xs text-amber-200/80 leading-relaxed italic mb-3">
                        {selectedCardDetail.description}
                      </p>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">
                        Суть: <span className="text-amber-400 capitalize">{selectedCardDetail.meaning}</span>
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="interpretation"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <p className="text-amber-400 font-mystic text-sm mb-4 text-center italic opacity-80">"{question}"</p>
                    <div className="space-y-4">
                      {interpretation.split('\n').filter(p => p.trim()).map((para, i) => (
                        <motion.p 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * i }}
                          key={i} 
                          className="text-gray-300 text-sm leading-relaxed"
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
              className="w-full bg-white/5 border border-white/10 py-4 rounded-2xl font-mystic text-amber-500 text-sm uppercase tracking-widest"
            >
              Новый Запрос
            </motion.button>
          </motion.div>
        )}

        {view === 'history' && (
          <motion.div 
            key="history"
            {...pageVariants}
            className="h-full flex flex-col pt-12 pb-8 px-6"
          >
            <div className="flex justify-between items-center mb-8">
              <button onClick={() => setView('home')} className="text-amber-500 text-[10px] uppercase tracking-widest">Назад</button>
              <h2 className="font-mystic text-amber-500 uppercase tracking-widest text-lg">Хроники Луны</h2>
              <div className="w-8"></div>
            </div>

            <div className="space-y-4 overflow-y-auto custom-scroll flex-grow">
              {history.map((item, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
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
                  className="glass-panel p-5 rounded-[1.5rem] hover:bg-amber-900/10 border-amber-500/5 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] text-amber-500/40 font-bold">{new Date(item.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs font-medium text-gray-300 line-clamp-1 mb-2">"{item.question}"</p>
                  <div className="flex gap-1 flex-wrap">
                    {item.cards.map((c, i) => (
                      <div key={i} className="text-[8px] px-2 py-0.5 bg-amber-500/5 text-amber-500/60 rounded-full border border-amber-500/10 uppercase tracking-tighter">{c.name}</div>
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
  <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#050507]">
    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full"></div>
    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-900/5 blur-[120px] rounded-full"></div>
    
    {[...Array(50)].map((_, i) => (
      <motion.div 
        key={i} 
        initial={{ opacity: Math.random() }}
        animate={{ 
          opacity: [0.1, 0.6, 0.1],
        }}
        transition={{
          duration: Math.random() * 4 + 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: Math.random() * 5
        }}
        className="absolute bg-blue-100/30 rounded-full"
        style={{
          width: Math.random() * 1.5 + 'px',
          height: Math.random() * 1.5 + 'px',
          top: Math.random() * 100 + '%',
          left: Math.random() * 100 + '%',
        }}
      />
    ))}
  </div>
);

export default App;
