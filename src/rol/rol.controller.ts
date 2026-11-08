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
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { RolService } from './rol.service';
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
import { RolEntity } from './entities/rol.entity';

@Controller('roles')
@ApiTags('Roles')
export class RolController {
  constructor(private readonly rolService: RolService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un rol' })
  @ApiCreatedResponse({
    description: 'Rol creado exitosamente',
    schema: {
      example: {
        message: 'Rol creado exitosamente',
        data: { id: 1, nombre: 'Administrador', descripcion: 'Acceso administrativo' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Los datos enviados no son válidos' })
  @ApiConflictResponse({ description: 'Ya existe un rol con ese nombre' })
  create(@Body() createRolDto: CreateRolDto) {
    return this.rolService.create(createRolDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar roles' })
  @ApiOkResponse({ description: 'Lista de roles', type: [RolEntity] })
  findAll() {
    return this.rolService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un rol por ID' })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'ID del rol' })
  @ApiOkResponse({ description: 'Rol encontrado', type: RolEntity })
  @ApiBadRequestResponse({ description: 'El ID debe ser un número entero' })
  @ApiNotFoundResponse({ description: 'No existe un rol con ese ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un rol' })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'ID del rol' })
  @ApiOkResponse({
    description: 'Rol actualizado exitosamente',
    schema: {
      example: {
        message: 'Rol actualizado exitosamente',
        data: { id: 1, nombre: 'Supervisor', descripcion: 'Acceso de supervisión' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'El ID o los datos enviados no son válidos' })
  @ApiNotFoundResponse({ description: 'No existe un rol con ese ID' })
  @ApiConflictResponse({ description: 'Ya existe un rol con ese nombre' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRolDto: UpdateRolDto,
  ) {
    return this.rolService.update(id, updateRolDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un rol' })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'ID del rol' })
  @ApiOkResponse({
    description: 'Rol eliminado exitosamente',
    schema: { example: { message: 'Rol "Administrador" con ID 1 eliminado exitosamente' } },
  })
  @ApiBadRequestResponse({ description: 'El ID debe ser un número entero' })
  @ApiNotFoundResponse({ description: 'No existe un rol con ese ID' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolService.remove(id);
  }
}
