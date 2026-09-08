'use client';

import React, { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ date: string; desc: string } | null>(null);

  const runPrediction = async () => {
    setLoading(true);
    setResult(null);

    try {
      // שליפת הנתונים מה-ENV של Vercel בצורה מאובטחת
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/rest/v1/conflicts_dataset?select=*`, {
        headers: {
          "apikey": supabaseKey || '',
          "Authorization": `Bearer ${supabaseKey || ''}`
        }
      });

      const data = await response.json();

      if (data && data.length > 0) {
        // חישוב רגרסיה ליניארית ב-TypeScript
        const n = data.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        let totalInterval = 0;

        data.forEach((row: any, index: number) => {
          sumX += index;
          sumY += row.event_year;
          sumXY += (index * row.event_year);
          sumXX += (index * index);
          totalInterval += row.time_interval;
        });

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        const predictedYearFloat = slope * n + intercept;
        
        const baseYear = Math.floor(predictedYearFloat);
        const fraction = predictedYearFloat - base_year;
        const predictedDate = new Date(baseYear, 0, 1);
        predictedDate.setTime(predictedDate.getTime() + fraction * 365.25 * 24 * 60 * 60 * 1000);
        
        const formattedDateStr = predictedDate.toLocaleDateString('he-IL', { year: 'numeric', month: 'long' });
        const meanInterval = (totalInterval / n).toFixed(1);

        setResult({
          date: `חודש ${formattedDateStr}`,
          desc: `המודל ניתח ${n} אירועים היסטוריים מ-1948 ועד 2026. מרווח הזמן הממוצע עומד על ${meanInterval} שנים.`
        });
      }
    } catch (error) {
      setResult({
        date: "שגיאה בחישוב",
        desc: "לא הצליח להתחבר למסד הנתונים."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col justify-between selection:bg-red-500 selection:text-white font-sans" dir="rtl">
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-base font-bold text-white tracking-tight">מודל חיזוי עימותים ישראל (1948-2026)</h1>
          <div className="text-xs text-slate-400">ניתוח סטטיסטי-היסטורי (TSX)</div>
        </div>
      </header>

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <div className="text-center max-w-2xl mb-8">
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
            מתי תפרוץ המלחמה הבאה?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            המודל משכלל נתונים היסטוריים מכל מערכות ישראל מאז 1948 ועד 2026 באמצעות רגרסיה ומשתני סביבה מאובטחים.
          </p>
        </div>

        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          
          {!loading && !result && (
            <div className="flex flex-col items-center">
              <button 
                onClick={runPrediction}
                className="group relative w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-black text-xl rounded-2xl shadow-xl shadow-red-950/50 border border-red-400/30 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex items-center justify-center gap-3"
              >
                <span className="text-2xl">🎯</span>
                <span>הפעל מנוע חיזוי מלחמה עכשיו</span>
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative w-16 h-16 mb-4 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
              <div className="text-sm font-semibold text-slate-300 animate-pulse">שולף נתונים מ-Supabase ומחשב רגרסיה...</div>
            </div>
          )}

          {result && !loading && (
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 text-3xl mb-4">
                ⚠️
              </div>
              <h3 className="text-3xl sm:text-5xl font-black text-white my-3 tracking-tight">
                {result.date}
              </h3>
              <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-6 leading-relaxed">
                {result.desc}
              </p>
              <button 
                onClick={() => setResult(null)} 
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 cursor-pointer"
              >
                🔄 בצע חישוב מחדש
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}