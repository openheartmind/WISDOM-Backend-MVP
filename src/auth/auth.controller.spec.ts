import { Test, TestingModule } from '@nestjs/testing';
import {describe,beforeEach,it} from "vitest"
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from 'src/database/database.module';
import { AuthService } from './auth.service';
describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({isGlobal:true}),DatabaseModule],
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });


  it('controller should be defined', () => {
    expect(controller).toBeDefined();
  });
  
});