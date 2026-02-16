import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CadenceStep } from 'shared-types';

@Entity('cadences')
export class CadenceEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column('simple-json')
  steps: CadenceStep[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
