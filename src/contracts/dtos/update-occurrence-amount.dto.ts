import { IsString } from 'class-validator';

export class UpdateOccurrenceAmountDto {
  @IsString()
  amount: string;
}
