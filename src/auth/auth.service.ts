import { BadRequestException, Body, ForbiddenException, Injectable, NotFoundException , Param, Req, UnauthorizedException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from "bcrypt";
import { RegistrationDto, LoginDto } from './dto';
import {JwtService} from '@nestjs/jwt';
import { User } from '@prisma/client';
import { generateUniqueAccountNumber } from '../utils/uniqueIdGenerator'


@Injectable({})
export class AuthService {
  constructor(
    private prisma:PrismaService,
    private jwt:JwtService,
  ){}

  async register(data:RegistrationDto){

    return await this.prisma.$transaction(async(tx) => {
      const existingUser = await this.prisma.user.findUnique({where:{email:data.email}})
      if(existingUser) {
        throw new BadRequestException("User already exist")
      }
      
      const hash = await this.hashPassword(data.password);
      const user = await tx.user.create({
        data:{
          firstName:data.firstName,
          lastName:data.lastName,
          email:data.email,
          password:hash,
          phone:data.phone
        }
      });
      
    const accountName = `${user.firstName} ${user.lastName}`.trim();
    const accountNumber = generateUniqueAccountNumber();

      await tx.wallet.create({
        data:{
          userId: user.id,
          balance:0,
          currency: "USD",
          account_name:accountName,
          wallet_token: accountNumber
        }
      });


      const { password, ...result } = user;
      return {
        message:"User created successfully",
        data: result
      }
    })
  };

  
  async login(@Body() login:LoginDto){
    const user = await this.prisma.user.findUnique({
      where:{
        email:login.email
      }
    })
    if(!user){
      throw new ForbiddenException(`No user  found for: ${login.email}`)
    }
    const isValidPAss = bcrypt.compareSync(login.password, user.password)
    if(!isValidPAss){
      throw new ForbiddenException("invalid credential")
    }

    const token = await this.generateToken(user)

    const { password, createdAt, updatedAt, ...sanitizedUser } = user;

    return {
      user: sanitizedUser,
      ...token,
    };
  }

  private async generateToken(user: User){
    return {
      accessToken: this.generateAccessToken(user),
    }
  }

  private async hashPassword(password: string){
    return bcrypt.hashSync(password, 10)
  }

  private generateAccessToken(user:User){

    const payload = {
      sub: user.id, 
      email: user.email,
      expiresIn:  process.env.JWT_EXPIRES_IN,
    }

    return this.jwt.sign(payload);
  }

}