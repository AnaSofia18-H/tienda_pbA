import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Producto } from './entities/producto.entity';

@Controller('productos')
@ApiTags('Productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un producto' })
  @ApiCreatedResponse({
    description: 'Producto creado exitosamente',
    schema: {
      example: {
        message: 'Producto creado exitosamente',
        data: { id: 1, nombre: 'Agua', precio: 1.5, stock: 20, categoria: { id: 1, nombre: 'Bebidas' } },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Los datos enviados no son válidos' })
  @ApiNotFoundResponse({ description: 'No existe la categoría indicada' })
  create(@Body() createProductoDto: CreateProductoDto) {
    return this.productosService.create(createProductoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar productos' })
  @ApiOkResponse({ description: 'Lista de productos', type: [Producto] })
  findAll() {
    return this.productosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'ID del producto' })
  @ApiOkResponse({ description: 'Producto encontrado', type: Producto })
  @ApiBadRequestResponse({ description: 'El ID debe ser un número entero' })
  @ApiNotFoundResponse({ description: 'No existe un producto con ese ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un producto' })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'ID del producto' })
  @ApiOkResponse({
    description: 'Producto actualizado exitosamente',
    schema: {
      example: {
        message: 'Producto actualizado exitosamente',
        data: { id: 1, nombre: 'Agua mineral', precio: 1.75, stock: 20, categoria: { id: 1, nombre: 'Bebidas' } },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'El ID o los datos enviados no son válidos' })
  @ApiNotFoundResponse({ description: 'No existe el producto o la categoría indicada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductoDto: UpdateProductoDto,
  ) {
    return this.productosService.update(id, updateProductoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un producto' })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'ID del producto' })
  @ApiOkResponse({
    description: 'Producto eliminado exitosamente',
    schema: { example: { message: 'Producto "Agua" con ID 1 eliminado exitosamente' } },
  })
  @ApiBadRequestResponse({ description: 'El ID debe ser un número entero' })
  @ApiNotFoundResponse({ description: 'No existe un producto con ese ID' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.remove(id);
  }
}
