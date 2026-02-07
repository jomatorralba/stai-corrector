export type ScaleType = 'STATE' | 'TRAIT';

export type Gender = 'MALE' | 'FEMALE';
export type AgeGroup = 'ADOLESCENT' | 'ADULT';

export interface Interpretation {
  label: string;
  color: string; // Tailwind class
  description: string;
}

export interface NormResult {
  percentile: number;
  decatype: number;
}

export interface StaiResult {
  rawScoreState: number;
  rawScoreTrait: number;
  stateNorms: NormResult;
  traitNorms: NormResult;
}

export interface RangeConfig {
  min: number;
  max: number;
  label: string;
  color: string;
  description: string;
}
