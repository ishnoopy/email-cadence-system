import { Worker, NativeConnection } from '@temporalio/worker';
import * as activities from './activities/email.activities';

async function runWorker(): Promise<void> {
  const address = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
  const namespace = process.env.TEMPORAL_NAMESPACE || 'default';
  const taskQueue = process.env.TEMPORAL_TASK_QUEUE || 'cadence-queue';

  console.log(`Connecting to Temporal at ${address}...`);

  const connection = await NativeConnection.connect({
    address,
  });

  console.log(`Creating worker for task queue: ${taskQueue}`);

  const worker = await Worker.create({
    connection,
    namespace,
    taskQueue,
    workflowsPath: require.resolve('./workflows/cadence.workflow'),
    activities,
  });

  console.log('Worker started successfully!');
  console.log(`Namespace: ${namespace}`);
  console.log(`Task Queue: ${taskQueue}`);
  console.log('Waiting for workflows...\n');

  await worker.run();
}

runWorker().catch((error) => {
  console.error('Worker failed:', error);
  process.exit(1);
});
