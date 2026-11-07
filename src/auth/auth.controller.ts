import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import { UsuarioEntity } from 'src/usuarios/entities/usuario.entity';
import {
    ApiBearerAuth,
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Autenticación')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @ApiOperation({ summary: 'Registrar un usuario' })
    @ApiCreatedResponse({
        description: 'Usuario registrado exitosamente',
        schema: {
            example: {
                message: 'Usuario registrado exitosamente',
                user: { id: 1, nombre: 'Ana Pérez', email: 'ana@example.com', rolId: 1 },
            },
        },
    })
    @ApiBadRequestResponse({ description: 'Los datos enviados no son válidos' })
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK) //200 en lugar de 201
    @ApiOperation({ summary: 'Iniciar sesión' })
    @ApiOkResponse({
        description: 'Inicio de sesión exitoso',
        schema: {
            example: {
                message: 'Inicio de Sesion exitoso',
                access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
        },
    })
    @ApiBadRequestResponse({ description: 'Los datos enviados no son válidos' })
    @ApiUnauthorizedResponse({ description: 'Credenciales inválidas o cuenta inactiva' })
    login(@Body() loginDto: LoginDto){
        return this.authService.login(loginDto)
    }

    //Crear la ruta de auth/perfil

    @Get('perfil')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('bearer')
    @ApiOperation({ summary: 'Obtener el perfil del usuario autenticado' })
    @ApiOkResponse({
        description: 'Perfil del usuario obtenido con éxito',
        schema: {
            example: {
                message: 'Perfil del usuario obtenido con exito',
                usuario: { id: 1, nombre: 'Ana Pérez', email: 'ana@example.com', activo: true, rolId: 1 },
            },
        },
    })
    @ApiUnauthorizedResponse({ description: 'Token ausente, inválido o expirado' })
    getPerfil(@GetUser() usuario: UsuarioEntity) {
        return {
            message: 'Perfil del usuario obtenido con exito',
            usuario
        }
    }
}
