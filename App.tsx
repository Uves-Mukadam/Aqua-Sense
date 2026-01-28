import React, { useState } from 'react';
import { 
  Droplets, MapPin, Thermometer, Users, TrendingUp, AlertCircle, Waves, Zap, Factory, Info
} from 'lucide-react';
import { 
  CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell, AreaChart, Area
} from 'recharts';
import { getCityContext, getAIReasoning } from './services/geminiService';
import { calculateForecast } from './services/demandModel';
import { CityStats } from './types';

const BASE_POPULATION = 1500000;

const App: React.FC = () => {
  const [city] = useState('Andheri');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [activeDays, setActiveDays] = useState<number>(7);
  const [error, setError] = useState<{message: string, detail: string, type: 'api' | 'ml' | 'gen' | 'quota'} | null>(null);
  
  const [cityData, setCityData] = useState<CityStats | null>(null);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [prediction, setPrediction] = useState<any | null>(null);

  const performAnalysis = async (days: number) => {
    setLoading(true);
    setError(null);
    setActiveDays(days);
    
    try {
      // 1. Get Context (Weather/Festivals) from Gemini
      const stats = await getCityContext(city, date, days);
      setCityData(stats);

      // 2. Fetch ML Prediction from Flask
      let mlResult = null;
      try {
        const response = await fetch('/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(stats)
        });
        if (response.ok) {
          mlResult = await response.json();
        } else {
          console.warn("ML Backend returned non-200, using simulation.");
        }
      } catch (e) {
        console.warn("ML Backend connection failed, using local deterministic model.");
      }

      // 3. Generate Forecast based on Stats and potential ML weights
      const forecast = calculateForecast(stats, date, days);
      const mainDay = forecast[0]; 

      // 4. Get Expert Strategy from Gemini
      const targetMLD = mlResult && mlResult.status === 'success' ? mlResult.total_mld : mainDay.totalMLD;
      const aiResponse = await getAIReasoning(city, date, stats, targetMLD * 1000000, days);

      setForecastData(forecast);
      setPrediction({
        totalDemand: targetMLD * 1000000,
        baseDemand: (mlResult?.breakdown?.base_mld || mainDay.breakdown.base) * 1000000,
        tempImpact: (mlResult?.breakdown?.temp_mld || mainDay.breakdown.temp) * 1000000,
        industrialImpact: mainDay.breakdown.industrial * 1000000,
        festivalImpact: (mlResult?.breakdown?.fest_mld || mainDay.breakdown.festival) * 1000000,
        ...aiResponse
      });
    } catch (err: any) {
      console.error("Full analysis error:", err);
      let errorType: 'api' | 'ml' | 'gen' | 'quota' = 'gen';
      let message = "Analysis Failed";
      let detail = err.message || "An unexpected error occurred during processing.";

      if (err.message.includes("QUOTA_EXHAUSTED") || err.message.includes("429")) {
        errorType = 'quota';
        message = "Rate Limit Reached";
        detail = "The Gemini API quota for this key has been temporarily exceeded. Please wait 60 seconds before trying again.";
      } else if (err.message.includes("API_KEY") || err.message.includes("401") || err.message.includes("403") || err.message.includes("INVALID_ARGUMENT")) {
        errorType = 'api';
        message = "Gemini API Error";
        detail = "API Key check failed. Please verify the key in your .env file and restart the Vite server.";
      } else if (err.message.includes("fetch")) {
        message = "Connection Error";
        detail = "Could not reach the server. Ensure both Vite and Python backend (main.py) are running.";
      }

      setError({ message, detail, type: errorType });
    } finally {
      setLoading(false);
    }
  };

  const getPopAtDate = () => {
    const years = Math.max(0, new Date(date).getFullYear() - 2024);
    return Math.round(BASE_POPULATION * Math.pow(1.012, years));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-['Plus_Jakarta_Sans']">
      <header className="aqua-gradient text-white pt-16 pb-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none translate-x-20 -translate-y-20">
          <Waves size={600} />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-xl border border-white/20 shadow-2xl">
              <Droplets className="text-white fill-blue-300" size={32} />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Aqua Sense AI</h1>
          </div>
          <p className="text-blue-100 text-lg opacity-90 max-w-xl text-left">
            Unified Water Intelligence for Andheri Ward. Linear Regression forecasting with Gemini reasoning.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 -mt-16 relative z-20">
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 border border-slate-100">
          <div className="flex flex-wrap gap-6 items-end justify-between">
            <div className="flex-1 min-w-[280px]">
              <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest text-left">Target Ward</label>
              <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-700 w-full">
                <MapPin size={18} className="text-blue-500" /> Andheri East (MIDC)
              </div>
            </div>
            
            <div className="w-full sm:w-64">
              <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest text-left">Forecast Start Date</label>
              <input 
                type="date" 
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 text-slate-900 font-semibold outline-none focus:border-blue-500" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                required 
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto shrink-0">
              <button 
                onClick={() => performAnalysis(7)} 
                disabled={loading} 
                className="flex-1 sm:flex-none px-6 py-4 bg-slate-800 text-white font-bold rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:bg-slate-700 transition-all disabled:opacity-70 active:scale-95 whitespace-nowrap"
              >
                {loading && activeDays === 7 ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Zap size={18} />}
                Short Term (7d)
              </button>
              <button 
                onClick={() => performAnalysis(30)} 
                disabled={loading} 
                className="flex-1 sm:flex-none px-6 py-4 aqua-gradient text-white font-bold rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-70 active:scale-95 whitespace-nowrap"
              >
                {loading && activeDays === 30 ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <TrendingUp size={18} />}
                Mid Term (30d)
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className={`mt-8 p-6 ${error.type === 'quota' ? 'bg-amber-50 border-amber-500 text-amber-800' : 'bg-red-50 border-red-500 text-red-700'} border-l-4 rounded-3xl shadow-sm flex items-start gap-4 animate-in fade-in zoom-in duration-300`}>
            <AlertCircle className="shrink-0 mt-1" /> 
            <div className="text-left">
              <p className="text-lg font-bold">{error.message}</p>
              <p className="text-sm font-medium opacity-80 mt-1">{error.detail}</p>
            </div>
          </div>
        )}

        {prediction && cityData && !loading && (
          <div className="mt-12 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard icon={<Users className="text-blue-600" />} label="Projected Pop." value={getPopAtDate().toLocaleString()} sub="1.2% CAGR applied" />
              <StatCard icon={<Factory className="text-purple-600" />} label="Industrial Activity" value={cityData.industrialZoneActivity.toUpperCase()} sub="MIDC Sector Load" />
              <StatCard icon={<Thermometer className="text-orange-600" />} label="Forecasted Temp" value={`${cityData.avgMonthlyTemp.toFixed(1)}°C`} sub="Climatology Base" />
              <StatCard icon={<TrendingUp className="text-indigo-600" />} label="Peak MLD" value={`${(prediction.totalDemand / 1000000).toFixed(1)}`} sub="Predicted Total" highlight />
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex items-center justify-between mb-8 text-left">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{activeDays}-Day Consumption Trend</h3>
                  <p className="text-slate-400 text-sm flex items-center gap-1"><Info size={14} /> Integrated forecast combining seasonal variance and ML weights.</p>
                </div>
              </div>
              <div className="h-80 w-full overflow-x-auto">
                <div className="min-w-[600px] h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecastData}>
                      <defs>
                        <linearGradient id="colorMLD" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="displayDate" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 12}} 
                        dy={10} 
                        interval={activeDays > 14 ? 1 : 0}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} />
                      <Tooltip 
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} 
                        formatter={(value: number) => [`${value.toFixed(2)} MLD`, 'Demand']}
                      />
                      <Area type="monotone" dataKey="totalMLD" stroke="#0ea5e9" strokeWidth={4} fillOpacity={1} fill="url(#colorMLD)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
              <div className="lg:col-span-3">
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-full text-left">
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-slate-800">Demand Driver Attribution</h3>
                    <p className="text-slate-400 text-xs">Primary contributors to current usage spikes</p>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Base', value: prediction.baseDemand / 1000000, fill: '#0ea5e9' },
                        { name: 'Weather', value: prediction.tempImpact / 1000000, fill: '#f97316' },
                        { name: 'Industry', value: prediction.industrialImpact / 1000000, fill: '#a855f7' },
                        { name: 'Festivals', value: prediction.festivalImpact / 1000000, fill: '#6366f1' }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip formatter={(v: number) => [`${v.toFixed(2)} MLD`]} />
                        <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={55}>
                          {[0, 1, 2, 3].map((_, index) => (
                            <Cell key={`cell-${index}`} fill={['#0ea5e9', '#f97316', '#a855f7', '#6366f1'][index]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 text-left">
                <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400"><Zap size={24} /></div>
                    <h3 className="text-xl font-bold uppercase tracking-widest text-blue-400">Expert Strategy</h3>
                  </div>
                  <div className="space-y-8 relative z-10">
                    <p className="text-slate-300 leading-relaxed italic text-lg font-medium border-l-4 border-blue-500/30 pl-6">
                      "{prediction.reasoning}"
                    </p>
                    <div className="pt-8 border-t border-slate-800">
                      <h4 className="text-blue-400 text-xs font-black uppercase tracking-[0.25em] mb-6">Preventative Actions</h4>
                      <ul className="space-y-5">
                        {prediction.recommendations.map((rec: string, i: number) => (
                          <li key={i} className="flex gap-4 items-start text-sm text-slate-300">
                            <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-24 border-t border-slate-200 py-12 text-center text-slate-400 text-sm">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <Droplets size={16} className="text-blue-500" />
            <span className="font-bold text-slate-700">Aqua Sense AI</span>
          </div>
          <p className="opacity-70">Empowering BMC Water Management through Hybrid Intelligence</p>
          <div className="text-xs font-semibold uppercase tracking-widest text-slate-300 mt-2">
            Team Aqua | Sahil • Taha • Affan • Uves
          </div>
        </div>
      </footer>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string, sub: string, highlight?: boolean }> = ({ icon, label, value, sub, highlight }) => (
  <div className={`bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1 ${highlight ? 'ring-4 ring-blue-500/5 border-blue-100' : ''}`}>
    <div className="flex items-center gap-4 mb-5">
      <div className="p-3.5 bg-slate-50 rounded-2xl shadow-inner">{icon}</div>
      <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] text-left leading-tight">{label}</span>
    </div>
    <div className="flex flex-col text-left">
      <span className={`text-3xl font-black ${highlight ? 'text-blue-600' : 'text-slate-900'}`}>{value}</span>
      <span className="text-slate-400 text-xs font-semibold mt-2">{sub}</span>
    </div>
  </div>
);

export default App;