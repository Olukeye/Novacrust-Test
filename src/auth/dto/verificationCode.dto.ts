 import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator"

 
 export class VerificationCodeDto {
  
    @IsString()
    userId:string

    @IsNotEmpty()
    code:string
  }