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
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Categoria } from './entities/categoria.entity';

@Controller('categorias')
@ApiTags('Categorías')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una categoría' })
  @ApiCreatedResponse({
    description: 'Categoría creada exitosamente',
    schema: {
      example: {
        message: 'Categoría creada exitosamente',
        data: { id: 1, nombre: 'Bebidas', descripcion: 'Bebidas disponibles' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Los datos enviados no son válidos' })
  @ApiConflictResponse({ description: 'Ya existe una categoría con ese nombre' })
  create(@Body() createCategoriaDto: CreateCategoriaDto) {
    return this.categoriasService.create(createCategoriaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar categorías' })
  @ApiOkResponse({ description: 'Lista de categorías', type: [Categoria] })
  findAll() {
    return this.categoriasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una categoría por ID' })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'ID de la categoría' })
  @ApiOkResponse({ description: 'Categoría encontrada', type: Categoria })
  @ApiBadRequestResponse({ description: 'El ID debe ser un número entero' })
  @ApiNotFoundResponse({ description: 'No existe una categoría con ese ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una categoría' })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'ID de la categoría' })
  @ApiOkResponse({
    description: 'Categoría actualizada exitosamente',
    schema: {
      example: {
        message: 'Categoría actualizada exitosamente',
        data: { id: 1, nombre: 'Bebidas frías', descripcion: 'Bebidas disponibles' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'El ID o los datos enviados no son válidos' })
  @ApiNotFoundResponse({ description: 'No existe una categoría con ese ID' })
  @ApiConflictResponse({ description: 'Ya existe una categoría con ese nombre' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoriaDto: UpdateCategoriaDto,
  ) {
    return this.categoriasService.update(id, updateCategoriaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una categoría' })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'ID de la categoría' })
  @ApiOkResponse({
    description: 'Categoría eliminada exitosamente',
    schema: { example: { message: 'Categoría "Bebidas" con ID 1 eliminada exitosamente' } },
  })
  @ApiBadRequestResponse({ description: 'El ID debe ser un número entero' })
  @ApiNotFoundResponse({ description: 'No existe una categoría con ese ID' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.remove(id);
  }
}
