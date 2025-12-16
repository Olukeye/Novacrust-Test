import { Controller, Post, HttpCode, HttpStatus, UseGuards, Body } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth-guard';
import { CurrentUser } from '../auth/decorator/current-user';
import { FundWalletDTO } from './dto';


@Controller('wallet')
export class WalletController {
   constructor(
    private readonly walletService: WalletService
  ){}

  
  @UseGuards(JwtAuthGuard)
  @Post("new-wallet")
  @HttpCode(HttpStatus.CREATED)
  async newWallet(
    @CurrentUser() user,
  ){
    const result = await this.walletService.createWallet(user.id)
    return  result;
  }

  @UseGuards(JwtAuthGuard)
  @Post("fund-wallet")
  @HttpCode(HttpStatus.CREATED)
  async fundWallet(
    @CurrentUser() user,
    @Body() data: FundWalletDTO
  ){
    const result = await this.walletService.fundWallet(user.id, data)
    return  result;
  }
}
