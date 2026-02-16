# Email Cadence System

A full-stack TypeScript monorepo application for managing email cadences with dynamic workflow updates using Next.js, NestJS, and Temporal.io.

## Features

- 🎯 **Create Email Cadences**: Define multi-step email workflows with send and wait actions
- 🚀 **Dynamic Workflow Updates**: Update running workflows with new steps in real-time
- 📊 **Real-time Progress Tracking**: Monitor workflow execution with automatic polling
- 🎨 **Modern UI**: Built with Next.js, shadcn/ui, and Tailwind CSS
- 🔄 **Temporal.io Integration**: Reliable workflow orchestration with signals and queries
- 💾 **SQLite Database**: Lightweight data persistence with TypeORM
- 📦 **Monorepo Structure**: Organized with pnpm workspaces

## Architecture

```
temporal/
├── apps/
│   ├── web/        # Next.js frontend with shadcn/ui
│   ├── api/        # NestJS REST API
│   └── worker/     # Temporal.io workflow worker
├── packages/
│   └── shared-types/  # Shared TypeScript types
```

## Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TanStack Query, shadcn/ui, Tailwind CSS
- **Backend**: NestJS, TypeORM, SQLite
- **Workflows**: Temporal.io TypeScript SDK
- **Monorepo**: pnpm workspaces
- **Language**: TypeScript (strict mode)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0
- **Temporal.io CLI**: For running the Temporal server

### Installing Temporal CLI

```bash
# macOS (Homebrew)
brew install temporal

# Or download from https://github.com/temporalio/cli
```

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

#### API Configuration

Create `apps/api/.env`:

```bash
DATABASE_PATH=./data/cadence.db
TEMPORAL_ADDRESS=localhost:7233
TEMPORAL_NAMESPACE=default
TEMPORAL_TASK_QUEUE=cadence-queue
PORT=3001
```

#### Worker Configuration

Create `apps/worker/.env`:

```bash
TEMPORAL_ADDRESS=localhost:7233
TEMPORAL_NAMESPACE=default
TEMPORAL_TASK_QUEUE=cadence-queue
```

#### Web Configuration

Create `apps/web/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Start the Development Servers

You'll need **4 terminals** to run all services:

#### Terminal 1: Start Temporal Server

```bash
temporal server start-dev
```

This will start the Temporal server on `localhost:7233` and the Web UI on `http://localhost:8233`.

#### Terminal 2: Start the API Server

```bash
pnpm dev:api
```

The NestJS API will run on `http://localhost:3001`.

#### Terminal 3: Start the Temporal Worker

```bash
pnpm dev:worker
```

The worker will connect to Temporal and listen for workflow tasks.

#### Terminal 4: Start the Next.js Frontend

```bash
pnpm dev:web
```

The web application will run on `http://localhost:3000`.

**Or start all services at once:**

```bash
pnpm dev
```

This will run all three services concurrently in a single terminal.

## Usage Guide

### Creating a Cadence

1. Navigate to `http://localhost:3000`
2. Click "New Cadence"
3. Enter a cadence name (e.g., "Welcome Flow")
4. Add steps:
   - **Send Email**: Specify subject and body
   - **Wait**: Specify duration in seconds
5. Click "Create Cadence"

### Starting an Enrollment

1. Click "New Enrollment"
2. Select a cadence from the dropdown
3. Enter a contact email address
4. Click "Start Enrollment"
5. The workflow will start executing immediately

### Monitoring Workflow Progress

1. Click on an enrollment to view its details
2. Progress updates automatically every 2 seconds
3. See which steps are completed, in progress, or pending
4. View workflow metadata and status

### Updating a Running Workflow

1. On an enrollment detail page, click "Update Cadence"
2. Modify existing steps or add new ones
3. Click "Update Workflow"
4. The workflow will continue from its current position with the new steps

## API Endpoints

### Cadences

```bash
# Create a cadence
POST /cadences
Content-Type: application/json

{
  "name": "Welcome Flow",
  "steps": [
    {
      "id": "1",
      "type": "SEND_EMAIL",
      "subject": "Welcome!",
      "body": "Welcome to our platform"
    },
    {
      "id": "2",
      "type": "WAIT",
      "seconds": 10
    },
    {
      "id": "3",
      "type": "SEND_EMAIL",
      "subject": "Getting Started",
      "body": "Here's how to get started..."
    }
  ]
}

# Get all cadences
GET /cadences

# Get a specific cadence
GET /cadences/:id

# Update a cadence
PUT /cadences/:id
Content-Type: application/json

{
  "name": "Updated Welcome Flow",
  "steps": [...]
}
```

### Enrollments

```bash
# Create an enrollment (start workflow)
POST /enrollments
Content-Type: application/json

{
  "cadenceId": "cad_123",
  "contactEmail": "user@example.com"
}

# Get all enrollments
GET /enrollments

# Get enrollment status
GET /enrollments/:id

# Update running workflow
POST /enrollments/:id/update-cadence
Content-Type: application/json

{
  "steps": [
    {
      "id": "1",
      "type": "SEND_EMAIL",
      "subject": "New subject",
      "body": "New body"
    }
  ]
}
```

## Example: Testing with cURL

