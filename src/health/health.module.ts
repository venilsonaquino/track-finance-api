import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LoggerModule } from 'src/config/logging/logger.module';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [SequelizeModule.forFeature([]), LoggerModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
