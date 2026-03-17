import { getEffectiveQty } from '../../src/services/demand.service';

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
