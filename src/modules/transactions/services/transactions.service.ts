import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
import { TransactionsRepository } from 'src/shared/database/repositories/transactions.repositories';
import { ValidateBankAccountOwnershipService } from '../../bank-accounts/services/validate-bank-account-ownership.service';
import { ValidateCategoryOwnershipService } from '../../categories/services/validate-category-ownership.service';
import { ValidateTransactionOwnershipService } from './validate-transaction-ownership.service';
import { TransactionType } from '../entities/Transactions';

@Injectable()
export class TransactionsService {
  constructor (
    private readonly transactionRepository: TransactionsRepository, 
    private readonly validateBankAccountOwnershipService: ValidateBankAccountOwnershipService,
    private readonly validateCategoryOwnershipService: ValidateCategoryOwnershipService,
    private readonly validateTransactionOwnershipService: ValidateTransactionOwnershipService,
  ) {}

  async create(userId: string, createTransactionDto: CreateTransactionDto) {
    const { bankAccountId, categoryId, date, name, type, value } = createTransactionDto;

    await this.validateEntitiesOwnership({
      userId, 
      bankAccountId,
      categoryId,
    });

    return this.transactionRepository.create({
      data: {
        userId,
        bankAccountId,
        categoryId,
        date,
        name,
        type,
        value,
      }
    })
  }

  findAllByUserId(userId: string, filters: { month: number, year: number, bankAccountId?: string, type?: TransactionType }) {
    return this.transactionRepository.findMany({
      where: { 
        userId,
        bankAccountId: filters.bankAccountId,
        type: filters.type,
        date: {
          gte: new Date(Date.UTC(filters.year, filters.month)),
          lt: new Date(Date.UTC(filters.year, filters.month + 1)),
        },
      },
    });
  }

  async update(
    userId: string, 
    transactionId: string, 
    updateTransactionDto: UpdateTransactionDto
  ) {
    const { bankAccountId, categoryId, date, name, type, value } = updateTransactionDto;

    await this.validateEntitiesOwnership({
      userId,
      bankAccountId,
      categoryId,
      transactionId,
    });

    return this.transactionRepository.update({
      where: { id: transactionId },
      data: {
        bankAccountId,
        categoryId,
        date,
        name,
        type,
        value,
      }
    })
  }
 
  async remove(userId: string, transactionId: string) {
    await this.validateEntitiesOwnership({ userId, transactionId });

    await this.transactionRepository.delete({
      where: { id: transactionId },
    });
  }

  private async validateEntitiesOwnership(
    { userId, bankAccountId, categoryId, transactionId }: 
    { userId: string; bankAccountId?: string; categoryId?: string, transactionId?: string }
  ) {
    transactionId && 
      await this.validateTransactionOwnershipService.validate(
        userId,
        transactionId,
      ),

    bankAccountId && 
      await this.validateBankAccountOwnershipService.validate(
        userId, bankAccountId
      );

    categoryId && 
      await this.validateCategoryOwnershipService.validate(
        userId, 
        categoryId
      );
  }
}
