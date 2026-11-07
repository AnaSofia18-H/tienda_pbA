import { IsEmail, IsNotEmpty, IsNumber, IsString, Min, MinLength } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ description: 'Nombre del usuario', example: 'Ana Pérez' })
    @IsString()
    @IsNotEmpty()
    nombre!: string;

    @ApiProperty({ description: 'Correo electrónico', example: 'ana@example.com', format: 'email' })
    @IsString()
    @IsEmail()
    email!: string

    @ApiProperty({ description: 'Contraseña (mínimo 6 caracteres)', example: 'Secreto123', minLength: 6, format: 'password', writeOnly: true })
    @IsString()
    @MinLength(6)
    password!: string;

    @ApiProperty({ description: 'ID del rol asignado', example: 1, type: Number })
    @IsNumber()
    rolId!: number;


}