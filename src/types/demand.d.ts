export type DemandsResponse = {
  demands: DemandSummary[];
  pagination: Pagination;
};

export interface FertilizerBreakdown {
  type: string;
  originalAmount: number;
  adjustedAmount: number;
  fertilizerTypeId: string;
}

export interface DashboardSummaryOutput {
  woredaId: string;
  woredaName: string;
  productionSeason: string;
  totalAmount: number;
  totalAdjustedAmount: number;
  fertilizerBreakdown: Array<{
    type: string;
    originalAmount: number;
    adjustedAmount: number;
    fertilizerTypeId: string;
  }>;
}

export type Kebele = {
  kebele_of_origin_id: string;
  kebele_of_origin: string;
  totalAmount: number;
  totalAdjustedAmount: number;
  fertilizerBreakdown: FertilizerBreakdown[];
  fertilizer_totals: Record<string, number>;
};

export interface DemandSummary {
  woreda_of_origin_id: string | undefined;
  woreda_of_origin: string | undefined;
  region_of_origin_id: string;
  region_of_origin: string;
  zone_of_origin_id: string;
  zone_of_origin: string;
  productionSeason: string;
  totalAmount: number;
  totalAdjustedAmount: number;
  fertilizerBreakdown: FertilizerBreakdown[];
  fertilizer_totals: Record<string, number>;
  kebeles: Kebele[];
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
