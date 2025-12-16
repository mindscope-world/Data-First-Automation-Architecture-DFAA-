export interface AssessmentQuestion {
  id: string;
  question: string;
  options: {
    value: number;
    label: string;
  }[];
}

export interface AssessmentResult {
  score: number;
  category: string;
  analysis: string;
  radarData: {
    subject: string;
    A: number;
    fullMark: number;
  }[];
}

export enum MaturityLevel {
  CHAOS = "Data Chaos",
  REACTIVE = "Reactive",
  DEFINED = "Defined",
  MANAGED = "Managed",
  OPTIMIZED = "Optimized (AI Ready)"
}

export interface ServicePhase {
  title: string;
  duration: string;
  price: string;
  features: string[];
  color: string;
}

export type DashboardTab = 'overview' | 'foundation' | 'intelligence' | 'automation' | 'governance' | 'value' | 'reliability' | 'security' | 'developer' | 'ai_console';

export interface UserData {
  name: string;
  email: string;
}

export interface AssessmentData {
  answers: Record<string, number>;
  score: number;
  report: string | null;
  user: UserData;
}