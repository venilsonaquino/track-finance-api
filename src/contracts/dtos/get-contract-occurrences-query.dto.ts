import { IsNotEmpty, IsString, Matches, Validate } from 'class-validator';
import { IsFromBeforeTo } from '../validators/is-from-before-to.validator';

export class GetContractOccurrencesQueryDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'from must be in YYYY-MM-DD format',
  })
  from: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'to must be in YYYY-MM-DD format',
  })
  to: string;

  @Validate(IsFromBeforeTo, {
    message: '"from" must be <= "to".',
  })
  _rangeValidator?: unknown;
}
