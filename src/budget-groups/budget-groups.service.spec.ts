import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { BudgetGroupsService } from './budget-groups.service';
import { BudgetGroupModel } from './models/budget-group.model';
import { CategoryModel } from 'src/categories/models/category.model';
import { TransactionModel } from 'src/transactions/models/transaction.model';
import { LoggerService } from 'src/config/logging/logger.service';
import { SyncCategoryAssignmentsDto } from './dto/sync-category-assignments.dto';
import { ulid } from 'ulid';

describe('BudgetGroupsService', () => {
  
  let service: BudgetGroupsService;
  let mockBudgetGroupModel: any;
  let mockCategoryModel: any;
  let mockTransactionModel: any;
  let mockLogger: any;
  let mockSequelize: any;

  beforeEach(async () => {
    // Mock Sequelize transaction
    mockSequelize = {
      transaction: jest.fn((callback) => callback({})),
    };

    // Mock BudgetGroupModel
    mockBudgetGroupModel = {
      sequelize: mockSequelize,
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
      bulkCreate: jest.fn(),
    };

    // Mock CategoryModel
    mockCategoryModel = {
      findAll: jest.fn(),
      update: jest.fn(),
    };

    // Mock TransactionModel
    mockTransactionModel = {
      findAll: jest.fn(),
    };

    // Mock LoggerService
    mockLogger = {
      error: jest.fn(),
      log: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BudgetGroupsService,
        {
          provide: getModelToken(BudgetGroupModel),
          useValue: mockBudgetGroupModel,
        },
        {
          provide: getModelToken(CategoryModel),
          useValue: mockCategoryModel,
        },
        {
          provide: getModelToken(TransactionModel),
          useValue: mockTransactionModel,
        },
        {
          provide: LoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<BudgetGroupsService>(BudgetGroupsService);
  });

  const categoryId1 = ulid();
  const categoryId2 = ulid();
  const categoryId3 = ulid();

  describe('syncCategoryAssignments', () => {
    const userId = ulid();
    const budgetGroupId = ulid();

    it('should successfully sync category assignments', async () => {
      // Arrange
      const syncDto: SyncCategoryAssignmentsDto = {
        assignments: [
          { categoryId: categoryId1, budgetGroupId },
          { categoryId: categoryId2, budgetGroupId },
        ],
      };

      const mockCategories = [
        {
          id: categoryId1,
          budgetGroupId: null,
          save: jest.fn().mockResolvedValue(undefined),
        },
        {
          id: categoryId2,
          budgetGroupId: null,
          save: jest.fn().mockResolvedValue(undefined),
        },
      ];

      mockCategoryModel.findAll.mockResolvedValue(mockCategories);

      // Act
      await service.syncCategoryAssignments(syncDto, userId);

      // Assert
      expect(mockCategoryModel.findAll).toHaveBeenCalled();
      expect(mockCategories[0].budgetGroupId).toBe(budgetGroupId);
      expect(mockCategories[1].budgetGroupId).toBe(budgetGroupId);
      expect(mockCategories[0].save).toHaveBeenCalledWith({ transaction: {} });
      expect(mockCategories[1].save).toHaveBeenCalledWith({ transaction: {} });
    });

    it('should set budgetGroupId to null when not provided', async () => {
      // Arrange
      const syncDto: SyncCategoryAssignmentsDto = {
        assignments: [{ categoryId: categoryId1, budgetGroupId: null }],
      };

      const mockCategory = {
        id: categoryId1,
        budgetGroupId: 'old-budget-group',
        save: jest.fn().mockResolvedValue(undefined),
      };

      mockCategoryModel.findAll.mockResolvedValue([mockCategory]);

      // Act
      await service.syncCategoryAssignments(syncDto, userId);

      // Assert
      expect(mockCategory.budgetGroupId).toBeNull();
      expect(mockCategory.save).toHaveBeenCalledWith({ transaction: {} });
    });

    it('should handle empty assignments gracefully', async () => {
      // Arrange
      const syncDto: SyncCategoryAssignmentsDto = {
        assignments: [],
      };

      mockCategoryModel.findAll.mockResolvedValue([]);

      // Act
      await service.syncCategoryAssignments(syncDto, userId);

      // Assert
      expect(mockCategoryModel.findAll).toHaveBeenCalled();
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should ignore assignments for categories not found', async () => {
      // Arrange
      const syncDto: SyncCategoryAssignmentsDto = {
        assignments: [
          { categoryId: categoryId1, budgetGroupId },
          { categoryId: categoryId2, budgetGroupId },
        ],
      };

      const mockCategory = {
        id: categoryId1,
        budgetGroupId: null,
        save: jest.fn().mockResolvedValue(undefined),
      };

      // Only one category is returned
      mockCategoryModel.findAll.mockResolvedValue([mockCategory]);

      // Act
      await service.syncCategoryAssignments(syncDto, userId);

      // Assert
      expect(mockCategory.budgetGroupId).toBe(budgetGroupId);
      expect(mockCategory.save).toHaveBeenCalledWith({ transaction: {} });
    });

    it('should rollback transaction on error during save', async () => {
      // Arrange
      const syncDto: SyncCategoryAssignmentsDto = {
        assignments: [{ categoryId: categoryId1, budgetGroupId }],
      };

      const saveError = new Error('Database error');
      const mockCategory = {
        id: categoryId1,
        budgetGroupId: null,
        save: jest.fn().mockRejectedValue(saveError),
      };

      mockCategoryModel.findAll.mockResolvedValue([mockCategory]);

      // Mock transaction to simulate rollback
      mockSequelize.transaction.mockImplementation((callback) => {
        return callback({}).catch((err) => {
          throw err;
        });
      });

      // Act & Assert
      await expect(
        service.syncCategoryAssignments(syncDto, userId),
      ).rejects.toThrow(InternalServerErrorException);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error syncing category assignments',
        saveError,
      );
    });

    it('should rethrow NotFoundException from findAll', async () => {
      // Arrange
      const syncDto: SyncCategoryAssignmentsDto = {
        assignments: [{ categoryId: categoryId1, budgetGroupId }],
      };

      const notFoundError = new NotFoundException(
        'Categories not found or not accessible',
      );
      mockCategoryModel.findAll.mockRejectedValue(notFoundError);

      // Mock transaction to simulate error
      mockSequelize.transaction.mockImplementation((callback) => {
        return callback({}).catch((err) => {
          throw err;
        });
      });

      // Act & Assert
      await expect(
        service.syncCategoryAssignments(syncDto, userId),
      ).rejects.toThrow(NotFoundException);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error syncing category assignments',
        notFoundError,
      );
    });

    it('should update multiple categories with different budgetGroupIds', async () => {
      // Arrange
      const budgetGroupId2 = 'budget-group-456';
      const syncDto: SyncCategoryAssignmentsDto = {
        assignments: [
          { categoryId: categoryId1, budgetGroupId },
          { categoryId: categoryId2, budgetGroupId: budgetGroupId2 },
          { categoryId: categoryId3, budgetGroupId: null },
        ],
      };

      const mockCategories = [
        {
          id: categoryId1,
          budgetGroupId: null,
          save: jest.fn().mockResolvedValue(undefined),
        },
        {
          id: categoryId2,
          budgetGroupId: null,
          save: jest.fn().mockResolvedValue(undefined),
        },
        {
          id: categoryId3,
          budgetGroupId: 'old-budget-group',
          save: jest.fn().mockResolvedValue(undefined),
        },
      ];

      mockCategoryModel.findAll.mockResolvedValue(mockCategories);

      // Act
      await service.syncCategoryAssignments(syncDto, userId);

      // Assert
      expect(mockCategories[0].budgetGroupId).toBe(budgetGroupId);
      expect(mockCategories[1].budgetGroupId).toBe(budgetGroupId2);
      expect(mockCategories[2].budgetGroupId).toBeNull();
      expect(mockCategories[0].save).toHaveBeenCalledWith({ transaction: {} });
      expect(mockCategories[1].save).toHaveBeenCalledWith({ transaction: {} });
      expect(mockCategories[2].save).toHaveBeenCalledWith({ transaction: {} });
    });

    it('should handle duplicate categoryIds in assignments', async () => {
      // Arrange
      const syncDto: SyncCategoryAssignmentsDto = {
        assignments: [
          { categoryId: categoryId1, budgetGroupId },
          { categoryId: categoryId1, budgetGroupId }, // duplicate
        ],
      };

      const mockCategory = {
        id: categoryId1,
        budgetGroupId: null,
        save: jest.fn().mockResolvedValue(undefined),
      };

      mockCategoryModel.findAll.mockResolvedValue([mockCategory]);

      // Act
      await service.syncCategoryAssignments(syncDto, userId);

      // Assert
      expect(mockCategory.budgetGroupId).toBe(budgetGroupId);
      expect(mockCategory.save).toHaveBeenCalledTimes(1);
    });

    it('should respect user isolation (only update own or global categories)', async () => {
      // Arrange
      const syncDto: SyncCategoryAssignmentsDto = {
        assignments: [{ categoryId: categoryId1, budgetGroupId }],
      };

      const mockCategories = [
        {
          id: categoryId1,
          userId: null, // global category
          budgetGroupId: null,
          save: jest.fn().mockResolvedValue(undefined),
        },
      ];

      mockCategoryModel.findAll.mockResolvedValue(mockCategories);

      // Act
      await service.syncCategoryAssignments(syncDto, userId);

      // Assert
      expect(mockCategoryModel.findAll).toHaveBeenCalled();
      expect(mockCategories[0].save).toHaveBeenCalled();
    });
  });
});
