import { Injectable } from '@nestjs/common';
import { CreateBankAccountDto } from '../dto/create-bank-account.dto';
import { UpdateBankAccountDto } from '../dto/update-bank-account.dto';
import { BankAccountsRepository } from 'src/shared/database/repositories/bank-accounts.repositories';
import { ValidateBankAccountOwnershipService } from './validate-bank-account-ownership.service';

@Injectable()
export class BankAccountsService {
  constructor(
    private readonly bankAccountsRepository: BankAccountsRepository,
    private readonly validateBankAccountOwnershipService: ValidateBankAccountOwnershipService
  ) {}

  create(userId: string, createBankAccountDto: CreateBankAccountDto) {
    const { color, initialBalance, name, type } = createBankAccountDto;

    return this.bankAccountsRepository.create({
      data: {
        userId,
        color,
        initialBalance,
        name,
        type,
      },
    });
  }

  async findAllByUserId(userId: string) {
    const bankAccounts = await this.bankAccountsRepository.findMany({
      where: { userId },
      include: {
        transactions: {
          select: {
            type: true,
            value: true,
          }
        },
      }
    });

    return bankAccounts.map(({ transactions, ...bankAccount }) => {
      const totalTransactions = transactions.reduce(
        (acc, transaction) => 
          acc +
          (transaction.type === 'INCOME'
            ? transaction.value
            : -transaction.value),
        0,
      );

      const currentBalance = bankAccount.initialBalance + totalTransactions;

      return {
        ...bankAccount,
        currentBalance,
      }
    });
  }

  async update(userId: string, bankAccountId: string, updateBankAccountDto: UpdateBankAccountDto) {
    this.validateBankAccountOwnershipService.validate(userId, bankAccountId);
    const { color, initialBalance, name, type } = updateBankAccountDto;

    return this.bankAccountsRepository.update({
      where: { id: bankAccountId },
      data: {
        color,
        initialBalance,
        name,
        type,
      }
    });
  }

  async remove(userId: string, bankAccountId: string) {
    this.validateBankAccountOwnershipService.validate(userId, bankAccountId);

    await this.bankAccountsRepository.delete({
      where: { id: bankAccountId },
    });

    return null;
  }
}
