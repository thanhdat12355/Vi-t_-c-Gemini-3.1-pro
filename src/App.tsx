import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Copy, Trash2, Loader2, Check, BookOpen } from 'lucide-react';
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
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans flex flex-col">
      <header className="bg-white border-b border-stone-200 py-4 px-6 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              T
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-stone-800">
              Viet-German Translator
            </h1>
          </div>
          <div className="text-sm text-stone-500 font-medium">
            Powered by Gemini
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* Language Switcher Bar */}
        <div className="flex items-center justify-between bg-white rounded-2xl p-2 shadow-sm border border-stone-200">
          <div className="flex-1 text-center font-medium text-stone-700 py-2">
            {getLangLabel(sourceLang)}
          </div>
          
          <button 
            onClick={swapLanguages}
            className="p-3 rounded-full hover:bg-stone-100 transition-colors text-stone-500 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="Swap languages"
          >
            <ArrowRightLeft className="w-5 h-5" />
          </button>
          
          <div className="flex-1 text-center font-medium text-stone-700 py-2">
            {getLangLabel(targetLang)}
          </div>
        </div>

        {/* Translation Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 min-h-[300px]">
          
          {/* Source Area */}
          <div className="flex flex-col bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
            <div className="flex-1 relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Nhập văn bản... / Text eingeben...`}
                className="w-full h-full min-h-[200px] p-6 resize-none outline-none text-lg text-stone-800 placeholder:text-stone-400 bg-transparent"
                spellCheck={false}
              />
              {inputText && (
                <button
                  onClick={clearText}
                  className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
                  aria-label="Clear text"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="px-4 py-3 border-t border-stone-100 flex justify-between items-center bg-stone-50/50">
              <div className="text-xs text-stone-400 font-mono">
                {inputText.length} chars
              </div>
              <button
                onClick={() => handleCopy(inputText, true)}
                disabled={!inputText}
                className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
              >
                {copiedSource ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copiedSource ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Target Area */}
          <div className="flex flex-col bg-stone-50 rounded-2xl shadow-sm border border-stone-200 overflow-hidden relative">
            <div className="flex-1 p-6 relative">
              {error ? (
                <div className="text-red-500 bg-red-50 p-4 rounded-xl text-sm border border-red-100">
                  {error}
                </div>
              ) : (
                <div className="text-lg text-stone-800 whitespace-pre-wrap break-words">
                  {translation || (
                    <span className="text-stone-400 italic">
                      {isTranslating ? 'Translating...' : 'Bản dịch sẽ xuất hiện ở đây... / Übersetzung erscheint hier...'}
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
                    className="absolute top-6 right-6"
                  >
                    <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="px-4 py-3 border-t border-stone-200 flex justify-end items-center bg-stone-100/50">
              <button
                onClick={() => handleCopy(translation, false)}
                disabled={!translation}
                className="p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
              >
                {copiedTarget ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copiedTarget ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Explanation Area */}
        <AnimatePresence>
          {explanation && !error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6"
            >
              <h3 className="text-sm font-semibold text-stone-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                Giải thích & Ngữ cảnh
              </h3>
              <div className="text-stone-600 leading-relaxed text-[15px] whitespace-pre-wrap">
                {explanation}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
