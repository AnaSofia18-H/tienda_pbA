import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { SolicitarOtpDto } from './dto/solicitar-dto';

@Injectable()
export class AuthService {
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
        await this.mailService.sendOtpEmail(usuario.email, otpCode);

        return {
            message: 'Código OTP enviado exitosamente al correo electrónico',
        }

    }
}
