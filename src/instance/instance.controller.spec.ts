import { Test, TestingModule } from '@nestjs/testing';
import { InstanceController } from './instance.controller';
import { InstanceService } from './instance.service';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DatabaseModule } from 'src/database/database.module';

describe('InstanceController', () => {
  let controller: InstanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      controllers: [InstanceController],
      providers: [InstanceService, NodePgDatabase],
    }).compile();

    controller = module.get<InstanceController>(InstanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
