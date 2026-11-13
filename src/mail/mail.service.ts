import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { compile } from 'handlebars';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
	constructor(
		@Inject('MAIL_TRANSPORTER')
		private readonly transporter: Transporter,
		private readonly configService: ConfigService,
	) {}

	async sendOtpEmail(to: string, otpCode: string): Promise<void> {
		await this.enviarCorreo(to, 'Código de inicio de sesión', 'otp.hbs', otpCode);
	}

	async sendRecuperacionEmail(to: string, otpCode: string): Promise<void> {
		await this.enviarCorreo(to, 'Recupera tu contraseña', 'recuperar-password.hbs', otpCode);
	}

	private async enviarCorreo(to: string, subject: string, plantilla: string, otpCode: string): Promise<void> {
		const template = await this.loadTemplate(plantilla);
		const html = compile(template)({ otpCode });
		const from =
			this.configService.get<string>('MAIL_FROM') ||
			this.configService.getOrThrow<string>('MAIL_USER');

		await this.transporter.sendMail({
			from,
			to,
			subject,
			html,
		});
	}

	private async loadTemplate(plantilla: string): Promise<string> {
		const templatePaths = [
			join(__dirname, 'template', plantilla),
			join(process.cwd(), 'src', 'mail', 'template', plantilla),
		];

		for (const templatePath of templatePaths) {
			try {
				return await readFile(templatePath, 'utf8');
			} catch (error) {
				if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
					throw error;
				}
			}
		}

		throw new Error(`No se encontró la plantilla de correo ${plantilla}.`);
	}
}
