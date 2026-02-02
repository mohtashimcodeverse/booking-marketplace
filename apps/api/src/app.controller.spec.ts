import { Test, type TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = moduleRef.get(AppController);
  });

  describe('root', () => {
    it('should return root info', () => {
      const result = appController.getRoot();

      expect(result.ok).toBe(true);
      expect(result.service).toBe('booking-marketplace-api');
      expect(result.endpoints.health).toBe('/api/health');
    });
  });
});
