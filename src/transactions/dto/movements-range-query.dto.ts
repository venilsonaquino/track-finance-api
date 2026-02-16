import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';
import { MovementsTimelineView } from './movements-month-query.dto';

export class MovementsRangeQueryDto {
  @IsDateString(
    { strict: true, strictSeparator: true },
    { message: 'Invalid start_date. Expected a valid date in YYYY-MM-DD.' },
  )
  start_date: string;

  @IsDateString(
    { strict: true, strictSeparator: true },
    { message: 'Invalid end_date. Expected a valid date in YYYY-MM-DD.' },
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
