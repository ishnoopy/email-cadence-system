import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnrollmentEntity } from './entities/enrollment.entity';
import { CreateEnrollmentDto, UpdateEnrollmentCadenceDto } from './dto/enrollment.dto';
import { CadenceStep, Enrollment } from 'shared-types';
import { TemporalService } from '../temporal/temporal.service';
import { CadencesService } from '../cadences/cadences.service';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(EnrollmentEntity)
    private readonly enrollmentRepository: Repository<EnrollmentEntity>,
    private readonly temporalService: TemporalService,
    private readonly cadencesService: CadencesService,
  ) {}

  async createEnrollment(dto: CreateEnrollmentDto): Promise<Enrollment> {
    const cadence = await this.cadencesService.findCadenceById(dto.cadenceId);

    const id = `enr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const workflowId = await this.temporalService.startCadenceWorkflow(
      id,
      cadence,
      dto.contactEmail,
    );

    const enrollment = this.enrollmentRepository.create({
      id,
      cadenceId: dto.cadenceId,
      contactEmail: dto.contactEmail,
      workflowId,
      currentStepIndex: 0,
      stepsVersion: 1,
      status: 'RUNNING',
    });

    await this.enrollmentRepository.save(enrollment);

    return this.entityToDto(enrollment);
  }

  async findAllEnrollments(): Promise<Enrollment[]> {
    const enrollments = await this.enrollmentRepository.find({
      order: { createdAt: 'DESC' },
    });

    // Check status for enrollments that are still marked as RUNNING
    await Promise.all(
      enrollments
        .filter((e) => e.status === 'RUNNING')
        .map(async (enrollment) => {
          try {
            const workflowState = await this.temporalService.queryWorkflowState(
              enrollment.workflowId,
            );
            enrollment.status = workflowState.status;
            enrollment.currentStepIndex = workflowState.currentStepIndex;
            await this.enrollmentRepository.save(enrollment);
          } catch (error) {
            // If query fails, check if workflow completed
            const isRunning = await this.temporalService.isWorkflowRunning(enrollment.workflowId);
            if (!isRunning) {
              enrollment.status = 'COMPLETED';
              await this.enrollmentRepository.save(enrollment);
            }
          }
        }),
    );

    return enrollments.map((enrollment) => this.entityToDto(enrollment));
  }

  async findEnrollmentById(id: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepository.findOne({ where: { id } });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    let workflowSteps: CadenceStep[] | undefined;
    try {
      const workflowState = await this.temporalService.queryWorkflowState(
        enrollment.workflowId,
      );

      enrollment.currentStepIndex = workflowState.currentStepIndex;
      enrollment.stepsVersion = workflowState.stepsVersion;
      enrollment.status = workflowState.status;
      workflowSteps = workflowState.steps;

      await this.enrollmentRepository.save(enrollment);
    } catch (error) {
      console.error(`Failed to query workflow state for enrollment ${id}:`, error);
      
      // If query fails, the workflow might have completed and is no longer queryable
      // Check the workflow status using describe() instead
      const isRunning = await this.temporalService.isWorkflowRunning(enrollment.workflowId);
      if (!isRunning && enrollment.status === 'RUNNING') {
        enrollment.status = 'COMPLETED';
        await this.enrollmentRepository.save(enrollment);
      }
    }

    const dto = this.entityToDto(enrollment);
    if (workflowSteps) {
      dto.steps = workflowSteps;
    }
    return dto;
  }

  async updateEnrollmentCadence(
    id: string,
    dto: UpdateEnrollmentCadenceDto,
  ): Promise<{ accepted: boolean }> {
    const enrollment = await this.enrollmentRepository.findOne({ where: { id } });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    await this.temporalService.signalUpdateCadence(
      enrollment.workflowId,
      dto.steps,
    );

    return { accepted: true };
  }

  private entityToDto(entity: EnrollmentEntity): Enrollment {
    return {
      id: entity.id,
      cadenceId: entity.cadenceId,
      contactEmail: entity.contactEmail,
      workflowId: entity.workflowId,
      currentStepIndex: entity.currentStepIndex,
      stepsVersion: entity.stepsVersion,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
