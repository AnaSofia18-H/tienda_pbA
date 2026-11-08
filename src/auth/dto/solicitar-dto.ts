import { IsEmail, IsNotEmpty } from "class-validator";

export class SolicitarOtpDto {
    @IsEmail()
    @IsNotEmpty()
    email!: string;
}