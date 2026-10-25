import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../../context/AIContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  X,
  Send,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export const RoboSirAssistant: React.FC = () => {
  const {
    isOpen,
    toggleOpen,
    messages,
    sendMessage,
    isThinking,
    clearHistory,
    speakText,
    isSpeaking
  } = useAI();
  const { currentUser } = useAuth();
  const [input, setInput] = useState('');
  const [ttsActive, setTtsActive] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;
    sendMessage(query);
    setInput('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none">
      {/* Floating Robo Sir Mascot Button */}
      {!isOpen && (
        <button
          onClick={toggleOpen}
          aria-label="Ask Robo Sir"
          className="group relative flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-500 hover:to-violet-600 text-white rounded-full shadow-2xl shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all duration-300 border border-indigo-400/30"
        >
          {/* Animated Glow Halo */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 opacity-60 blur-md group-hover:opacity-100 transition duration-500 animate-pulse"></div>

          <div className="relative flex items-center gap-2.5">
            {/* Mascot Avatar: Professor Owl */}
            <div className="w-11 h-11 rounded-full bg-slate-900 border-2 border-indigo-300/40 flex items-center justify-center shadow-inner overflow-hidden">
              <span className="text-2xl" role="img" aria-label="Robo Sir Owl">🦉</span>
            </div>
            <div className="text-left pr-2 hidden sm:block">
              <div className="text-xs font-bold flex items-center gap-1.5 text-indigo-100">
                <span>Robo Sir (AI)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
              <div className="text-[11px] text-indigo-200/80 font-medium">
                Ask Academic Questions 24/7
              </div>
            </div>
          </div>
        </button>
      )}

      {/* Robo Sir Interactive Chat Modal Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[580px] max-h-[85vh] bg-slate-900/95 backdrop-blur-2xl border border-indigo-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-indigo-950 via-slate-900 to-violet-950 border-b border-indigo-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center">
                <span className="text-2xl">🦉</span>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Robo Sir</span>
                  <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded-full border border-indigo-400/30 font-mono">PRO AI</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {currentUser.name} • {currentUser.role}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setTtsActive(!ttsActive)}
                title={ttsActive ? 'Disable Audio Speech' : 'Enable Audio Speech'}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                {ttsActive ? <Volume2 size={16} className="text-indigo-400" /> : <VolumeX size={16} />}
              </button>
              <button
                onClick={clearHistory}
                title="Reset Conversation"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={toggleOpen}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-sm">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                      : 'bg-slate-800/80 text-slate-200 border border-slate-700/60 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed text-[13px]">{msg.text}</p>
                  
                  {msg.sender === 'robo' && ttsActive && (
                    <button
                      onClick={() => speakText(msg.text)}
                      className="mt-2 text-[10px] text-indigo-300 hover:text-indigo-200 flex items-center gap-1 opacity-80 hover:opacity-100 transition"
                    >
                      <Volume2 size={12} />
                      <span>{isSpeaking ? 'Speaking...' : 'Listen Audio'}</span>
                    </button>
                  )}
                </div>

                {/* Quick suggestions pills */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {msg.suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(sug)}
                        className="text-[11px] bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/30 text-indigo-200 px-2.5 py-1 rounded-full transition flex items-center gap-1 active:scale-95"
                      >
                        <Sparkles size={11} className="text-amber-400" />
                        <span>{sug}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isThinking && (
              <div className="flex items-center gap-2 text-indigo-400 bg-slate-800/60 border border-indigo-500/20 px-3 py-2 rounded-2xl w-fit">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-xs font-medium text-slate-400">Robo Sir is formulating solution...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 bg-slate-950 border-t border-slate-800">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about routine, equations, physics, or study tips..."
                className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
              <button
                type="submit"
                disabled={!input.trim() || isThinking}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition shadow-md shadow-indigo-600/30"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
