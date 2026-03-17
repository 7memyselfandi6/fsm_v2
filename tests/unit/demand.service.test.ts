import { getEffectiveQty, mapLotResponse, validateLotData } from '../../src/services/demand.service';

describe('getEffectiveQty', () => {
  it('should return moaAdjustedQuantity if present', () => {
    const demand = {
      moaAdjustedQuantity: 100,
      regionAdjustedQuantity: 80,
      originalQuantity: 50
    };
    expect(getEffectiveQty(demand)).toBe(100);
  });

  it('should return regionAdjustedQuantity if moa is missing', () => {
    const demand = {
      regionAdjustedQuantity: 80,
      zoneAdjustedQuantity: 70,
      originalQuantity: 50
    };
    expect(getEffectiveQty(demand)).toBe(80);
  });

  it('should return zoneAdjustedQuantity if moa and region are missing', () => {
    const demand = {
      zoneAdjustedQuantity: 70,
      woredaAdjustedQuantity: 60,
      originalQuantity: 50
    };
    expect(getEffectiveQty(demand)).toBe(70);
  });

  it('should return originalQuantity if all adjustments are missing', () => {
    const demand = {
      originalQuantity: 50
    };
    expect(getEffectiveQty(demand)).toBe(50);
  });
});

describe('mapLotResponse', () => {
  it('should return "Urea" if only ureaAmount is positive', () => {
    const lot = { id: 'lot-1', lotNumber: 1, ureaAmount: 100, dapAmount: 0 };
    const result = mapLotResponse(lot);
    expect(result.fertilizerType).toBe('Urea');
    expect(result.totalFertilizerAmount).toBe('100 Qt');
  });

  it('should return "DAP" if only dapAmount is positive', () => {
    const lot = { id: 'lot-2', lotNumber: 2, ureaAmount: 0, dapAmount: 150 };
    const result = mapLotResponse(lot);
    expect(result.fertilizerType).toBe('DAP');
    expect(result.totalFertilizerAmount).toBe('150 Qt');
  });

  it('should return "Urea & DAP" if both amounts are positive', () => {
    const lot = { id: 'lot-3', lotNumber: 3, ureaAmount: 100, dapAmount: 50 };
    const result = mapLotResponse(lot);
    expect(result.fertilizerType).toBe('Urea & DAP');
    expect(result.totalFertilizerAmount).toBe('150 Qt');
  });

  it('should return "None" if both amounts are zero or negative', () => {
    const lot = { id: 'lot-4', lotNumber: 4, ureaAmount: 0, dapAmount: 0 };
    const result = mapLotResponse(lot);
    expect(result.fertilizerType).toBe('None');
    expect(result.totalFertilizerAmount).toBe('0 Qt');
  });

  it('should correctly sum ureaAmount and dapAmount for totalFertilizerAmount', () => {
    const lot = { id: 'lot-5', lotNumber: 5, ureaAmount: 123.45, dapAmount: 67.89 };
    const result = mapLotResponse(lot);
    expect(result.totalFertilizerAmount).toBe('191.34 Qt');
  });
});

describe('validateLotData', () => {
  it('should not throw for consistent data', () => {
    expect(() => validateLotData({ ureaAmount: 100, dapAmount: 50, totalQuantity: 150 })).not.toThrow();
  });

  it('should throw error for negative amounts', () => {
    expect(() => validateLotData({ ureaAmount: -10, dapAmount: 50, totalQuantity: 40 })).toThrow('Fertilizer amounts cannot be negative');
  });

  it('should throw error for inconsistent total quantity', () => {
    expect(() => validateLotData({ ureaAmount: 100, dapAmount: 50, totalQuantity: 200 })).toThrow('Total quantity must be the sum of urea and dap amounts');
  });
});
