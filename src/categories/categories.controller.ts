import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Put,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import {
  FindCategoriesQueryDto,
} from './dto/find-categories-query.dto';

@UseGuards(AuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto, @Request() req) {
    const { user } = req;
    createCategoryDto.userId = user.id;
    return await this.categoriesService.create(createCategoryDto);
  }

  @Get()
  async findAll(
    @Request() req,
    @Query() query: FindCategoriesQueryDto,
  ) {
    const { user } = req;
    return await this.categoriesService.findAllByUser(
      user.id,
      query.orderBy,
      query.direction,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const { user } = req;
    return await this.categoriesService.findOne(id, user.id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Request() req,
  ) {
    const { user } = req;
    updateCategoryDto.userId = user.id;
    return await this.categoriesService.update(id, updateCategoryDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const { user } = req;
    return await this.categoriesService.remove(id, user.id);
  }
}
