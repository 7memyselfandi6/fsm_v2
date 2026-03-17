import prisma from '../config/prisma.js';

export const getRegionalAllocationReport = async (seasonId?: string) => {
  const where: any = {};
  if (seasonId) where.seasonId = seasonId;

  const regions = await prisma.region.findMany({
    include: {
      zones: {
        include: {
          woredas: {
            include: {
              kebeles: {
                include: {
                  farmers: {
                    include: {
                      demands: {
                        where,
                        include: { fertilizerType: true }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  return regions.map(r => {
    const ureaAmount = 0; // Simplified for now
    const dapAmount = 0; // Simplified for now
    let totalRegionAmount = 0;

    const summary: Record<string, number> = {};
    r.zones.forEach(z => {
      z.woredas.forEach(w => {
        w.kebeles.forEach(k => {
          k.farmers.forEach(f => {
            f.demands.forEach(d => {
              const type = d.fertilizerType.name;
              summary[type] = (summary[type] || 0) + (d.regionAdjustedQuantity || d.originalQuantity);
              totalRegionAmount += (d.regionAdjustedQuantity || d.originalQuantity);
            });
          });
        });
      });
    });

    return {
      regionName: r.name,
      ureaAmount: summary['Urea'] || 0,
      dapAmount: summary['DAP'] || 0,
      totalAmount: totalRegionAmount,
      breakdown: summary
    };
  });
};

export const getUnionStockReport = async () => {
  return await prisma.union.findMany({
    include: {
      destinations: {
        include: {
          lotDispatches: {
            include: { lot: { include: { fertilizerType: true } } }
          }
        }
      }
    }
  });
};

export const getSoldFertilizerReport = async () => {
  const sales = await prisma.fertilizerSale.findMany({
    include: {
      fertilizerType: true,
      pc: true
    }
  });

  const summary = {
    totalSales: 0,
    ureaSales: 0,
    dapSales: 0,
    revenue: 0
  };

  sales.forEach(s => {
    summary.totalSales += s.quantity;
    summary.revenue += s.totalPrice;
    if (s.fertilizerType.name === 'Urea') summary.ureaSales += s.quantity;
    if (s.fertilizerType.name === 'DAP') summary.dapSales += s.quantity;
  });

  return { sales, summary };
};

export const exportToGoogleSheets = async (reportType: string) => {
  // Placeholder for Google Sheets integration
  return { message: `Report ${reportType} exported to Google Sheets` };
};
