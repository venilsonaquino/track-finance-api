import { IsDateString, IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class UpdateTransactionDto {
  @IsNotEmpty()
  @IsDefined()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsDateString()
  depositedDate: string;

  @IsNotEmpty()
  @IsDefined()
  @IsString()
  categoryId: string;

  @IsNotEmpty()
  @IsDefined()
  @IsString()
  walletId: string;
}
