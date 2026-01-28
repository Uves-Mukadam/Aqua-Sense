
import React, { useState } from 'react';
import { 
  Droplets, MapPin, Calendar, Thermometer, Users, TrendingUp, AlertCircle, Waves, Zap, Factory, Info, BarChart as ChartIcon
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
  const [error, setError] = useState<string | null>(null);
  
  const [cityData, setCityData] = useState<CityStats | null>(null);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [prediction, setPrediction] = useState<any | null>(null);

  const performAnalysis = async (days: number) => {
    setLoading(true);
    setError(null);
    setActiveDays(days);
    
    try {
      // 1. Context Acquisition for the specific window
      const stats = await getCityContext(city, date, days);
      
      // 2. Deterministic Calculation for the window
      const forecast = calculateForecast(stats, date, days);
      const mainDay = forecast[0]; // The specific date selected

      // 3. Expert AI Reasoning for the whole period
      const aiResponse = await getAIReasoning(city, date, stats, mainDay.totalMLD * 1000000, days);

      setCityData(stats);
      setForecastData(forecast);
      setPrediction({
        totalDemand: mainDay.totalMLD * 1000000,
        baseDemand: mainDay.breakdown.base * 1000000,
        tempImpact: mainDay.breakdown.temp * 1000000,
        industrialImpact: mainDay.breakdown.industrial * 1000000,
        festivalImpact: mainDay.breakdown.festival * 1000000,
        ...aiResponse
      });
    } catch (err: any) {
      console.error(err);
      setError("System failed to synchronize forecasting data. Verify your API connection.");
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
          <p className="text-blue-100 text-lg opacity-90 max-w-xl">
            Urban water forecasting for Andheri Ward. Analyzing seasonal trends, population growth, festivals, and MIDC industrial cycles.
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
              <input type="date" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 text-slate-900 font-semibold outline-none focus:border-blue-500" value={date} onChange={(e) => setDate(e.target.value)} required />
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

        {error && <div className="mt-8 p-5 bg-red-50 border-l-4 border-red-500 rounded-2xl text-red-700 font-semibold flex items-center gap-3 animate-in fade-in"><AlertCircle /> {error}</div>}

        {prediction && cityData && (
          <div className="mt-12 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard icon={<Users className="text-blue-600" />} label="Projected Pop." value={getPopAtDate().toLocaleString()} sub="Inc. 1.2% Growth" />
              <StatCard icon={<Factory className="text-purple-600" />} label="Industrial activity" value={cityData.industrialZoneActivity.toUpperCase()} sub="MIDC Cycle Sync" />
              <StatCard icon={<Thermometer className="text-orange-600" />} label="Weather load" value={`${cityData.avgMonthlyTemp}°C`} sub="Baseline Context" />
              <StatCard icon={<TrendingUp className="text-indigo-600" />} label="Target MLD" value={`${(prediction.totalDemand / 1000000).toFixed(1)}`} sub="Selected Date Value" highlight />
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{activeDays}-Day Consumption Forecast</h3>
                  <p className="text-slate-400 text-sm flex items-center gap-1"><Info size={14} /> Values are deterministic based on date-specific growth and MIDC cycles.</p>
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
                        tick={{fill: '#94a3b8', fontSize: activeDays > 14 ? 10 : 12}} 
                        dy={10} 
                        interval={activeDays > 14 ? 1 : 0}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} label={{ value: 'MLD', angle: -90, position: 'insideLeft', fill: '#94a3b8', dy: 20 }} />
                      <Tooltip 
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} 
                        formatter={(value: number) => [`${value.toFixed(2)} MLD`, 'Total Demand']}
                      />
                      <Area type="monotone" dataKey="totalMLD" stroke="#0ea5e9" strokeWidth={4} fillOpacity={1} fill="url(#colorMLD)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
              <div className="lg:col-span-3">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-full">
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-slate-800">Demand Driver Attribution</h3>
                    <p className="text-slate-400 text-xs">For selected start date ({new Date(date).toDateString()})</p>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Baseline', value: prediction.baseDemand / 1000000, fill: '#0ea5e9' },
                        { name: 'Weather', value: prediction.tempImpact / 1000000, fill: '#f97316' },
                        { name: 'Industrial', value: prediction.industrialImpact / 1000000, fill: '#a855f7' },
                        { name: 'Festivals', value: prediction.festivalImpact / 1000000, fill: '#6366f1' }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip formatter={(v: number) => [`${v.toFixed(2)} MLD`]} />
                        <Bar dataKey="value" radius={[10, 10, 10, 10]} barSize={50}>
                          {[0, 1, 2, 3].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#0ea5e9', '#f97316', '#a855f7', '#6366f1'][index]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl h-full relative overflow-hidden">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400"><Zap size={24} /></div>
                    <h3 className="text-xl font-bold uppercase tracking-widest text-blue-400">Expert Strategy</h3>
                  </div>
                  <div className="space-y-6 relative z-10">
                    <p className="text-slate-300 leading-relaxed italic">"{prediction.reasoning}"</p>
                    <div className="pt-6 border-t border-slate-800">
                      <h4 className="text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-5">Preventative Actions ({activeDays}d)</h4>
                      <ul className="space-y-4">
                        {prediction.recommendations.map((rec: string, i: number) => (
                          <li key={i} className="flex gap-4 items-start text-sm text-slate-300">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
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
          <p>Built by Sahil, Affan, Taha and Uves</p>
        </div>
      </footer>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string, sub: string, highlight?: boolean }> = ({ icon, label, value, sub, highlight }) => (
  <div className={`bg-white p-6 rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-xl ${highlight ? 'ring-4 ring-blue-500/10 border-blue-100' : ''}`}>
    <div className="flex items-center gap-4 mb-4">
      <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
      <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">{label}</span>
    </div>
    <div className="flex flex-col text-left">
      <span className={`text-2xl font-black ${highlight ? 'text-blue-600' : 'text-slate-900'}`}>{value}</span>
      <span className="text-slate-400 text-xs font-semibold mt-1">{sub}</span>
    </div>
  </div>
);

export default App;
