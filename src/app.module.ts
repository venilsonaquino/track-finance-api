import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CategoriesModule } from './categories/categories.module';
import { BudgetGroupsModule } from './budget-groups/budget-groups.module';
import { FilesModule } from './files/files.module';
import { WalletsModule } from './wallets/wallets.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerModule } from './config/logging/logger.module';
import { InstallmentsModule } from './Installments/installments.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    LoggerModule,
    HealthModule,
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      dialect: process.env.DB_DIALECT as any,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      models: [],
      define: {
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        paranoid: true,
      },
      autoLoadModels: true,
      synchronize: true,
      sync: {
        alter: true,
      },
      logging: false,
      benchmark: false,
      schema: process.env.SCHEMA,
      timezone: 'utc',
    }),
    AuthModule,
    UsersModule,
    TransactionsModule,
    CategoriesModule,
    BudgetGroupsModule,
    FilesModule,
    WalletsModule,
    InstallmentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
