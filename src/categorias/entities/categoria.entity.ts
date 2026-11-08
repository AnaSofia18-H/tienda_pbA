import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Producto } from '../../productos/entities/producto.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('categorias')
export class Categoria {
  @ApiProperty({ example: 1, description: 'Identificador de la categoría' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Bebidas', description: 'Nombre único de la categoría' })
  @Column({ type: 'varchar', length: 100, unique: true })
  nombre: string;

  @ApiProperty({ example: 'Bebidas disponibles', description: 'Descripción de la categoría', nullable: true })
  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @ApiProperty({ type: () => [Producto], description: 'Productos asociados a la categoría' })
  @OneToMany(() => Producto, (producto) => producto.categoria)
  productos: Producto[];

  @ApiProperty({ type: String, format: 'date-time', example: '2026-11-06T12:00:00.000Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time', example: '2026-11-06T12:00:00.000Z' })
  @UpdateDateColumn()
  updatedAt: Date;
}
