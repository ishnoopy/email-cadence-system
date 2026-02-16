export interface CadenceStep {
  id: string;
  type: 'SEND_EMAIL' | 'WAIT';
  subject?: string;
  body?: string;
  seconds?: number;
}

export interface Cadence {
  id: string;
  name: string;
  steps: CadenceStep[];
}

export interface WorkflowState {
  currentStepIndex: number;
  stepsVersion: number;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  steps: CadenceStep[];
}

export interface Enrollment {
  id: string;
  cadenceId: string;
  contactEmail: string;
  workflowId: string;
  currentStepIndex: number;
  stepsVersion: number;
  status: string;
  steps?: CadenceStep[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCadenceDto {
  name: string;
  steps: CadenceStep[];
}

export interface UpdateCadenceDto {
  name?: string;
  steps?: CadenceStep[];
}

export interface CreateEnrollmentDto {
  cadenceId: string;
  contactEmail: string;
}

export interface UpdateEnrollmentCadenceDto {
  steps: CadenceStep[];
}

export interface EmailResult {
  success: boolean;
  messageId: string;
  timestamp: number;
}
