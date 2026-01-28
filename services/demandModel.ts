
import { CityStats } from "../types";

/**
 * DETERMINISTIC FORECAST ENGINE
 * Ensures a specific date always yields the same MLD based on absolute temporal properties.
 */
export function calculateForecast(stats: CityStats, startDate: string, days: number) {
  const forecast = [];
  const baseDate = new Date(startDate);
  
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(baseDate);
    currentDate.setDate(baseDate.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];
    
    // 1. DETERMINISTIC POPULATION GROWTH (1.2% Annual)
    const baseYear = 2024;
    const currentYear = currentDate.getFullYear();
    const yearsDiff = Math.max(0, currentYear - baseYear);
    const growthFactor = Math.pow(1.012, yearsDiff);
    const popAtTime = stats.population * growthFactor;

    // 2. BASELINE (135 LPCD)
    const baseDemand = (popAtTime * 135);

    // 3. DETERMINISTIC WEATHER (Sine wave based on Day of Month)
    // Ensures a specific calendar date always has the same temp offset
    const dayOfMonth = currentDate.getDate();
    const tempOffset = Math.sin(dayOfMonth * 0.5) * 2;
    const dailyTemp = stats.avgMonthlyTemp + tempOffset; 
    const tempImpact = baseDemand * (Math.max(0, dailyTemp - 28) * 0.04);

    // 4. DETERMINISTIC INDUSTRIAL (Andheri MIDC Sunday logic)
    // Sunday (Day 0) has 40% industrial load vs 95% on Weekdays
    const isSunday = currentDate.getDay() === 0;
    const industrialFactor = isSunday ? 0.4 : 0.95; 
    const industrialImpact = baseDemand * (industrialFactor * 0.12);

    // 5. DETERMINISTIC FESTIVAL IMPACT
    // Checks the festival list provided by Gemini for this specific date
    const festival = stats.festivals.find(f => f.date === dateStr);
    const festivalMultipliers = { low: 0.02, medium: 0.08, high: 0.15 };
    const festImpact = festival ? (baseDemand * festivalMultipliers[festival.impactLevel]) : 0;

    forecast.push({
      date: dateStr,
      displayDate: days > 14 
        ? currentDate.toLocaleDateString('en-US', { day: 'numeric', month: 'narrow' })
        : currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      totalMLD: (baseDemand + tempImpact + industrialImpact + festImpact) / 1000000,
      breakdown: {
        base: baseDemand / 1000000,
        temp: tempImpact / 1000000,
        industrial: industrialImpact / 1000000,
        festival: festImpact / 1000000
      }
    });
  }
  return forecast;
}

export function generateHistoricalTrend(stats: CityStats) {
  const data = [];
  for (let i = 14; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      demand: 202.5 + (Math.random() * 20 - 10),
      temp: 28 + (Math.random() * 5)
    });
  }
  return data;
}
