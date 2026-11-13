import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ description: 'Correo electrónico de la cuenta', example: 'ana@example.com', format: 'email' })
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @ApiProperty({ description: 'Contraseña de la cuenta', example: 'Secreto123', format: 'password', writeOnly: true })
    @IsNotEmpty()
    @IsString()
    password!: string;
}
