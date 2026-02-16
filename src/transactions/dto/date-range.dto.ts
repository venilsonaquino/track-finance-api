import { IsDateString, IsOptional, IsString } from 'class-validator';

export class DateRangeDto {
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
  @IsString()
  category_ids: string;

  @IsOptional()
  @IsString()
  wallet_ids: string;
}
