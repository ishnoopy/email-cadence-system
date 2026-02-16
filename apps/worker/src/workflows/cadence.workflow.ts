import { proxyActivities, defineSignal, defineQuery, setHandler, sleep } from '@temporalio/workflow';
import type * as activities from '../activities/email.activities';
import { Cadence, CadenceStep, WorkflowState } from 'shared-types';

const { sendEmail } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

export const updateCadenceSignal = defineSignal<[CadenceStep[]]>('updateCadence');
export const getStateQuery = defineQuery<WorkflowState>('getState');

export async function cadenceWorkflow(
  _enrollmentId: string,
  initialCadence: Cadence,
  contactEmail: string,
): Promise<void> {
  let steps = initialCadence.steps;
  let currentStepIndex = 0;
  let stepsVersion = 1;
  let status: 'RUNNING' | 'COMPLETED' | 'FAILED' = 'RUNNING';

  setHandler(updateCadenceSignal, (newSteps: CadenceStep[]) => {
    steps = newSteps;
    stepsVersion++;

    if (steps.length <= currentStepIndex) {
      status = 'COMPLETED';
    }
  });

  setHandler(getStateQuery, (): WorkflowState => ({
    currentStepIndex,
    stepsVersion,
    status,
    steps,
  }));

  while (currentStepIndex < steps.length && status === 'RUNNING') {
    const step = steps[currentStepIndex];

    if (step.type === 'SEND_EMAIL') {
      await sendEmail({
        to: contactEmail,
        subject: step.subject!,
        body: step.body!,
      });
    } else if (step.type === 'WAIT') {
      await sleep(step.seconds! * 1000);
    }

    currentStepIndex++;
  }

  status = 'COMPLETED';
}
