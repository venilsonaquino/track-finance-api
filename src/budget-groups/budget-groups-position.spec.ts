// import { Test, TestingModule } from '@nestjs/testing';
// import { BudgetGroupsService } from './budget-groups.service';
// import { getModelToken } from '@nestjs/sequelize';
// import { BudgetGroupModel } from './models/budget-group.model';
// import { CategoryModel } from '../categories/models/category.model';
// import { TransactionModel } from '../transactions/models/transaction.model';
// import { LoggerService } from '../config/logging/logger.service';
// import { UnprocessableEntityException } from '@nestjs/common';

// describe('BudgetGroupsService - Position Validation', () => {
//   let service: BudgetGroupsService;
//   let mockModel: any;
//   let mockTransaction: any;

//   beforeEach(async () => {
//     mockTransaction = {
//       commit: jest.fn(),
//       rollback: jest.fn(),
//     };

//     mockModel = {
//       findAll: jest.fn(),
//       update: jest.fn(),
//       sequelize: {
//         transaction: jest.fn().mockResolvedValue(mockTransaction),
//       },
//     };

//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         BudgetGroupsService,
//         {
//           provide: getModelToken(BudgetGroupModel),
//           useValue: mockModel,
//         },
//         {
//           provide: getModelToken(CategoryModel),
//           useValue: {},
//         },
//         {
//           provide: getModelToken(TransactionModel),
//           useValue: {},
//         },
//         {
//           provide: LoggerService,
//           useValue: { error: jest.fn() },
//         },
//       ],
//     }).compile();

//     service = module.get<BudgetGroupsService>(BudgetGroupsService);
//   });

//   describe('reorderGroups', () => {
//     it('deve permitir reordenar grupos normais', async () => {
//       // Arrange
//       mockModel.findAll.mockResolvedValue([
//         { id: 'saldo-id', title: 'SALDO', position: 1 },
//         { id: 'receitas-id', title: 'RECEITAS', position: 2 },
//       ]);

//       const groups = [
//         { id: 'normal-group-1', position: 3 },
//         { id: 'normal-group-2', position: 4 },
//       ];

//       // Act
//       const result = await service.reorderGroups('user-id', groups);

//       // Assert
//       expect(result.success).toBe(true);
//       expect(mockModel.update).toHaveBeenCalledTimes(2);
//       expect(mockTransaction.commit).toHaveBeenCalled();
//     });

//     it('deve rejeitar tentativa de mover SALDO da posição 1', async () => {
//       // Arrange
//       mockModel.findAll.mockResolvedValue([
//         { id: 'saldo-id', title: 'SALDO', position: 1 },
//       ]);

//       const groups = [
//         { id: 'saldo-id', position: 3 }, // Tentando mover SALDO
//       ];

//       // Act & Assert
//       await expect(service.reorderGroups('user-id', groups))
//         .rejects
//         .toThrow(UnprocessableEntityException);
      
//       expect(mockTransaction.rollback).toHaveBeenCalled();
//     });

//     it('deve rejeitar tentativa de mover RECEITAS da posição 2', async () => {
//       // Arrange
//       mockModel.findAll.mockResolvedValue([
//         { id: 'receitas-id', title: 'RECEITAS', position: 2 },
//       ]);

//       const groups = [
//         { id: 'receitas-id', position: 4 }, // Tentando mover RECEITAS
//       ];

//       // Act & Assert
//       await expect(service.reorderGroups('user-id', groups))
//         .rejects
//         .toThrow(UnprocessableEntityException);
      
//       expect(mockTransaction.rollback).toHaveBeenCalled();
//     });

//     it('deve rejeitar tentativa de colocar grupo normal na posição 1 (reservada para SALDO)', async () => {
//       // Arrange
//       mockModel.findAll.mockResolvedValue([
//         { id: 'saldo-id', title: 'SALDO', position: 1 },
//       ]);

//       const groups = [
//         { id: 'normal-group', position: 1 }, // Tentando usar posição do SALDO
//       ];

//       // Act & Assert
//       await expect(service.reorderGroups('user-id', groups))
//         .rejects
//         .toThrow(UnprocessableEntityException);
      
//       expect(mockTransaction.rollback).toHaveBeenCalled();
//     });

//     it('deve rejeitar tentativa de colocar grupo normal na posição 2 (reservada para RECEITAS)', async () => {
//       // Arrange
//       mockModel.findAll.mockResolvedValue([
//         { id: 'receitas-id', title: 'RECEITAS', position: 2 },
//       ]);

//       const groups = [
//         { id: 'normal-group', position: 2 }, // Tentando usar posição do RECEITAS
//       ];

//       // Act & Assert
//       await expect(service.reorderGroups('user-id', groups))
//         .rejects
//         .toThrow(UnprocessableEntityException);
      
//       expect(mockTransaction.rollback).toHaveBeenCalled();
//     });
//   });
// });