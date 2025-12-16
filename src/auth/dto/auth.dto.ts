import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class RegistrationDto {
    @IsNotEmpty()
    firstName: string;

    @IsNotEmpty()
    lastName:string

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsString()
    phone:string;
  }

  export class LoginDto {
    @IsEmail()
    @IsNotEmpty()
    email: string

    @IsString()
    @IsNotEmpty()
    password:string
  }

  export class User{
    id:string;
    email: string;
    firstName: string;
    lastName:string
  }