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
} from '@nestjs/common';
import { BudgetGroupsService } from './budget-groups.service';
import { CreateBudgetGroupDto } from './dto/create-budget-group.dto';
import { UpdateBudgetGroupDto } from './dto/update-budget-group.dto';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';

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

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const { user } = req;
    return await this.budgetGroupsService.remove(id, user.id);
  }
}
