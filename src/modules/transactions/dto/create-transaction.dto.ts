import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString, IsUUID } from "class-validator";
import { TransactionType } from "../entities/Transactions";

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  bankAccoundId: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  value: number;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsEnum(TransactionType)
  type: TransactionType;
}
