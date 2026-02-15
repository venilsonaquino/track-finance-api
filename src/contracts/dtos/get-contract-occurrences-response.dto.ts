import { ContractOccurrenceDto } from './contract-occorence.dto';

export class GetContractOccurrencesResponseDto {
  contractId: string;
  period: {
    from: string;
    to: string;
  };
  items: ContractOccurrenceDto[];
}
