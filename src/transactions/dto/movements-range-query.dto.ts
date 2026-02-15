import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';
import { MovementsTimelineView } from './movements-month-query.dto';

export class MovementsRangeQueryDto {
  @IsDateString(
    {},
    { message: 'Invalid start_date format. Expected format: YYYY-MM-DD' },
  )
  start_date: string;

  @IsDateString(
    {},
    { message: 'Invalid end_date format. Expected format: YYYY-MM-DD' },
  )
  end_date: string;

  @IsOptional()
  @IsIn(['realized', 'future', 'all'])
  view?: MovementsTimelineView;

  @IsOptional()
  @IsString()
  category_ids?: string;

  @IsOptional()
  @IsString()
  wallet_ids?: string;
}
