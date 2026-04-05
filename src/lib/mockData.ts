// Mock data and utility functions for the parametric insurance platform

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  city: string;
  workType: 'full-time' | 'part-time';
  preferredHours: string;
  platform: 'Zomato' | 'Swiggy' | 'Both';
  joinedDate: string;
}

export interface Policy {
  id: string;
  weekStart: string;
  weekEnd: string;
  status: 'active' | 'expired' | 'pending';
  baseRate: number;
  locationRisk: number;
  weatherRisk: number;
  totalPremium: number;
  coverageAmount: number;
  earningsProtected: number;
}

export interface Claim {
  id: string;
  triggerType: 'rainfall' | 'heatwave' | 'aqi' | 'platform_downtime';
  triggerValue: string;
  lostHours: number;
  payoutAmount: number;
  status: 'approved' | 'pending' | 'flagged' | 'paid';
  timestamp: string;
  transactionId: string;
  fraudFlag: boolean;
}

export interface TriggerEvent {
  id: string;
  type: 'rainfall' | 'heatwave' | 'aqi' | 'platform_downtime';
  value: number;
  threshold: number;
  unit: string;
  location: string;
  timestamp: string;
  status: 'active' | 'resolved';
}

export interface RiskScore {
  overall: number;
  location: number;
  weather: number;
  time: number;
  historical: number;
  explanation: string[];
}

export const mockUser: UserProfile = {
  id: 'usr_001',
  name: 'Rahul Sharma',
  email: 'rahul@example.com',
  city: 'Mumbai',
  workType: 'full-time',
  preferredHours: '10:00 AM - 10:00 PM',
  platform: 'Zomato',
  joinedDate: '2024-01-15',
};

export const mockPolicy: Policy = {
  id: 'POL-2024-0847',
  weekStart: '2024-03-11',
  weekEnd: '2024-03-17',
  status: 'active',
  baseRate: 49,
  locationRisk: 18,
  weatherRisk: 12,
  totalPremium: 79,
  coverageAmount: 2500,
  earningsProtected: 1850,
};

export const mockClaims: Claim[] = [
  {
    id: 'CLM-001',
    triggerType: 'rainfall',
    triggerValue: '65mm rainfall in 2 hours',
    lostHours: 4,
    payoutAmount: 500,
    status: 'paid',
    timestamp: '2024-03-14T14:30:00',
    transactionId: 'TXN_RPY_8847291',
    fraudFlag: false,
  },
  {
    id: 'CLM-002',
    triggerType: 'heatwave',
    triggerValue: '46°C temperature',
    lostHours: 3,
    payoutAmount: 375,
    status: 'paid',
    timestamp: '2024-03-12T13:00:00',
    transactionId: 'TXN_RPY_8847290',
    fraudFlag: false,
  },
  {
    id: 'CLM-003',
    triggerType: 'aqi',
    triggerValue: 'AQI 420 (Severe)',
    lostHours: 5,
    payoutAmount: 625,
    status: 'paid',
    timestamp: '2024-03-10T09:00:00',
    transactionId: 'TXN_RPY_8847289',
    fraudFlag: false,
  },
  {
    id: 'CLM-004',
    triggerType: 'platform_downtime',
    triggerValue: 'Zomato server outage - 2hrs',
    lostHours: 2,
    payoutAmount: 250,
    status: 'paid',
    timestamp: '2024-03-08T19:00:00',
    transactionId: 'TXN_RPY_8847288',
    fraudFlag: false,
  },
  {
    id: 'CLM-005',
    triggerType: 'rainfall',
    triggerValue: '72mm rainfall — waterlogging',
    lostHours: 6,
    payoutAmount: 750,
    status: 'pending',
    timestamp: '2024-03-08T10:00:00',
    transactionId: '',
    fraudFlag: false,
  },
  {
    id: 'CLM-006',
    triggerType: 'heatwave',
    triggerValue: '48°C — extreme heat advisory',
    lostHours: 5,
    payoutAmount: 625,
    status: 'pending',
    timestamp: '2024-03-07T12:00:00',
    transactionId: '',
    fraudFlag: false,
  },
  {
    id: 'CLM-007',
    triggerType: 'aqi',
    triggerValue: 'AQI 380 (Very Poor)',
    lostHours: 4,
    payoutAmount: 500,
    status: 'approved',
    timestamp: '2024-03-06T08:00:00',
    transactionId: 'TXN_RPY_8847286',
    fraudFlag: false,
  },
  {
    id: 'CLM-008',
    triggerType: 'platform_downtime',
    triggerValue: 'Swiggy app crash — nationwide',
    lostHours: 3,
    payoutAmount: 375,
    status: 'flagged',
    timestamp: '2024-03-05T20:00:00',
    transactionId: '',
    fraudFlag: true,
  },
];

