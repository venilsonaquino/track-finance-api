import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';

export enum CategorySortableField {
  NAME = 'name',
  NOME = 'nome',
}

export enum CategoryOrderDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class FindCategoriesQueryDto {
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase())
  @IsEnum(CategorySortableField)
  orderBy?: CategorySortableField;

  @IsOptional()
  @Transform(({ value }) => value?.toUpperCase())
  @IsEnum(CategoryOrderDirection)
  direction?: CategoryOrderDirection;
}
