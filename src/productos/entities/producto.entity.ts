import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Categoria } from '../../categorias/entities/categoria.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('productos')
export class Producto {
  @ApiProperty({ example: 1, description: 'Identificador del producto' })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ example: 'Agua mineral', description: 'Nombre del producto' })
  @Column({ type: 'varchar', length: 150 })
  nombre!: string;

  @ApiProperty({ example: 'Botella de 500 ml', description: 'Descripción del producto', nullable: true })
  @Column({ type: 'text', nullable: true })
  descripcion!: string;

  @ApiProperty({ example: 1.5, description: 'Precio del producto' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio!: number;

  @ApiProperty({ example: 20, description: 'Unidades disponibles en inventario' })
  @Column({ type: 'int', default: 0 })
  stock!: number;

  @ApiProperty({ type: () => Categoria, description: 'Categoría a la que pertenece el producto' })
  @ManyToOne(() => Categoria, (categoria) => categoria.productos, {
    onDelete: 'CASCADE',
  })
  categoria!: Categoria;

  @ApiProperty({ type: String, format: 'date-time', example: '2026-11-06T12:00:00.000Z' })
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time', example: '2026-11-06T12:00:00.000Z' })
  @UpdateDateColumn()
  updatedAt!: Date;
}
