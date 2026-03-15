import { z } from 'zod';

export const createRegionSchema = z.object({
  name: z.string().min(1, 'Region name is required'),
});

export const createZoneSchema = z.object({
  name: z.string().min(1, 'Zone name is required'),
  regionId: z.string().uuid('Invalid region ID'),
});

export const createWoredaSchema = z.object({
  name: z.string().min(1, 'Woreda name is required'),
  zoneId: z.string().uuid('Invalid zone ID'),
});

export const createKebeleSchema = z.object({
  name: z.string().min(1, 'Kebele name is required'),
  woredaId: z.string().uuid('Invalid woreda ID'),
});

export const createUnionSchema = z.object({
  name: z.string().min(1, 'Union name is required'),
  regionId: z.string().uuid('Invalid region ID'),
  zoneId: z.string().uuid('Invalid zone ID').optional(),
});

export const createDestinationSchema = z.object({
  name: z.string().min(1, 'Destination name is required'),
  unionId: z.string().uuid('Invalid union ID'),
});

export const createPCSchema = z.object({
  name: z.string().min(1, 'PC name is required'),
  kebeleId: z.string().uuid('Invalid kebele ID'),
  destinationId: z.string().uuid('Invalid destination ID'),
});