export const mockTriggerEvents: TriggerEvent[] = [
  { id: 'TRG-001', type: 'rainfall', value: 65, threshold: 40, unit: 'mm/hr', location: 'Mumbai - Andheri', timestamp: '2024-03-14T14:30:00', status: 'active' },
  { id: 'TRG-002', type: 'heatwave', value: 46, threshold: 43, unit: '°C', location: 'Delhi - Connaught Place', timestamp: '2024-03-12T13:00:00', status: 'resolved' },
  { id: 'TRG-003', type: 'aqi', value: 420, threshold: 300, unit: 'AQI', location: 'Delhi - IGI Area', timestamp: '2024-03-10T09:00:00', status: 'resolved' },
  { id: 'TRG-004', type: 'platform_downtime', value: 120, threshold: 60, unit: 'min', location: 'Pan India', timestamp: '2024-03-08T19:00:00', status: 'resolved' },
  { id: 'TRG-005', type: 'rainfall', value: 72, threshold: 40, unit: 'mm/hr', location: 'Mumbai - Dadar', timestamp: '2024-03-08T10:00:00', status: 'resolved' },
  { id: 'TRG-006', type: 'heatwave', value: 48, threshold: 43, unit: '°C', location: 'Delhi - Lajpat Nagar', timestamp: '2024-03-07T12:00:00', status: 'resolved' },
];

export const mockRiskScore: RiskScore = {
  overall: 72,
  location: 78,
  weather: 85,
  time: 55,
  historical: 68,
  explanation: [
    'High rainfall zone increases your risk by 25%',
    'Mumbai monsoon season approaching — historical claims spike 3x',
    'Evening hours (6-10 PM) show higher disruption probability',
    'Your area had 12 disruption events in last 30 days',
  ],
};

export const weeklyEarningsData = [
  { week: 'W1', protected: 1200, actual: 4500 },
  { week: 'W2', protected: 800, actual: 4200 },
  { week: 'W3', protected: 1850, actual: 3800 },
  { week: 'W4', protected: 500, actual: 4800 },
  { week: 'W5', protected: 0, actual: 5100 },
  { week: 'W6', protected: 1500, actual: 3900 },
];

export const riskTrendData = [
  { day: 'Mon', risk: 45 },
  { day: 'Tue', risk: 52 },
  { day: 'Wed', risk: 68 },
  { day: 'Thu', risk: 72 },
  { day: 'Fri', risk: 58 },
  { day: 'Sat', risk: 81 },
  { day: 'Sun', risk: 65 },
];

export const adminStats = {
  totalUsers: 12847,
  activePolicies: 9632,
  totalPayouts: 2847500,
  totalClaims: 4218,
  triggerEvents: 342,
  avgPremium: 73,
  claimRatio: 0.34,
  fraudRate: 0.021,
  avgPayoutPerClaim: 675,
  pendingClaims: 127,
  citiesCovered: 48,
  partnersZomato: 7420,
  partnersSwiggy: 4190,
  partnersBoth: 1237,
};

export const adminMonthlyData = [
  { month: 'Oct', users: 8200, payouts: 1200000, triggers: 45, claims: 312, premiumCollected: 598600 },
  { month: 'Nov', users: 9400, payouts: 1800000, triggers: 78, claims: 520, premiumCollected: 686200 },
  { month: 'Dec', users: 10100, payouts: 1500000, triggers: 52, claims: 445, premiumCollected: 737300 },
  { month: 'Jan', users: 11200, payouts: 2100000, triggers: 89, claims: 680, premiumCollected: 817600 },
  { month: 'Feb', users: 12100, payouts: 2500000, triggers: 67, claims: 578, premiumCollected: 883300 },
  { month: 'Mar', users: 12847, payouts: 2847500, triggers: 94, claims: 683, premiumCollected: 937831 },
];

export const triggerTypeLabels: Record<string, string> = {
  rainfall: '🌧️ Heavy Rainfall',
  heatwave: '🌡️ Heatwave',
  aqi: '🏭 Poor Air Quality',
  platform_downtime: '⚡ Platform Downtime',
};

export const triggerTypeColors: Record<string, string> = {
  rainfall: 'bg-blue-100 text-blue-700 border-blue-200',
  heatwave: 'bg-orange-100 text-orange-700 border-orange-200',
  aqi: 'bg-purple-100 text-purple-700 border-purple-200',
  platform_downtime: 'bg-red-100 text-red-700 border-red-200',
};

export function getRiskLevel(score: number): 'safe' | 'warning' | 'danger' {
  if (score < 40) return 'safe';
  if (score < 70) return 'warning';
  return 'danger';
}

