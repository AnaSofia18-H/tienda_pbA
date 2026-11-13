import { BadRequestException, Injectable, Logger, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UsuariosService } from '../usuarios/usuarios.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { SolicitarOtpDto } from './dto/solicitar-dto';
import { RestablecerPasswordDto } from './dto/restablecer-password.dto';
import { LoginOtpDto } from './dto/login-otp.dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly usuariosService: UsuariosService,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService,

    ) {} //Inyectamos el servicio de usuarios para poder crear un usuario en la base de datos

    async register(registerDto: RegisterDto) {
        const saltRounds = 10; //Número de rondas de sal para el hash de la contraseña
        const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds); //Hasheamos la contraseña del usuario
        const newUser = await this.usuariosService.createUsuario({
            ...registerDto,
            password: hashedPassword
        })
        return {
            message: 'Usuario registrado exitosamente',
            user: newUser
        }
    }

    async login(loginDto: LoginDto) {
        //1. Validar Correo
        const usuario = await this.usuariosService.findByEmail(loginDto.email, true)

        if(!usuario){
            throw new UnauthorizedException('Credenciales invalidas el correo no existe')
        }

        //2. Validar que la cuenta este activa
        if(!usuario.activo) {
            throw new UnauthorizedException ('La cuenta del usuario no se encuentra activa')
        }

        //3. Comparar la contraseña enviada con el hash de la bd
        const passwordValido = await bcrypt.compare(
            loginDto.password,
            usuario.password
        )


        if(!passwordValido){
            throw new UnauthorizedException('Credenciales invalidas la contraseña es incorrecta')
        }

        //4. Crear el payload del JWT
        const payload = {
            sub: usuario.id,
            email: usuario.email,
            rol: usuario.rol?.nombre
        }

        //5. Firmar el token
        const token = await this.jwtService.signAsync(payload)

        return {
            message: 'Inicio de Sesion exitoso',
            access_token: token,
        }
    }

    //Primer paso crear el metodo para solicitar codigo otp
    async solicitarCodigoOtp(solicitarOtpDto: SolicitarOtpDto): Promise<{ message: string }> {
        //1. Buscar el usuario por correo electrónico
        const usuario = await this.usuariosService.findByEmail(solicitarOtpDto.email);
        if (!usuario) {
            throw new UnauthorizedException('El correo electrónico no está registrado');
        }

        //2. Validar que la cuenta esté activa
        if (!usuario.activo) {
            throw new UnauthorizedException('La cuenta del usuario no se encuentra activa');
        }

        //3. Generar un código OTP de 6 dígitos
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        //4. Establecer la fecha de expiración del código OTP (10 minutos a partir de ahora)
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos en milisegundos

        //5. Guardar el código OTP y la fecha de expiración en la base de datos
        await this.usuariosService.saveOtpCode(usuario.id, otpCode, otpExpiresAt);

        //6. Enviar el código OTP por correo electrónico
        try {
            await this.mailService.sendOtpEmail(usuario.email, otpCode);
        } catch (error) {
            this.logger.error(`Error al enviar el correo: ${(error as NodeJS.ErrnoException).code ?? ''} ${(error as Error).message}`, (error as Error).stack);
            throw new ServiceUnavailableException('No se pudo enviar el correo, intenta de nuevo en unos minutos');
        }

        return {
            message: 'Código OTP enviado exitosamente al correo electrónico',
        }

    }

    async solicitarRecuperacionPassword(solicitarOtpDto: SolicitarOtpDto): Promise<{ message: string }> {
        const respuesta = {
            message: 'Si el correo está registrado, te enviamos un código para recuperar la contraseña',
        };

        const usuario = await this.usuariosService.findByEmail(solicitarOtpDto.email);
        if (!usuario || !usuario.activo) {
            return respuesta;
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await this.usuariosService.saveOtpCode(usuario.id, otpCode, otpExpiresAt);

        try {
            await this.mailService.sendRecuperacionEmail(usuario.email, otpCode);
        } catch (error) {
            this.logger.error(`Error al enviar el correo: ${(error as NodeJS.ErrnoException).code ?? ''} ${(error as Error).message}`, (error as Error).stack);
            throw new ServiceUnavailableException('No se pudo enviar el correo, revisa la configuración MAIL del .env');
        }

        return respuesta;
    }

    async restablecerPassword(restablecerPasswordDto: RestablecerPasswordDto): Promise<{ message: string }> {
        const usuario = await this.usuariosService.findByEmail(restablecerPasswordDto.email);

        if (!usuario || !usuario.otpCode || !usuario.otpExpiresAt) {
            throw new BadRequestException('Código inválido o vencido');
        }

        if (new Date(usuario.otpExpiresAt).getTime() < Date.now()) {
            throw new BadRequestException('Código inválido o vencido');
        }

        if (usuario.otpCode !== restablecerPasswordDto.codigo) {
            throw new BadRequestException('Código inválido o vencido');
        }

        const passwordHash = await bcrypt.hash(restablecerPasswordDto.nuevaPassword, 10);
        await this.usuariosService.updatePassword(usuario.id, passwordHash);

        return {
            message: 'Contraseña actualizada exitosamente',
        };
    }

    async loginOtp(loginOtpDto: LoginOtpDto) {
        const usuario = await this.usuariosService.findByEmail(loginOtpDto.email);
        if (!usuario || !usuario.activo) {
            throw new UnauthorizedException('El código OTP es inválido o ha expirado');
        }
        if (
            !usuario.otpCode ||
            usuario.otpCode !== loginOtpDto.otpCode ||
            !usuario.otpExpiresAt ||
            usuario.otpExpiresAt < new Date()
        ) {
            throw new UnauthorizedException('El código OTP es inválido o ha expirado');
        }
        await this.usuariosService.cleanOtpCode(usuario.id);
        const payload = {
            sub: usuario.id,
            email: usuario.email,
            rol: usuario.rol?.nombre
        }
        const token = await this.jwtService.signAsync(payload);
        return {
            message: 'Inicio de sesión exitoso',
            access_token: token,
        }
    }
}
