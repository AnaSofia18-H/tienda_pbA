import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';

export class LoginOtpDto {
    @ApiProperty({ description: 'Correo electrónico de la cuenta', example: 'ana@example.com', format: 'email' })
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @ApiProperty({ description: 'Código OTP de 6 dígitos enviado al correo', example: '123456' })
    @IsNotEmpty()
    @Length(6, 6)
    @Matches(/^\d{6}$/)
    otpCode!: string;
}