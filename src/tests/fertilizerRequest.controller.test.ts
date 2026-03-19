import request from 'supertest';
import express from 'express';
import {
  getKebeleRequestsController,
  getWoredaRequestsController,
  getZoneRequestsController,
  getRegionRequestsController,
  getFederalRequestsController,
} from '../controllers/fertilizerRequest.controller.js';
import * as fertilizerRequestService from '../services/fertilizerRequest.service.js';

const app = express();
app.use(express.json());

// Mock the service layer
jest.mock('../services/fertilizerRequest.service');

// Setup routes for testing
app.get('/api/fertilizer-requests/kebele/:fertilizer_type_id', getKebeleRequestsController);
app.get('/api/fertilizer-requests/woreda/:fertilizer_type_id', getWoredaRequestsController);
app.get('/api/fertilizer-requests/zone/:fertilizer_type_id', getZoneRequestsController);
app.get('/api/fertilizer-requests/region/:fertilizer_type_id', getRegionRequestsController);
app.get('/api/fertilizer-requests/federal/:fertilizer_type_id', getFederalRequestsController);

describe('Fertilizer Request Endpoints', () => {
  const validFertilizerTypeId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  const invalidFertilizerTypeId = 'invalid-uuid';
  const nonExistentFertilizerTypeId = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Kebele Level Endpoint Tests
  describe('GET /api/fertilizer-requests/kebele/:fertilizer_type_id', () => {
    test('should return 200 and a list of kebeles for a valid ID', async () => {
      const mockKebeles = [{ kebele_id: 'uuid-kebele-1', name: 'Kebele A' }];
      (fertilizerRequestService.getKebeleRequests as jest.Mock).mockResolvedValue(mockKebeles);

      const res = await request(app).get(`/api/fertilizer-requests/kebele/${validFertilizerTypeId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockKebeles);
      expect(fertilizerRequestService.getKebeleRequests).toHaveBeenCalledWith(validFertilizerTypeId);
    });

    test('should return 200 and empty array if no kebeles found', async () => {
      (fertilizerRequestService.getKebeleRequests as jest.Mock).mockResolvedValue([]);

      const res = await request(app).get(`/api/fertilizer-requests/kebele/${nonExistentFertilizerTypeId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([]);
    });

    test('should return 400 for invalid fertilizer_type_id format', async () => {
      (fertilizerRequestService.getKebeleRequests as jest.Mock).mockRejectedValue(new Error('Invalid fertilizer_type_id format'));

      const res = await request(app).get(`/api/fertilizer-requests/kebele/${invalidFertilizerTypeId}`);
      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ message: 'Invalid fertilizer_type_id format' });
    });

    test('should return 400 for other service errors', async () => {
      (fertilizerRequestService.getKebeleRequests as jest.Mock).mockRejectedValue(new Error('Database error'));

      const res = await request(app).get(`/api/fertilizer-requests/kebele/${validFertilizerTypeId}`);
      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ message: 'Database error' });
    });
  });

  // Woreda Level Endpoint Tests
  describe('GET /api/fertilizer-requests/woreda/:fertilizer_type_id', () => {
    test('should return 200 and a list of woredas for a valid ID', async () => {
      const mockWoredas = [{
        woreda_id: 'uuid-woreda-1',
        name: 'Woreda X',
        kebeles: [{ kebele_id: 'uuid-kebele-1', name: 'Kebele A' }],
      }];
      (fertilizerRequestService.getWoredaRequests as jest.Mock).mockResolvedValue(mockWoredas);

      const res = await request(app).get(`/api/fertilizer-requests/woreda/${validFertilizerTypeId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockWoredas);
      expect(fertilizerRequestService.getWoredaRequests).toHaveBeenCalledWith(validFertilizerTypeId);
    });

    test('should return 200 and empty array if no woredas found', async () => {
      (fertilizerRequestService.getWoredaRequests as jest.Mock).mockResolvedValue([]);

      const res = await request(app).get(`/api/fertilizer-requests/woreda/${nonExistentFertilizerTypeId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([]);
    });

    test('should return 400 for invalid fertilizer_type_id format', async () => {
      (fertilizerRequestService.getWoredaRequests as jest.Mock).mockRejectedValue(new Error('Invalid fertilizer_type_id format'));

      const res = await request(app).get(`/api/fertilizer-requests/woreda/${invalidFertilizerTypeId}`);
      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ message: 'Invalid fertilizer_type_id format' });
    });
  });

  // Zone Level Endpoint Tests
  describe('GET /api/fertilizer-requests/zone/:fertilizer_type_id', () => {
    test('should return 200 and a list of zones for a valid ID', async () => {
      const mockZones = [{
        zone_id: 'uuid-zone-1',
        name: 'Zone P',
        woredas: [{
          woreda_id: 'uuid-woreda-1',
          name: 'Woreda X',
          kebeles: [{ kebele_id: 'uuid-kebele-1', name: 'Kebele A' }],
        }],
      }];
      (fertilizerRequestService.getZoneRequests as jest.Mock).mockResolvedValue(mockZones);

      const res = await request(app).get(`/api/fertilizer-requests/zone/${validFertilizerTypeId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockZones);
      expect(fertilizerRequestService.getZoneRequests).toHaveBeenCalledWith(validFertilizerTypeId);
    });

    test('should return 200 and empty array if no zones found', async () => {
      (fertilizerRequestService.getZoneRequests as jest.Mock).mockResolvedValue([]);

      const res = await request(app).get(`/api/fertilizer-requests/zone/${nonExistentFertilizerTypeId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([]);
    });

    test('should return 400 for invalid fertilizer_type_id format', async () => {
      (fertilizerRequestService.getZoneRequests as jest.Mock).mockRejectedValue(new Error('Invalid fertilizer_type_id format'));

      const res = await request(app).get(`/api/fertilizer-requests/zone/${invalidFertilizerTypeId}`);
      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ message: 'Invalid fertilizer_type_id format' });
    });
  });

  // Region Level Endpoint Tests
  describe('GET /api/fertilizer-requests/region/:fertilizer_type_id', () => {
    test('should return 200 and a list of regions for a valid ID', async () => {
      const mockRegions = [{
        region_id: 'uuid-region-1',
        name: 'Region Q',
        zones: [{
          zone_id: 'uuid-zone-1',
          name: 'Zone P',
          woredas: [{
            woreda_id: 'uuid-woreda-1',
            name: 'Woreda X',
            kebeles: [{ kebele_id: 'uuid-kebele-1', name: 'Kebele A' }],
          }],
        }],
      }];
      (fertilizerRequestService.getRegionRequests as jest.Mock).mockResolvedValue(mockRegions);

      const res = await request(app).get(`/api/fertilizer-requests/region/${validFertilizerTypeId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockRegions);
      expect(fertilizerRequestService.getRegionRequests).toHaveBeenCalledWith(validFertilizerTypeId);
    });

    test('should return 200 and empty array if no regions found', async () => {
      (fertilizerRequestService.getRegionRequests as jest.Mock).mockResolvedValue([]);

      const res = await request(app).get(`/api/fertilizer-requests/region/${nonExistentFertilizerTypeId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([]);
    });

    test('should return 400 for invalid fertilizer_type_id format', async () => {
      (fertilizerRequestService.getRegionRequests as jest.Mock).mockRejectedValue(new Error('Invalid fertilizer_type_id format'));

      const res = await request(app).get(`/api/fertilizer-requests/region/${invalidFertilizerTypeId}`);
      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ message: 'Invalid fertilizer_type_id format' });
    });
  });

  // Federal Level Endpoint Tests
  describe('GET /api/fertilizer-requests/federal/:fertilizer_type_id', () => {
    test('should return 200 and federal data for a valid ID', async () => {
      const mockFederal = {
        federal_level: 'All Ethiopia',
        regions: [{
          region_id: 'uuid-region-1',
          name: 'Region Q',
          zones: [{
            zone_id: 'uuid-zone-1',
            name: 'Zone P',
            woredas: [{
              woreda_id: 'uuid-woreda-1',
              name: 'Woreda X',
              kebeles: [{ kebele_id: 'uuid-kebele-1', name: 'Kebele A' }],
            }],
          }],
        }],
      };
      (fertilizerRequestService.getFederalRequests as jest.Mock).mockResolvedValue(mockFederal);

      const res = await request(app).get(`/api/fertilizer-requests/federal/${validFertilizerTypeId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockFederal);
      expect(fertilizerRequestService.getFederalRequests).toHaveBeenCalledWith(validFertilizerTypeId);
    });

    test('should return 200 and empty federal data if no requests found', async () => {
      const emptyFederal = {
        federal_level: 'All Ethiopia',
        regions: [],
      };
      (fertilizerRequestService.getFederalRequests as jest.Mock).mockResolvedValue(emptyFederal);

      const res = await request(app).get(`/api/fertilizer-requests/federal/${nonExistentFertilizerTypeId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(emptyFederal);
    });

    test('should return 400 for invalid fertilizer_type_id format', async () => {
      (fertilizerRequestService.getFederalRequests as jest.Mock).mockRejectedValue(new Error('Invalid fertilizer_type_id format'));

      const res = await request(app).get(`/api/fertilizer-requests/federal/${invalidFertilizerTypeId}`);
      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ message: 'Invalid fertilizer_type_id format' });
    });
  });
});