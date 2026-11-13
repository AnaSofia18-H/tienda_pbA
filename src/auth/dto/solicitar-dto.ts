import { IsEmail, IsNotEmpty } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class SolicitarOtpDto {
    @ApiProperty({ description: 'Correo electrónico de la cuenta', example: 'ana@example.com', format: 'email' })
    @IsEmail()
    @IsNotEmpty()
    email!: string;
}