export function getRiskLabel(score: number): string {
  if (score < 40) return 'Low Risk';
  if (score < 70) return 'Moderate Risk';
  return 'High Risk';
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// City-specific risk profiles for realistic pricing
export const cityRiskProfiles: Record<string, { locationMultiplier: number; weatherMultiplier: number; description: string }> = {
  Mumbai: { locationMultiplier: 1.55, weatherMultiplier: 0.45, description: 'Very high rainfall & flooding risk' },
  Delhi: { locationMultiplier: 1.40, weatherMultiplier: 0.38, description: 'Extreme heat, poor AQI, seismic zone' },
  Bengaluru: { locationMultiplier: 1.20, weatherMultiplier: 0.30, description: 'Sudden weather changes & flooding' },
  Chennai: { locationMultiplier: 1.45, weatherMultiplier: 0.42, description: 'Cyclone-prone, heavy monsoon rains' },
  Hyderabad: { locationMultiplier: 1.18, weatherMultiplier: 0.25, description: 'Moderate heat & occasional floods' },
  Kolkata: { locationMultiplier: 1.38, weatherMultiplier: 0.40, description: 'Heavy monsoon, cyclone risk' },
  Pune: { locationMultiplier: 1.15, weatherMultiplier: 0.22, description: 'Moderate rainfall risk' },
  Ahmedabad: { locationMultiplier: 1.30, weatherMultiplier: 0.35, description: 'Extreme summer heat, dust storms' },
  Jaipur: { locationMultiplier: 1.25, weatherMultiplier: 0.32, description: 'Extreme heat, sandstorms' },
  Lucknow: { locationMultiplier: 1.22, weatherMultiplier: 0.28, description: 'Extreme heat, winter fog' },
  Surat: { locationMultiplier: 1.35, weatherMultiplier: 0.38, description: 'Flooding, heavy monsoon' },
  Nagpur: { locationMultiplier: 1.28, weatherMultiplier: 0.30, description: 'Very hot summers, moderate rain' },
  Indore: { locationMultiplier: 1.12, weatherMultiplier: 0.20, description: 'Moderate weather risk' },
  Bhopal: { locationMultiplier: 1.18, weatherMultiplier: 0.25, description: 'Moderate monsoon, winter cold' },
  Patna: { locationMultiplier: 1.35, weatherMultiplier: 0.38, description: 'Flood-prone, extreme heat' },
  Chandigarh: { locationMultiplier: 1.15, weatherMultiplier: 0.22, description: 'Moderate risk, winter cold' },
  Kochi: { locationMultiplier: 1.42, weatherMultiplier: 0.42, description: 'Very heavy monsoon, flooding' },
  Guwahati: { locationMultiplier: 1.38, weatherMultiplier: 0.40, description: 'Heavy rainfall, flooding' },
  Thiruvananthapuram: { locationMultiplier: 1.35, weatherMultiplier: 0.38, description: 'Heavy monsoon rains' },
  Varanasi: { locationMultiplier: 1.28, weatherMultiplier: 0.30, description: 'Extreme heat, Ganga flooding' },
  Visakhapatnam: { locationMultiplier: 1.40, weatherMultiplier: 0.40, description: 'Cyclone-prone coastline' },
  Coimbatore: { locationMultiplier: 1.10, weatherMultiplier: 0.18, description: 'Low risk, pleasant climate' },
  Madurai: { locationMultiplier: 1.20, weatherMultiplier: 0.25, description: 'Hot summers, moderate rain' },
  Ranchi: { locationMultiplier: 1.18, weatherMultiplier: 0.22, description: 'Moderate monsoon risk' },
  Shimla: { locationMultiplier: 1.30, weatherMultiplier: 0.35, description: 'Landslide risk, heavy snowfall' },
  Srinagar: { locationMultiplier: 1.35, weatherMultiplier: 0.38, description: 'Heavy snowfall, flooding' },
  Dehradun: { locationMultiplier: 1.28, weatherMultiplier: 0.32, description: 'Landslide risk, heavy rains' },
};

export function calculatePremium(baseRate: number, city: string, workType: string): { base: number; locationRisk: number; weatherRisk: number; total: number } {
  const profile = cityRiskProfiles[city];
  const locMult = profile?.locationMultiplier || 1.0;
  const weatherMult = profile?.weatherMultiplier || 0.20;
  const workMult = workType === 'full-time' ? 1.0 : 0.7;
  const locationRisk = Math.round(baseRate * (locMult - 1));
  const weatherRisk = Math.round(baseRate * weatherMult);
  const total = Math.round((baseRate + locationRisk + weatherRisk) * workMult);
  return { base: baseRate, locationRisk, weatherRisk, total };
}
