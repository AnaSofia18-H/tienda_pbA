import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SolicitarOtpDto } from './dto/solicitar-dto';
import { RestablecerPasswordDto } from './dto/restablecer-password.dto';
import { LoginOtpDto } from './dto/login-otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import { UsuarioEntity } from '../usuarios/entities/usuario.entity';
import {
    ApiBearerAuth,
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiServiceUnavailableResponse,
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

    @Post('solicitar-otp')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Solicitar código OTP para iniciar sesión' })
    @ApiOkResponse({
        description: 'Código enviado al correo',
        schema: { example: { message: 'Código OTP enviado exitosamente al correo electrónico' } },
    })
    @ApiBadRequestResponse({ description: 'El correo no es válido' })
    @ApiUnauthorizedResponse({ description: 'Correo no registrado o cuenta inactiva' })
    solicitarOtp(@Body() solicitarOtpDto: SolicitarOtpDto) {
        return this.authService.solicitarCodigoOtp(solicitarOtpDto);
    }

    @Post('login-otp')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Iniciar sesión con código OTP' })
    @ApiOkResponse({
        description: 'Inicio de sesión exitoso',
        schema: { example: { message: 'Inicio de sesión exitoso', access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' } },
    })
    @ApiBadRequestResponse({ description: 'El correo o el código OTP no son válidos' })
    @ApiUnauthorizedResponse({ description: 'Código OTP inválido, expirado o cuenta inactiva' })
    loginOtp(@Body() loginOtpDto: LoginOtpDto) {
        return this.authService.loginOtp(loginOtpDto);
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

    @Post('recuperar-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Solicitar código para recuperar la contraseña',
        description: 'Envía al correo un código de 6 dígitos que vence en 10 minutos. Por seguridad responde lo mismo aunque el correo no exista.',
    })
    @ApiOkResponse({
        description: 'Solicitud recibida',
        schema: {
            example: {
                message: 'Si el correo está registrado, te enviamos un código para recuperar la contraseña',
            },
        },
    })
    @ApiBadRequestResponse({ description: 'El correo no tiene un formato válido' })
    @ApiServiceUnavailableResponse({ description: 'No se pudo enviar el correo' })
    recuperarPassword(@Body() solicitarOtpDto: SolicitarOtpDto) {
        return this.authService.solicitarRecuperacionPassword(solicitarOtpDto);
    }

    @Post('restablecer-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Cambiar la contraseña con el código del correo',
        description: 'Valida el código recibido por correo y guarda la nueva contraseña. El código solo sirve una vez.',
    })
    @ApiOkResponse({
        description: 'Contraseña actualizada',
        schema: { example: { message: 'Contraseña actualizada exitosamente' } },
    })
    @ApiBadRequestResponse({ description: 'Código inválido o vencido, o datos no válidos' })
    restablecerPassword(@Body() restablecerPasswordDto: RestablecerPasswordDto) {
        return this.authService.restablecerPassword(restablecerPasswordDto);
    }
}
