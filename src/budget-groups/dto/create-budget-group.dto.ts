import { IsDefined, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBudgetGroupDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  color: string;

  @IsOptional()
  @IsString()
  userId: string;
}
