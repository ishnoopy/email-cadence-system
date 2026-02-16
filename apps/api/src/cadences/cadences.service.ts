import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CadenceEntity } from './entities/cadence.entity';
import { CreateCadenceDto, UpdateCadenceDto } from './dto/cadence.dto';
import { Cadence } from 'shared-types';

@Injectable()
export class CadencesService {
  constructor(
    @InjectRepository(CadenceEntity)
    private readonly cadenceRepository: Repository<CadenceEntity>,
  ) {}

  async createCadence(dto: CreateCadenceDto): Promise<Cadence> {
    const id = `cad_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const cadence = this.cadenceRepository.create({
      id,
      name: dto.name,
      steps: dto.steps,
    });

    await this.cadenceRepository.save(cadence);

    return this.entityToDto(cadence);
  }

  async findAllCadences(): Promise<Cadence[]> {
    const cadences = await this.cadenceRepository.find({
      order: { createdAt: 'DESC' },
    });

    return cadences.map((cadence) => this.entityToDto(cadence));
  }

  async findCadenceById(id: string): Promise<Cadence> {
    const cadence = await this.cadenceRepository.findOne({ where: { id } });

    if (!cadence) {
      throw new NotFoundException(`Cadence with ID ${id} not found`);
    }

    return this.entityToDto(cadence);
  }

  async updateCadence(id: string, dto: UpdateCadenceDto): Promise<Cadence> {
    const cadence = await this.cadenceRepository.findOne({ where: { id } });

    if (!cadence) {
      throw new NotFoundException(`Cadence with ID ${id} not found`);
    }

    if (dto.name !== undefined) {
      cadence.name = dto.name;
    }

    if (dto.steps !== undefined) {
      cadence.steps = dto.steps;
    }

    await this.cadenceRepository.save(cadence);

    return this.entityToDto(cadence);
  }

  async deleteCadence(id: string): Promise<void> {
    const result = await this.cadenceRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Cadence with ID ${id} not found`);
    }
  }

  private entityToDto(entity: CadenceEntity): Cadence {
    return {
      id: entity.id,
      name: entity.name,
      steps: entity.steps,
    };
  }
}
