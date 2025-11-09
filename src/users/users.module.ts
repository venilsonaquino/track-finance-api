import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserModel } from './models/user.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { CreateCategoriesListener } from './listeners/create-categories.listener';
import { CreateBudgetGroupsListener } from './listeners/create-budget-groups.listener';
import { CategoriesModule } from 'src/categories/categories.module';
import { WalletsModule } from 'src/wallets/wallets.module';
import { CreateWalletListener } from './listeners/create-wallet.listener';
import { MailModule } from 'src/shared/mail/mail.module';
import { LoggerModule } from '../config/logging/logger.module';
import { BudgetGroupsModule } from 'src/budget-groups/budget-groups.module';

@Module({
  imports: [
  SequelizeModule.forFeature([UserModel]),
  LoggerModule,
  CategoriesModule,
  WalletsModule,
  MailModule,
  BudgetGroupsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, CreateCategoriesListener, CreateWalletListener, CreateBudgetGroupsListener],
  exports: [UsersService],
})
export class UsersModule {}
