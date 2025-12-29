import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { InstallmentContractModel } from './models/installment-contract.model';
import { InstallmentOccurrenceModel } from './models/installment-occurrence.model';
import { CreateInstallmentContractDto } from './dtos/create-Installment-contract.dto';
import { InstallmentContractStatus } from './enums/installment-contract-status.enum';
import { InstallmentOccurrenceStatus } from './enums/installment-occurrence-status.enum';
import { InstallmentInterval } from './enums/installment-interval.enum';


@Injectable()
export class InstallmentContractsService {
  constructor(
    private readonly sequelize: Sequelize,
    @InjectModel(InstallmentContractModel)
    private readonly contractRepo: typeof InstallmentContractModel,
    @InjectModel(InstallmentOccurrenceModel)
    private readonly occurrenceRepo: typeof InstallmentOccurrenceModel,
  ) {}

  async createContract(dto: CreateInstallmentContractDto) {
    const generateOccurrences = dto.generateOccurrences ?? true;

    return this.sequelize.transaction(async (t) => {
      const contract = await this.contractRepo.create(
        {
          userId: this.getUserIdOrThrow(), // 👈 adapte (JWT)
          walletId: dto.walletId,
          categoryId: dto.categoryId,
          description: dto.description,
          totalAmount: dto.totalAmount,
          installmentsCount: dto.installmentsCount,
          installmentInterval: dto.installmentInterval,
          firstDueDate: dto.firstDueDate,
          status: InstallmentContractStatus.Active,
        },
        { transaction: t },
      );

      let occurrences: InstallmentOccurrenceModel[] = [];

      if (generateOccurrences) {
        const perInstallmentAmount = this.calculateInstallmentAmount(
          dto.totalAmount,
          dto.installmentsCount,
        );

        const dueDates = this.generateDueDates(
          dto.firstDueDate,
          dto.installmentInterval,
          dto.installmentsCount,
        );

        occurrences = await this.occurrenceRepo.bulkCreate(
          dueDates.map((dueDate, idx) => ({
            contractId: contract.id,
            installmentIndex: idx + 1, // 1..N
            dueDate,
            amount: perInstallmentAmount,
            status: InstallmentOccurrenceStatus.Scheduled,
            transactionId: null,
          })),
          { transaction: t, returning: true },
        );
      }

      return {
        contract,
        occurrences,
      };
    });
  }

  // ✅ Melhor pegar do request (AuthGuard). Aqui é só placeholder.
  private getUserIdOrThrow(): string {
    // return req.user.id
    return 'TODO_USER_ID';
  }

  private calculateInstallmentAmount(totalAmount: string, installmentsCount: number): string {
    // estratégia simples: divide e arredonda 2 casas.
    // Obs: em produção, o ideal é distribuir os centavos na última parcela (ou primeiras).
    const totalCents = this.toCents(totalAmount);
    const per = Math.floor(totalCents / installmentsCount);
    return this.fromCents(per);
  }

  private toCents(value: string): number {
    const normalized = value.includes('.') ? value : `${value}.00`;
    const [intPart, decPartRaw] = normalized.split('.');
    const decPart = (decPartRaw ?? '00').padEnd(2, '0').slice(0, 2);
    return Number(intPart) * 100 + Number(decPart);
  }

  private fromCents(cents: number): string {
    const intPart = Math.floor(cents / 100);
    const decPart = String(cents % 100).padStart(2, '0');
    return `${intPart}.${decPart}`;
  }

  private generateDueDates(
    firstDueDate: string,
    interval: InstallmentInterval,
    count: number,
  ): string[] {
    const dates: string[] = [];
    const [y, m, d] = firstDueDate.split('-').map(Number);

    // usa Date UTC pra não sofrer com timezone local
    const base = new Date(Date.UTC(y, m - 1, d));

    for (let i = 0; i < count; i++) {
      const dt = new Date(base.getTime());

      switch (interval) {
        case InstallmentInterval.Daily:
          dt.setUTCDate(dt.getUTCDate() + i);
          break;
        case InstallmentInterval.Weekly:
          dt.setUTCDate(dt.getUTCDate() + i * 7);
          break;
        case InstallmentInterval.Monthly:
          dt.setUTCMonth(dt.getUTCMonth() + i);
          break;
        case InstallmentInterval.Yearly:
          dt.setUTCFullYear(dt.getUTCFullYear() + i);
          break;
      }

      dates.push(dt.toISOString().slice(0, 10));
    }

    return dates;
  }
}
