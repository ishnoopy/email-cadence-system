import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Client, Connection, WorkflowHandle } from '@temporalio/client';
import { Cadence, CadenceStep, WorkflowState } from 'shared-types';

@Injectable()
export class TemporalService implements OnModuleInit {
  private readonly logger = new Logger(TemporalService.name);
  private client: Client;
  private readonly address: string;
  private readonly namespace: string;
  private readonly taskQueue: string;

  constructor() {
    this.address = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
    this.namespace = process.env.TEMPORAL_NAMESPACE || 'default';
    this.taskQueue = process.env.TEMPORAL_TASK_QUEUE || 'cadence-queue';
  }

  async onModuleInit(): Promise<void> {
    try {
      const connection = await Connection.connect({
        address: this.address,
      });

      this.client = new Client({
        connection,
        namespace: this.namespace,
      });

      this.logger.log(`Connected to Temporal at ${this.address}`);
    } catch (error) {
      this.logger.error('Failed to connect to Temporal', error);
      throw error;
    }
  }

  /**
   * Start a cadence workflow
   */
  async startCadenceWorkflow(
    enrollmentId: string,
    cadence: Cadence,
    contactEmail: string,
  ): Promise<string> {
    const workflowId = `cadence-${enrollmentId}`;

    const handle = await this.client.workflow.start('cadenceWorkflow', {
      taskQueue: this.taskQueue,
      workflowId,
      args: [enrollmentId, cadence, contactEmail],
    });

    this.logger.log(`Started workflow ${workflowId}`);

    return handle.workflowId;
  }

  /**
   * Query workflow state
   */
  async queryWorkflowState(workflowId: string): Promise<WorkflowState> {
    try {
      const handle = this.client.workflow.getHandle(workflowId);
      const state = await handle.query<WorkflowState>('getState');
      return state;
    } catch (error) {
      this.logger.error(`Failed to query workflow ${workflowId}`, error);
      throw error;
    }
  }

  /**
   * Send update signal to workflow
   */
  async signalUpdateCadence(
    workflowId: string,
    steps: CadenceStep[],
  ): Promise<void> {
    try {
      const handle = this.client.workflow.getHandle(workflowId);
      await handle.signal('updateCadence', steps);
      this.logger.log(`Sent update signal to workflow ${workflowId}`);
    } catch (error) {
      this.logger.error(`Failed to signal workflow ${workflowId}`, error);
      throw error;
    }
  }

  /**
   * Get workflow handle
   */
  getWorkflowHandle(workflowId: string): WorkflowHandle {
    return this.client.workflow.getHandle(workflowId);
  }

  /**
   * Check if workflow is running
   */
  async isWorkflowRunning(workflowId: string): Promise<boolean> {
    try {
      const handle = this.client.workflow.getHandle(workflowId);
      const description = await handle.describe();
      return description.status.name === 'RUNNING';
    } catch (error) {
      return false;
    }
  }
}