```bash
# 1. Create a cadence
curl -X POST http://localhost:3001/cadences \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Quick Test",
    "steps": [
      {
        "id": "1",
        "type": "SEND_EMAIL",
        "subject": "Hello",
        "body": "First email"
      },
      {
        "id": "2",
        "type": "WAIT",
        "seconds": 5
      },
      {
        "id": "3",
        "type": "SEND_EMAIL",
        "subject": "Follow up",
        "body": "Second email"
      }
    ]
  }'

# 2. Start an enrollment (replace cad_xxx with actual ID from step 1)
curl -X POST http://localhost:3001/enrollments \
  -H "Content-Type: application/json" \
  -d '{
    "cadenceId": "cad_xxx",
    "contactEmail": "test@example.com"
  }'

# 3. Check enrollment status (replace enr_xxx with actual ID from step 2)
curl http://localhost:3001/enrollments/enr_xxx

# 4. Update the running workflow
curl -X POST http://localhost:3001/enrollments/enr_xxx/update-cadence \
  -H "Content-Type: application/json" \
  -d '{
    "steps": [
      {
        "id": "1",
        "type": "SEND_EMAIL",
        "subject": "Updated Hello",
        "body": "Updated first email"
      },
      {
        "id": "2",
        "type": "WAIT",
        "seconds": 3
      },
      {
        "id": "3",
        "type": "SEND_EMAIL",
        "subject": "Updated Follow up",
        "body": "Updated second email"
      },
      {
        "id": "4",
        "type": "SEND_EMAIL",
        "subject": "New Step",
        "body": "This is a new step added while running"
      }
    ]
  }'
```

## Workflow Update Rules

When updating a running workflow:

1. **Current Step Index Preserved**: The workflow continues from where it left off
2. **Completed Steps Remain Completed**: Already executed steps are not re-executed
3. **Version Incremented**: The `stepsVersion` counter increases with each update
4. **Automatic Completion**: If new steps array is shorter than current index, workflow completes
5. **Real-time Application**: Changes take effect immediately for pending steps

## Project Scripts

```bash
# Development
pnpm dev              # Start all services (API, Worker, Web)
pnpm dev:web          # Start Next.js frontend only
pnpm dev:api          # Start NestJS API only
pnpm dev:worker       # Start Temporal worker only

# Build
pnpm build            # Build all packages

# Clean
pnpm clean            # Clean all build artifacts
```

## Temporal Configuration

The system uses the following Temporal.io settings:

- **Address**: `localhost:7233` (configurable via `TEMPORAL_ADDRESS`)
- **Namespace**: `default` (configurable via `TEMPORAL_NAMESPACE`)
- **Task Queue**: `cadence-queue` (configurable via `TEMPORAL_TASK_QUEUE`)
- **Workflow ID Format**: `cadence-{enrollmentId}`

### Viewing Workflows in Temporal UI

1. Navigate to `http://localhost:8233`
2. You'll see all running and completed workflows
3. Click on a workflow to view its history, queries, and signals

## Mock Email Implementation

The email sending is mocked for this assessment. The `sendEmail` activity:

- Logs email details to the console
- Always returns success
- Generates a unique message ID
- Returns immediately without delay

Example output:

```
[MOCK EMAIL] Sending email: {
  to: 'user@example.com',
  subject: 'Welcome!',
  body: 'Welcome to our platform'
}
[MOCK EMAIL] Email sent successfully: {
  success: true,
  messageId: 'msg_1234567890_abc123',
  timestamp: 1234567890
}
```

## Database

The application uses SQLite for data persistence:

- **Location**: `./data/cadence.db` (created automatically)
- **Tables**: `cadences`, `enrollments`
- **ORM**: TypeORM with auto-synchronization enabled

The database file is git-ignored and will be created on first run.

## TypeScript Standards

The codebase follows strict TypeScript guidelines:

- ✅ Explicit type declarations for all variables and functions
- ✅ No `any` types
- ✅ JSDoc comments for public classes and methods
- ✅ PascalCase for classes, camelCase for variables/functions
- ✅ Kebab-case for file and directory names
- ✅ Comprehensive error handling

## Troubleshooting

### Temporal Connection Errors

If you see "Failed to connect to Temporal":

1. Ensure Temporal server is running: `temporal server start-dev`
2. Check the address in your `.env` file matches `localhost:7233`
3. Verify no firewall is blocking port 7233

### Port Already in Use

If ports are already in use, update the environment variables:

- API: Change `PORT` in `apps/api/.env`
- Web: Next.js uses port 3000 by default (change with `-p` flag)
- Temporal: Uses 7233 and 8233 (configure with Temporal CLI options)

### Worker Not Processing Workflows

1. Ensure worker is running (`pnpm dev:worker`)
2. Check task queue name matches across API, worker, and `.env` files
3. Look for errors in worker console output

### Database Issues

If you encounter database errors:

1. Delete `./data/cadence.db` to reset
2. Restart the API server to recreate the database
3. Check file permissions on the `./data/` directory

## License

This project was created as a code assessment.

## Support

For questions or support, please email: <aldringuasa@gmail.com> or contact in Indeed.

## Preview
<img width="821" height="683" alt="image" src="https://github.com/user-attachments/assets/144c9afd-df39-4054-a46d-0e3fa0a63aaa" />
<img width="821" height="895" alt="image" src="https://github.com/user-attachments/assets/31e23ffd-266b-4fe8-9af8-6caf2005c37b" />

