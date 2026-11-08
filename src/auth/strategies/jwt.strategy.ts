import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsuarioEntity } from "../../usuarios/entities/usuario.entity";
import { UsuariosService } from "../../usuarios/usuarios.service";

// Contrado del Payload que se va a recibir en el JWT
export interface JwtPayload {
    sub: number;
    email: string;
    rol: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly usuarioService: UsuariosService
    ) {
        super({
            //Extraer el token del header de la petición
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>('JWT_SECRET')
        });
    }

    async validate(payload: JwtPayload): Promise<UsuarioEntity> {
        const usuario = await this.usuarioService.findOne(payload.sub);
        if (!usuario || !usuario.activo) {
            throw new UnauthorizedException('Usuario no encontrado o inactivo');
        }
        return usuario;
    }

}