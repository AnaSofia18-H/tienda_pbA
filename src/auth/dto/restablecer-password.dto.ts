import { IsEmail, IsNotEmpty, IsString, Length, Matches, MinLength } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class RestablecerPasswordDto {
    @ApiProperty({ description: 'Correo electrónico de la cuenta', example: 'ana@example.com', format: 'email' })
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @ApiProperty({ description: 'Código de 6 dígitos que llegó al correo', example: '482915' })
    @IsString()
    @Length(6, 6, { message: 'El código debe tener 6 dígitos' })
    @Matches(/^\d{6}$/, { message: 'El código solo puede tener números' })
    codigo!: string;

    @ApiProperty({ description: 'Nueva contraseña (mínimo 6 caracteres)', example: 'NuevaClave123', minLength: 6, format: 'password', writeOnly: true })
    @IsString()
    @MinLength(6)
    nuevaPassword!: string;
}
