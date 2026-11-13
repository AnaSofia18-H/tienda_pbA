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
		const template = (await this.loadFile(plantilla)).toString('utf8');
		const html = compile(template)({ otpCode });
		const destellos = await this.loadFile('destellos.gif');
		const avatar = await this.loadFile('ana_chopper.gif');
		const gato = await this.loadFile('gato.gif');
		const from =
			this.configService.get<string>('MAIL_FROM') ||
			this.configService.getOrThrow<string>('MAIL_USER');

		await this.transporter.sendMail({
			from,
			to,
			subject,
			html,
			attachments: [
				{
					filename: 'destellos.gif',
					content: destellos,
					contentType: 'image/gif',
					cid: 'destellos',
				},
				{
					filename: 'ana_chopper.gif',
					content: avatar,
					contentType: 'image/gif',
					cid: 'avatar',
				},
				{
					filename: 'gato.gif',
					content: gato,
					contentType: 'image/gif',
					cid: 'gato',
				},
			],
		});
	}

	private async loadFile(archivo: string): Promise<Buffer> {
		const filePaths = [
			join(__dirname, 'template', archivo),
			join(process.cwd(), 'src', 'mail', 'template', archivo),
		];

		for (const filePath of filePaths) {
			try {
				return await readFile(filePath);
			} catch (error) {
				if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
					throw error;
				}
			}
		}

		throw new Error(`No se encontró el archivo de correo ${archivo}.`);
	}
}
