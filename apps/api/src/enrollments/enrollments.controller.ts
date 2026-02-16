import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto, UpdateEnrollmentCadenceDto } from './dto/enrollment.dto';
import { Enrollment } from 'shared-types';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  /**
   * Create a new enrollment and start workflow
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createEnrollment(@Body() dto: CreateEnrollmentDto): Promise<Enrollment> {
    return this.enrollmentsService.createEnrollment(dto);
  }

  /**
   * Get all enrollments
   */
  @Get()
  async findAllEnrollments(): Promise<Enrollment[]> {
    return this.enrollmentsService.findAllEnrollments();
  }

  /**
   * Get enrollment by ID with current workflow state
   */
  @Get(':id')
  async findEnrollmentById(@Param('id') id: string): Promise<Enrollment> {
    return this.enrollmentsService.findEnrollmentById(id);
  }

  /**
   * Update cadence for a running workflow
   */
  @Post(':id/update-cadence')
  async updateEnrollmentCadence(
    @Param('id') id: string,
    @Body() dto: UpdateEnrollmentCadenceDto,
  ): Promise<{ accepted: boolean }> {
    return this.enrollmentsService.updateEnrollmentCadence(id, dto);
  }
}
