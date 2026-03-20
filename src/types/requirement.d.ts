export interface SeasonInput {
  seasonName: string;
  month: string;
}

export interface FertilizerInput {
  fertilizerTypeId: string;
  quantity: number;
}

export interface FarmerRequirementInput {
  seasons: SeasonInput[];
  fertilizers: FertilizerInput[];
  cropTypeIds: string[];
  uniqueFarmerId: string;
}

export interface FarmerRequirementResponse extends FarmerRequirementInput {}
