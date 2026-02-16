import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { Cadence } from 'shared-types';
import { CadencesService } from './cadences.service';
import { CreateCadenceDto, UpdateCadenceDto } from './dto/cadence.dto';

@Controller('cadences')
export class CadencesController {
  constructor(private readonly cadencesService: CadencesService) { }

  /**
   * Create a new cadence
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCadence(@Body() dto: CreateCadenceDto): Promise<Cadence> {
    return this.cadencesService.createCadence(dto);
  }

  /**
   * Get all cadences
   */
  @Get()
  async findAllCadences(): Promise<Cadence[]> {
    return this.cadencesService.findAllCadences();
  }

  /**
   * Get a cadence by ID
   */
  @Get(':id')
  async findCadenceById(@Param('id') id: string): Promise<Cadence> {
    return this.cadencesService.findCadenceById(id);
  }

  /**
   * Update a cadence
   */
  @Put(':id')
  async updateCadence(
    @Param('id') id: string,
    @Body() dto: UpdateCadenceDto,
  ): Promise<Cadence> {
    return this.cadencesService.updateCadence(id, dto);
  }

  /**
   * Delete a cadence
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCadence(@Param('id') id: string): Promise<void> {
    return this.cadencesService.deleteCadence(id);
  }
}
