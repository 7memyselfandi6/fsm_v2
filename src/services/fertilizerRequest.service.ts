import prisma from '../config/prisma.js';
import { validate as uuidValidate } from 'uuid';

// Helper to validate UUID format
const validateUuid = (uuid: string): boolean => {
  return uuidValidate(uuid);
};

// 1. Kebele Level Endpoint Service
export const getKebeleRequests = async (fertilizerTypeId: string) => {
  if (!validateUuid(fertilizerTypeId)) {
    throw new Error('Invalid fertilizer_type_id format');
  }

  const kebeles = await prisma.kebele.findMany({
    where: {
      farmers: {
        some: {
          demands: {
            some: {
              fertilizerTypeId: fertilizerTypeId,
            },
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  return kebeles.map(kebele => ({ kebele_id: kebele.id, name: kebele.name }));
};

// 2. Woreda Level Endpoint Service
export const getWoredaRequests = async (fertilizerTypeId: string) => {
  if (!validateUuid(fertilizerTypeId)) {
    throw new Error('Invalid fertilizer_type_id format');
  }

  const woredas = await prisma.woreda.findMany({
    where: {
      kebeles: {
        some: {
          farmers: {
            some: {
              demands: {
                some: {
                  fertilizerTypeId: fertilizerTypeId,
                },
              },
            },
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
      kebeles: {
        where: {
          farmers: {
            some: {
              demands: {
                some: {
                  fertilizerTypeId: fertilizerTypeId,
                },
              },
            },
          },
        },
        select: {
          id: true,
          name: true
        },
      },
    },
  });

  return woredas.map(woreda => ({
    woreda_id: woreda.id,
    name: woreda.name,
    kebeles: woreda.kebeles.map(kebele => ({
      kebele_id: kebele.id,
      name: kebele.name,
    })),
  }));
};

// 3. Zone Level Endpoint Service
export const getZoneRequests = async (fertilizerTypeId: string) => {
  if (!validateUuid(fertilizerTypeId)) {
    throw new Error('Invalid fertilizer_type_id format');
  }

  const zones = await prisma.zone.findMany({
    where: {
      woredas: {
        some: {
          kebeles: {
            some: {
              farmers: {
                some: {
                  demands: {
                    some: {
                      fertilizerTypeId: fertilizerTypeId,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
      woredas: {
        where: {
          kebeles: {
            some: {
              farmers: {
                some: {
                  demands: {
                    some: {
                      fertilizerTypeId: fertilizerTypeId,
                    },
                  },
                },
              },
            },
          },
        },
        select: {
          id: true,
          name: true,
          kebeles: {
            where: {
              farmers: {
                some: {
                  demands: {
                    some: {
                      fertilizerTypeId: fertilizerTypeId,
                    },
                  },
                },
              },
            },
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return zones.map(zone => ({
    zone_id: zone.id,
    name: zone.name,
    woredas: zone.woredas.map(woreda => ({
      woreda_id: woreda.id,
      name: woreda.name,
      kebeles: woreda.kebeles.map(kebele => ({
        kebele_id: kebele.id,
        name: kebele.name,
      })),
    })),
  }));
};

// 4. Region Level Endpoint Service
export const getRegionRequests = async (fertilizerTypeId: string) => {
  if (!validateUuid(fertilizerTypeId)) {
    throw new Error('Invalid fertilizer_type_id format');
  }

  const regions = await prisma.region.findMany({
    where: {
      zones: {
        some: {
          woredas: {
            some: {
              kebeles: {
                some: {
                  farmers: {
                    some: {
                      demands: {
                        some: {
                          fertilizerTypeId: fertilizerTypeId,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
      zones: {
        where: {
          woredas: {
            some: {
              kebeles: {
                some: {
                  farmers: {
                    some: {
                      demands: {
                        some: {
                          fertilizerTypeId: fertilizerTypeId,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        select: {
          id: true,
          name: true,
          woredas: {
            where: {
              kebeles: {
                some: {
                  farmers: {
                    some: {
                      demands: {
                        some: {
                          fertilizerTypeId: fertilizerTypeId,
                        },
                      },
                    },
                  },
                },
              },
            },
            select: {
              id: true,
              name: true,
              kebeles: {
                where: {
                  farmers: {
                    some: {
                      demands: {
                        some: {
                          fertilizerTypeId: fertilizerTypeId,
                        },
                      },
                    },
                  },
                },
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return regions.map(region => ({
    region_id: region.id,
    name: region.name,
    zones: region.zones.map(zone => ({
      zone_id: zone.id,
      name: zone.name,
      woredas: zone.woredas.map(woreda => ({
        woreda_id: woreda.id,
        name: woreda.name,
        kebeles: woreda.kebeles.map(kebele => ({
          kebele_id: kebele.id,
          name: kebele.name,
        })),
      })),
    })),
  }));
};

// 5. Federal Level Endpoint Service
export const getFederalRequests = async (fertilizerTypeId: string) => {
  if (!validateUuid(fertilizerTypeId)) {
    throw new Error('Invalid fertilizer_type_id format');
  }

  const regions = await prisma.region.findMany({
    where: {
      zones: {
        some: {
          woredas: {
            some: {
              kebeles: {
                some: {
                  farmers: {
                    some: {
                      demands: {
                        some: {
                          fertilizerTypeId: fertilizerTypeId,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
      zones: {
        where: {
          woredas: {
            some: {
              kebeles: {
                some: {
                  farmers: {
                    some: {
                      demands: {
                        some: {
                          fertilizerTypeId: fertilizerTypeId,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        select: {
          id: true,
          name: true,
          woredas: {
            where: {
              kebeles: {
                some: {
                  farmers: {
                    some: {
                      demands: {
                        some: {
                          fertilizerTypeId: fertilizerTypeId,
                        },
                      },
                    },
                  },
                },
              },
            },
            select: {
              id: true,
              name: true,
              kebeles: {
                where: {
                  farmers: {
                    some: {
                      demands: {
                        some: {
                          fertilizerTypeId: fertilizerTypeId,
                        },
                      },
                    },
                  },
                },
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return {
    federal_level: 'All Ethiopia',
    regions: regions.map(region => ({
      region_id: region.id,
      name: region.name,
      zones: region.zones.map(zone => ({
        zone_id: zone.id,
        name: zone.name,
        woredas: zone.woredas.map(woreda => ({
          woreda_id: woreda.id,
          name: woreda.name,
          kebeles: woreda.kebeles.map(kebele => ({
            kebele_id: kebele.id,
            name: kebele.name,
          })),
        })),
      })),
    })),
  };
};
