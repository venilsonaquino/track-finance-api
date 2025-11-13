import { Test, TestingModule } from '@nestjs/testing';
import { BudgetGroupsService } from '../../../../src/budget-groups/budget-groups.service';
import { getModelToken } from '@nestjs/sequelize';
import { BudgetGroupModel } from '../../../../src/budget-groups/models/budget-group.model';
import { UnprocessableEntityException } from '@nestjs/common';
import { LoggerService } from '../../../../src/config/logging/logger.service';
import { TransactionModel } from '../../../../src/transactions/models/transaction.model';
import { CategoryModel } from '../../../../src/categories/models/category.model';

describe('BudgetGroupsService - Position Validation', () => {
  let service: BudgetGroupsService;
  let mockModel: any;
  let mockTransaction: any;

  beforeEach(async () => {
    mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };

    mockModel = {
      findAll: jest.fn(),
      update: jest.fn(),
      sequelize: {
        transaction: jest.fn().mockResolvedValue(mockTransaction),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BudgetGroupsService,
        {
          provide: getModelToken(BudgetGroupModel),
          useValue: mockModel,
        },
        {
          provide: getModelToken(CategoryModel),
          useValue: {},
        },
        {
          provide: getModelToken(TransactionModel),
          useValue: {},
        },
        {
          provide: LoggerService,
          useValue: { error: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<BudgetGroupsService>(BudgetGroupsService);
  });

  describe('reorderGroups', () => {

  });
});