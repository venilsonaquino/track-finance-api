import { OnEvent } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';
import { UserCreatedEvent } from '../events/user-created.event';
import { CategoryFacade } from 'src/categories/facades/category.facade';
import { CreateCategoryDto } from 'src/categories/dto/create-category.dto';
import { BudgetGroupFacade } from 'src/budget-groups/facades/budget-group.facade';
import { SyncCategoryAssignmentsDto } from 'src/budget-groups/dto/sync-category-assignments.dto';

@Injectable()
export class CreateCategoriesListener {
  constructor(private readonly categoryFacade: CategoryFacade, private readonly budgetGroupFacade: BudgetGroupFacade) {}

  @OnEvent('user.created')
  async handleUserCreatedEvent(event: UserCreatedEvent) {
    const defaultCategories: CreateCategoryDto[] = [
      {
        name: 'Alimentação',
        description: 'Despesas com alimentação',
        icon: 'utensils',
        color: '#FF5733',
        userId: event.userId,
      },
      {
        name: 'Assinatura',
        description: 'Pagamentos recorrentes de assinaturas',
        icon: 'credit-card',
        color: '#2E86C1',
        userId: event.userId,
      },
      {
        name: 'Casa',
        description: 'Gastos relacionados à casa',
        icon: 'home',
        color: '#AF7AC5',
        userId: event.userId,
      },
      {
        name: 'Energia',
        description: 'Despesas com energia elétrica',
        icon: 'zap',
        color: '#F4D03F',
        userId: event.userId,
      },
      {
        name: 'Internet',
        description: 'Gastos com serviços de internet',
        icon: 'wifi',
        color: '#1ABC9C',
        userId: event.userId,
      },
      {
        name: 'Compras',
        description: 'Compras gerais',
        icon: 'shopping-bag',
        color: '#8E44AD',
        userId: event.userId,
      },
      {
        name: 'Educação',
        description: 'Despesas com educação',
        icon: 'book-open',
        color: '#3498DB',
        userId: event.userId,
      },
      {
        name: 'Eletrônicos',
        description: 'Gastos com eletrônicos e tecnologia',
        icon: 'monitor-smartphone',
        color: '#E74C3C',
        userId: event.userId,
      },
      {
        name: 'Jogos',
        description: 'Gastos com jogos e entretenimento digital',
        icon: 'gamepad-2',
        color: '#F39C12',
        userId: event.userId,
      },
      {
        name: 'Lazer',
        description: 'Despesas com lazer e hobbies',
        icon: 'smile',
        color: '#1E8449',
        userId: event.userId,
      },
      {
        name: 'Operação bancária',
        description: 'Taxas e despesas bancárias',
        icon: 'banknote',
        color: '#2C3E50',
        userId: event.userId,
      },
      {
        name: 'Outros',
        description: 'Gastos diversos não categorizados',
        icon: 'ellipsis',
        color: '#BDC3C7',
        userId: event.userId,
      },
      {
        name: 'Pix',
        description: 'Transferências via Pix',
        icon: 'send',
        color: '#2980B9',
        userId: event.userId,
      },
      {
        name: 'Presentes',
        description: 'Despesas com presentes',
        icon: 'gift',
        color: '#F1948A',
        userId: event.userId,
      },
      {
        name: 'Saúde',
        description: 'Despesas com saúde',
        icon: 'heart-pulse',
        color: '#E74C3C',
        userId: event.userId,
      },
      {
        name: 'Serviços',
        description: 'Gastos com serviços variados',
        icon: 'wrench',
        color: '#7D3C98',
        userId: event.userId,
      },
      {
        name: 'Streaming',
        description: 'Assinaturas de streaming',
        icon: 'tv',
        color: '#8E44AD',
        userId: event.userId,
      },
      {
        name: 'Supermercado',
        description: 'Compras de supermercado',
        icon: 'shopping-cart',
        color: '#D35400',
        userId: event.userId,
      },
      {
        name: 'Transporte',
        description: 'Despesas com transporte',
        icon: 'bus',
        color: '#5D6D7E',
        userId: event.userId,
      },
      {
        name: 'Vestuário',
        description: 'Gastos com roupas e acessórios',
        icon: 'shirt',
        color: '#C0392B',
        userId: event.userId,
      },
      {
        name: 'Viagem',
        description: 'Despesas relacionadas a viagens',
        icon: 'plane',
        color: '#3498DB',
        userId: event.userId,
      },
      {
       name: 'Salário',
       description: 'Recebimento de salário',
       icon: 'wallet',
       color: '#27AE60',
       userId: event.userId, 
      }
    ];

    for (const category of defaultCategories) {
      await this.categoryFacade.createCategory(category);
    }

    const receitaGroup = await this.budgetGroupFacade.findAllByUser(event.userId).then(groups => groups.find(g => g.title === 'RECEITAS'));
    if (receitaGroup) {
      const salarioCategory = await this.categoryFacade.findAllByUser(event.userId).then(categories => categories.find(c => c.name === 'Salário'));
      if (salarioCategory) {
        const syncDto: SyncCategoryAssignmentsDto = {
          assignments: [{ categoryId: salarioCategory.id, budgetGroupId: receitaGroup.id }]
        };
        await this.budgetGroupFacade.syncCategoryAssignments(syncDto, event.userId);
      }
    }
  }
}
