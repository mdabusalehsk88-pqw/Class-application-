import React from 'react';
import { mockBusRoutes } from '../../data/mockData';
import { Bus, MapPin, Phone, User, Clock, ShieldCheck } from 'lucide-react';

export const TransportView: React.FC = () => {
  const bus = mockBusRoutes[0];

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold text-yellow-400 uppercase tracking-wider">
          <Bus size={14} />
          <span>স্কুল বাস লাইভ ট্র্যাকিং (Transport GPS Portal)</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
          {bus.routeNumber}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {bus.routeName} • জিপিএস লাইভ পজিশনিং সক্রিয়
        </p>
      </div>

      {/* Simulated Live Route Map Graphic */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-bold text-white">লাইভ অবস্থান: {bus.currentStop}</span>
          </div>
          <span className="text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full">
            পরবর্তী স্টপ: {bus.nextStop} (আনুমানিক {bus.eta})
          </span>
        </div>

        {/* Route Timeline Graphic */}
        <div className="relative py-6">
          <div className="h-2 w-full bg-slate-800 rounded-full relative">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full w-2/3"></div>
            {/* Bus position icon */}
            <div className="absolute top-1/2 left-2/3 -translate-y-1/2 -translate-x-1/2 p-2 rounded-full bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-400/40 animate-pulse">
              <Bus size={18} />
            </div>
          </div>

          <div className="flex justify-between text-xs text-slate-400 font-bold mt-4">
            <div>উত্তরা সেক্টর ৭ (শুরু)</div>
            <div className="text-yellow-400">মহাখালী ফ্লাইওভার (বর্তমান)</div>
            <div>ফার্মগেট ওভারব্রিজ</div>
            <div>ধানমন্ডি ক্যাম্পাস (গন্তব্য)</div>
          </div>
        </div>

        {/* Driver Contact & Vehicle Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div className="p-4 bg-slate-850 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-indigo-400">
              <User size={18} />
            </div>
            <div>
              <div className="text-slate-400">ড্রাইভারের নাম</div>
              <div className="font-bold text-white text-sm">{bus.driverName}</div>
            </div>
          </div>

          <div className="p-4 bg-slate-850 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-emerald-400">
              <Phone size={18} />
            </div>
            <div>
              <div className="text-slate-400">জরুরি যোগাযোগ</div>
              <div className="font-bold text-white text-sm font-mono">{bus.driverPhone}</div>
            </div>
          </div>

          <div className="p-4 bg-slate-850 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-pink-400">
              <Bus size={18} />
            </div>
            <div>
              <div className="text-slate-400">গাড়ি নম্বর</div>
              <div className="font-bold text-white text-sm">{bus.vehicleNumber}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
