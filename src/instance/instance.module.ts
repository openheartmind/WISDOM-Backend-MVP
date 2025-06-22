import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { InstanceService } from './instance.service';
import { InstanceController } from './instance.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [InstanceController],
  providers: [InstanceService],
  imports: [AuthModule],
})
export class InstanceModule {}
