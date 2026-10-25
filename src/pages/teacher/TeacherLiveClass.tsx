import React, { useRef, useState, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Share2,
  Hand,
  MessageSquare,
  Users,
  Eraser,
  PenTool,
  RotateCcw,
  Sparkles,
  PhoneOff
} from 'lucide-react';

export const TeacherLiveClass: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#6366f1');
  const [lineWidth, setLineWidth] = useState(3);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const { playChime, addNotification } = useNotifications();

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // fill dark background for whiteboard
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    playChime('click');
  };

  const toggleHand = () => {
    setIsHandRaised(prev => {
      const next = !prev;
      if (next) {
        playChime('alert');
        addNotification({
          title: 'হাত তোলা হয়েছে ✋',
          message: 'শিক্ষার্থীর প্রশ্ন বা কথা বলার অনুরোধ স্ক্রিনে দেখানো হচ্ছে।',
          type: 'info'
        });
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <span>লাইভ স্মার্ট ক্লাসরুম (Live Virtual Classroom)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            পদার্থবিজ্ঞান: অপটিক্স ও আলোর প্রতিসরণ (Interactive Lecture)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            উপস্থিত শিক্ষার্থী: ৩৮ জন • ভার্চুয়াল হোয়াইটবোর্ড ও অডিও স্ট্রিমিং সক্রিয়
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold animate-pulse">
            REC 42:15
          </span>
          <button
            onClick={() => {
              playChime('alert');
              addNotification({
                title: 'লাইভ ক্লাস সমাপ্ত',
                message: 'ক্লাসের রেকর্ডিং সংরক্ষিত হয়েছে এবং শিক্ষার্থীদের ম্যাটেরিয়াল ট্যাবে যুক্ত হবে।',
                type: 'info'
              });
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow"
          >
            <PhoneOff size={14} />
            <span>ক্লাস সমাপ্ত করুন</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Whiteboard + Participants Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Interactive Whiteboard Area */}
        <div className="lg:col-span-3 bg-slate-900 rounded-3xl border border-slate-800 p-4 space-y-3">
          {/* Whiteboard Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                <PenTool size={14} className="text-indigo-400" />
                <span>কালার:</span>
              </span>
              {['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#ffffff'].map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition ${
                    color === c ? 'border-white scale-110 shadow' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <div className="h-4 w-[1px] bg-slate-800 mx-1" />
              <button
                onClick={() => setColor('#0f172a')}
                className={`p-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  color === '#0f172a' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="ইরেজার (Eraser)"
              >
                <Eraser size={14} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={clearCanvas}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <RotateCcw size={13} />
                <span>বোর্ড মুছুন (Clear)</span>
              </button>
            </div>
          </div>

          {/* HTML5 Canvas Whiteboard */}
          <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
            <canvas
              ref={canvasRef}
              width={780}
              height={420}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="w-full h-[420px] cursor-crosshair block"
            />
          </div>

          {/* Teacher Media Controls Bar */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsMicOn(!isMicOn)}
              className={`p-3 rounded-2xl transition ${
                isMicOn ? 'bg-slate-800 text-white' : 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              }`}
              title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
            >
              {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
            </button>
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-3 rounded-2xl transition ${
                isVideoOn ? 'bg-slate-800 text-white' : 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              }`}
              title={isVideoOn ? 'Stop Video' : 'Start Video'}
            >
              {isVideoOn ? <Video size={18} /> : <VideoOff size={18} />}
            </button>
            <button
              onClick={toggleHand}
              className={`p-3 rounded-2xl transition ${
                isHandRaised ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
              }`}
              title="Hand Raise"
            >
              <Hand size={18} />
            </button>
            <button
              onClick={() => {
                playChime('click');
                addNotification({
                  title: 'স্ক্রিন শেয়ারিং উইন্ডো',
                  message: 'আপনার কম্পিউটার স্ক্রিন সকল শিক্ষার্থীর ডিভাইসে শেয়ার হচ্ছে।',
                  type: 'info'
                });
              }}
              className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition shadow-lg shadow-indigo-600/30"
              title="Share Screen"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* Right Side: Attendees & Live Chat */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-4 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="font-bold text-xs text-white flex items-center gap-1.5">
                <Users size={14} className="text-emerald-400" />
                <span>অংশগ্রহণকারী (৩৮)</span>
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                অনলাইন
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { name: 'Dr. Nusrat Jahan (আপনি)', role: 'শিক্ষক', isHost: true },
                { name: 'Rafiul Islam (CR)', role: 'শিক্ষার্থী', hand: false },
                { name: 'Tanvir Ahmed', role: 'শিক্ষার্থী', hand: true },
                { name: 'Samiha Islam', role: 'শিক্ষার্থী', hand: false },
                { name: 'Sadia Jahan', role: 'শিক্ষার্থী', hand: false }
              ].map((p, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-slate-850 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="font-bold text-slate-200">{p.name}</span>
                  </div>
                  {p.hand && (
                    <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                      ✋ হাত তুলেছেন
                    </span>
                  )}
                  {p.isHost && (
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 rounded font-bold">
                      হোস্ট
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="font-bold text-white flex items-center gap-1">
              <Sparkles size={12} className="text-amber-400" />
              <span>রোবো স্যার লাইভ নোট প্রস্তুত রাখছেন</span>
            </div>
            <div>ক্লাস শেষ হলে এআই অডিও সামারি তৈরি হবে।</div>
          </div>
        </div>
      </div>
    </div>
  );
};
