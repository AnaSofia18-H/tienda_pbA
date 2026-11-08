import { UsuarioEntity } from '../../usuarios/entities/usuario.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('roles')
export class RolEntity {
  @ApiProperty({ example: 1, description: 'Identificador del rol' })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ example: 'Administrador', description: 'Nombre único del rol' })
  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  nombre!: string;

  @ApiProperty({ example: 'Acceso administrativo', description: 'Descripción del rol', nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion?: string;

  @OneToMany(() => UsuarioEntity, (user) => user.rol)
  usuarios!: UsuarioEntity[];

  @ApiProperty({ type: String, format: 'date-time', example: '2026-11-06T12:00:00.000Z' })
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time', example: '2026-11-06T12:00:00.000Z' })
  @UpdateDateColumn()
  updatedAt!: Date;
}
