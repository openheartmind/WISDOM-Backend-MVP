import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { TestDatabaseModule } from '../../test/database-testing.module';
import { createTestingModule } from '../../test/test-utils';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestDatabaseModule],
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});