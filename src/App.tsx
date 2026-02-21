import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Copy, Trash2, Loader2, Check, BookOpen, Sparkles } from 'lucide-react';
import { translateText } from './services/geminiService';
import { motion, AnimatePresence } from 'motion/react';

type Language = 'Vietnamese' | 'German';

export default function App() {
  const [sourceLang, setSourceLang] = useState<Language>('Vietnamese');
  const [targetLang, setTargetLang] = useState<Language>('German');
  const [inputText, setInputText] = useState('');
  const [translation, setTranslation] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedSource, setCopiedSource] = useState(false);
  const [copiedTarget, setCopiedTarget] = useState(false);

  // Debounced translation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputText.trim()) {
        handleTranslate(inputText, sourceLang, targetLang);
      } else {
        setTranslation('');
        setExplanation('');
        setError(null);
      }
    }, 800); // 800ms debounce

    return () => clearTimeout(timer);
  }, [inputText, sourceLang, targetLang]);

  const handleTranslate = async (text: string, source: Language, target: Language) => {
    if (!text.trim()) return;
    
    setIsTranslating(true);
    setError(null);
    
    try {
      const result = await translateText(text, source, target);
      setTranslation(result.translation);
      setExplanation(result.explanation);
    } catch (err: any) {
      setError(err.message || 'An error occurred during translation.');
    } finally {
      setIsTranslating(false);
    }
  };

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(translation);
    setTranslation(inputText);
    setExplanation(''); // Clear explanation on swap as it might not match anymore
  };

  const handleCopy = async (text: string, isSource: boolean) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      if (isSource) {
        setCopiedSource(true);
        setTimeout(() => setCopiedSource(false), 2000);
      } else {
        setCopiedTarget(true);
        setTimeout(() => setCopiedTarget(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const clearText = () => {
    setInputText('');
    setTranslation('');
    setExplanation('');
    setError(null);
  };

  const getLangLabel = (lang: Language) => lang === 'Vietnamese' ? 'Tiếng Việt' : 'Deutsch';

  return (
    <div className="min-h-screen font-sans flex flex-col selection:bg-zinc-200">
      <header className="py-8 px-6 md:px-12 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-medium tracking-tight text-zinc-900">
              Việt - Đức
            </h1>
            <p className="text-xs text-zinc-500 font-medium tracking-wide uppercase mt-0.5">
              Gemini 3.1 Pro
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 md:px-12 pb-20 flex flex-col gap-8">
        
        {/* Main Translation Card */}
        <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 overflow-hidden flex flex-col">
          
          {/* Language Switcher Bar */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
            <div className="text-center text-sm font-semibold text-zinc-500 uppercase tracking-widest">
              {getLangLabel(sourceLang)}
            </div>
            
            <button 
              onClick={swapLanguages}
              className="p-3 rounded-full hover:bg-zinc-200/50 transition-colors text-zinc-400 hover:text-zinc-700 focus:outline-none"
              aria-label="Swap languages"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
            
            <div className="text-center text-sm font-semibold text-zinc-500 uppercase tracking-widest">
              {getLangLabel(targetLang)}
            </div>
          </div>

          {/* Translation Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-100 min-h-[400px]">
            
            {/* Source Area */}
            <div className="p-8 md:p-10 flex flex-col relative group">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Nhập văn bản... / Text eingeben..."
                className="w-full flex-1 resize-none outline-none text-2xl md:text-3xl font-serif leading-relaxed text-zinc-800 placeholder:text-zinc-300 bg-transparent"
                spellCheck={false}
              />
              
              <div className="mt-6 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="text-xs text-zinc-400 font-mono tracking-wider">
                  {inputText.length} CHARS
                </div>
                <div className="flex items-center gap-2">
                  {inputText && (
                    <button
                      onClick={clearText}
                      className="p-2.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-full transition-colors"
                      aria-label="Clear text"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleCopy(inputText, true)}
                    disabled={!inputText}
                    className="p-2.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {copiedSource ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Target Area */}
            <div className="p-8 md:p-10 flex flex-col relative bg-zinc-50/30 group">
              <div className="flex-1 relative">
                {error ? (
                  <div className="text-red-500 text-lg font-serif">
                    {error}
                  </div>
                ) : (
                  <div className="text-2xl md:text-3xl font-serif leading-relaxed text-zinc-800 whitespace-pre-wrap break-words">
                    {translation || (
                      <span className="text-zinc-300">
                        {isTranslating ? 'Đang dịch... / Übersetze...' : 'Bản dịch... / Übersetzung...'}
                      </span>
                    )}
                  </div>
                )}

                <AnimatePresence>
                  {isTranslating && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute -top-2 -right-2"
                    >
                      <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="mt-6 flex justify-end items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => handleCopy(translation, false)}
                  disabled={!translation}
                  className="p-2.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {copiedTarget ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Explanation Area */}
        <AnimatePresence>
          {explanation && !error && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 p-8 md:p-10"
            >
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-zinc-300" />
                Ngữ cảnh & Giải thích
              </h3>
              <div className="font-serif text-lg md:text-xl text-zinc-700 leading-relaxed whitespace-pre-wrap">
                {explanation}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
