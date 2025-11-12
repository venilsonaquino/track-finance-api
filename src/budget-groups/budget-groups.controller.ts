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
  Patch,
} from '@nestjs/common';
import { BudgetGroupsService } from './budget-groups.service';
import { CreateBudgetGroupDto } from './dto/create-budget-group.dto';
import { UpdateBudgetGroupDto } from './dto/update-budget-group.dto';
import { SyncCategoryAssignmentsDto } from './dto/sync-category-assignments.dto';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { ReorderBudgetGroupsRequest } from './dto/reorder-budget-groups.dto';

@UseGuards(AuthGuard)
@Controller('budget-groups')
export class BudgetGroupsController {
  constructor(private readonly budgetGroupsService: BudgetGroupsService) {}

  @Post()
  async create(@Body() createDto: CreateBudgetGroupDto, @Request() req) {
    const { user } = req;
    createDto.userId = user.id;
    return await this.budgetGroupsService.create(createDto);
  }

  @Get('overview')
  async getBudgetOverview(
    @Request() req,
    @Query('year') year?: string
  ) {
    const { user } = req;
    const targetYear = year ? parseInt(year, 10) : 2025;
    return await this.budgetGroupsService.getBudgetOverview(user.id, targetYear);
  }

  @Get()
  async findAll(@Request() req) {
    const { user } = req;
    return await this.budgetGroupsService.findAllByUser(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const { user } = req;
    return await this.budgetGroupsService.findOne(id, user.id);
  }

  @Put('category-assignments')
  async syncCategoryAssignments(@Body() body: SyncCategoryAssignmentsDto, @Request() req) {
    const { user } = req;
    await this.budgetGroupsService.syncCategoryAssignments(body, user.id);
    return { success: true };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateBudgetGroupDto,
    @Request() req,
  ) {
    const { user } = req;
    updateDto.userId = user.id;
    return await this.budgetGroupsService.update(id, updateDto);
  }

  
  @Patch('reorder')
  async reorderGroups(@Body() reorderDto: ReorderBudgetGroupsRequest, @Request() req) {
    const { user } = req;
    return await this.budgetGroupsService.reorderGroups(user.id, reorderDto.groups);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const { user } = req;
    return await this.budgetGroupsService.remove(id, user.id);
  }

  @Patch(':id/rename')
  async updateGroupName(
    @Param('id') id: string,
    @Body('title') title: string,
    @Request() req,
  ) {
    const { user } = req;
    return await this.budgetGroupsService.updateGroupName(id, user.id, title);
  }
}
