import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export type MovementsTimelineView = 'realized' | 'future' | 'all';

export class MovementsMonthQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  year: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsOptional()
  @IsIn(['realized', 'future', 'all'])
  view?: MovementsTimelineView;
}
