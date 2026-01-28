
export interface CityStats {
  city: string;
  population: number;
  avgMonthlyTemp: number;
  festivals: Festival[];
  industrialZoneActivity: 'low' | 'normal' | 'high'; // Added for industrial usage requirement
}

export interface Festival {
  name: string;
  date: string;
  impactLevel: 'low' | 'medium' | 'high';
  expectedCrowdSize?: string;
  description: string;
}

export interface PredictionResult {
  baseDemand: number; 
  tempImpact: number;
  festivalImpact: number;
  industrialImpact: number; // Added for industrial usage requirement
  totalDemand: number;
  reasoning: string;
  recommendations: string[];
}

export interface HistoricalPoint {
  date: string;
  demand: number;
  temp: number;
}
