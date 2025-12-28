import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { LoggerService } from 'src/config/logging/logger.service';

@Injectable()
export class HealthService {
  constructor(
    @InjectConnection()
    private readonly sequelize: Sequelize,
    @Inject(LoggerService)
    private readonly logger: LoggerService,
  ) {}

  async check() {
    const timestamp = new Date().toISOString();

    try {
      await this.sequelize.authenticate();

      return {
        status: 'ok',
        info: {
          app: 'up',
          database: 'up',
        },
        timestamp,
      };
    } catch (error) {
      this.logger.error(
        'Database health check failed',
        error?.stack ?? String(error),
        'HealthService',
      );

      throw new ServiceUnavailableException({
        status: 'error',
        info: {
          app: 'up',
          database: 'down',
        },
        timestamp,
      });
    }
  }
}
