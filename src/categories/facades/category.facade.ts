import { Injectable } from '@nestjs/common';
import { CategoriesService } from '../categories.service';
import { CreateCategoryDto } from '../dto/create-category.dto';

@Injectable()
export class CategoryFacade {
  constructor(private readonly categoriesService: CategoriesService) {}

  async createCategory(category: CreateCategoryDto): Promise<void> {
    await this.categoriesService.create(category);
  }

  async findAllByUser(userId: string) {
    return this.categoriesService.findAllByUser(userId);
  }
}
