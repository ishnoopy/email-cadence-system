import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('enrollments')
export class EnrollmentEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  cadenceId: string;

  @Column()
  contactEmail: string;

  @Column()
  workflowId: string;

  @Column({ default: 0 })
  currentStepIndex: number;

  @Column({ default: 1 })
  stepsVersion: number;

  @Column({ default: 'RUNNING' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
