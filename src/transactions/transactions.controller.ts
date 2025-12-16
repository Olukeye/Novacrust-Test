import { Controller, Post, HttpCode, HttpStatus, UseGuards, Body, Get } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth-guard';
import { CurrentUser } from '../auth/decorator/current-user';

@Controller('transactions')
export class TransactionsController {
     constructor(
      private readonly transactionService: TransactionsService
    ){}
  
    @UseGuards(JwtAuthGuard)
    @Get("history")
    @HttpCode(HttpStatus.OK)
    async getProfile(@CurrentUser() user){
      const result = await this.transactionService.getTransactionHistory(user.id)
      return  result;
    }
}
