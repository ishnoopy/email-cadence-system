'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCadence } from '@/lib/hooks/use-cadences'
import { useEnrollment, useUpdateEnrollmentCadence } from '@/lib/hooks/use-enrollments'
import { ArrowLeft, Clock, Edit, Mail, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { CadenceStep } from 'shared-types'

export default function EnrollmentPage({ params }: { params: { id: string } }): JSX.Element {
  const { data: enrollment, isLoading } = useEnrollment(params.id, true)
  const { data: cadence } = useCadence(enrollment?.cadenceId || '')
  const updateMutation = useUpdateEnrollmentCadence()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newSteps, setNewSteps] = useState<CadenceStep[]>([])

  const openUpdateDialog = (): void => {
    const stepsToEdit = enrollment?.steps ?? cadence?.steps ?? []
    if (stepsToEdit.length > 0) {
      setNewSteps([...stepsToEdit])
      setIsDialogOpen(true)
    }
  }

  const addStep = (): void => {
    const newStep: CadenceStep = {
      id: `step_${Date.now()}`,
      type: 'SEND_EMAIL',
      subject: '',
      body: '',
    }
    setNewSteps([...newSteps, newStep])
  }

  const removeStep = (id: string): void => {
    setNewSteps(newSteps.filter((s) => s.id !== id))
  }

  const updateStep = (id: string, updates: Partial<CadenceStep>): void => {
    setNewSteps(newSteps.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  const handleUpdate = async (): Promise<void> => {
    try {
      await updateMutation.mutateAsync({ id: params.id, steps: newSteps })
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Failed to update enrollment cadence:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <p>Loading enrollment...</p>
      </div>
    )
  }

  if (!enrollment) {
    return (
      <div className="container mx-auto py-8">
        <p>Enrollment not found</p>
      </div>
    )
  }

  const displaySteps = enrollment.steps ?? cadence?.steps ?? []
  const progressPercentage = displaySteps.length > 0
    ? Math.round((enrollment.currentStepIndex / displaySteps.length) * 100)
    : 0

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">{enrollment.contactEmail}</h1>
            <p className="text-muted-foreground mt-2">
              <Badge variant="secondary">{enrollment.id}</Badge>
            </p>
          </div>
          <Badge
            variant={
              enrollment.status === 'COMPLETED'
                ? 'success'
                : enrollment.status === 'FAILED'
                  ? 'destructive'
                  : 'default'
            }
            className="text-lg px-4 py-2"
          >
            {enrollment.status}
          </Badge>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Workflow Progress</CardTitle>
            <CardDescription>
              Step {enrollment.currentStepIndex} of {displaySteps.length} • Version {enrollment.stepsVersion}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progressPercentage} />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{progressPercentage}% complete</span>
              {enrollment.status === 'RUNNING' && (
                <span className="flex items-center text-muted-foreground">
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Polling for updates...
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Workflow Steps</CardTitle>
                <CardDescription>
                  {cadence?.name || 'Loading cadence...'}
                </CardDescription>
              </div>
              {enrollment.status === 'RUNNING' && displaySteps.length > 0 && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={openUpdateDialog}>
                      <Edit className="h-4 w-4 mr-2" />
                      Update Cadence
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Update Running Cadence</DialogTitle>
                      <DialogDescription>
                        Modify the workflow steps. Already completed steps will remain completed.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {newSteps.map((step, index) => (
                        <Card key={step.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                                {index + 1}
                              </div>
                              <div className="flex-1 space-y-4">
                                <div>
                                  <Label>Step Type</Label>
                                  <Select
                                    value={step.type}
                                    onValueChange={(value) =>
                                      updateStep(step.id, {
                                        type: value as 'SEND_EMAIL' | 'WAIT',
                                        ...(value === 'SEND_EMAIL'
                                          ? { subject: '', body: '', seconds: undefined }
                                          : { subject: undefined, body: undefined, seconds: 0 }),
                                      })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="SEND_EMAIL">Send Email</SelectItem>
                                      <SelectItem value="WAIT">Wait</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {step.type === 'SEND_EMAIL' && (
                                  <>
                                    <div>
                                      <Label>Email Subject</Label>
                                      <Input
                                        value={step.subject || ''}
                                        onChange={(e) => updateStep(step.id, { subject: e.target.value })}
                                      />
                                    </div>
                                    <div>
                                      <Label>Email Body</Label>
                                      <Textarea
                                        value={step.body || ''}
                                        onChange={(e) => updateStep(step.id, { body: e.target.value })}
                                        rows={3}
                                      />
                                    </div>
                                  </>
                                )}

                                {step.type === 'WAIT' && (
                                  <div>
                                    <Label>Wait Duration (seconds)</Label>
                                    <Input
                                      type="number"
                                      value={step.seconds || 0}
                                      onChange={(e) => updateStep(step.id, { seconds: parseInt(e.target.value) })}
                                      min={1}
                                    />
                                  </div>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeStep(step.id)}
                              >
                                ×
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      <Button type="button" onClick={addStep} variant="outline" className="w-full">
                        Add Step
                      </Button>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? 'Updating...' : 'Update Workflow'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {displaySteps.map((step, index) => {
                const isCompleted = index < enrollment.currentStepIndex
                const isCurrent = index === enrollment.currentStepIndex && enrollment.status === 'RUNNING'

                return (
                  <Card
                    key={step.id}
                    className={
                      isCurrent
                        ? 'border-primary bg-primary/5'
                        : isCompleted
                          ? 'opacity-60'
                          : ''
                    }
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-medium ${isCompleted
                              ? 'bg-green-500 text-white'
                              : isCurrent
                                ? 'bg-primary text-primary-foreground animate-pulse'
                                : 'bg-secondary text-secondary-foreground'
                            }`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          {step.type === 'SEND_EMAIL' ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <Badge>Send Email</Badge>
                                {isCompleted && <Badge variant="success">Completed</Badge>}
                                {isCurrent && <Badge variant="default">In Progress</Badge>}
                              </div>
                              <div>
                                <p className="font-medium">{step.subject}</p>
                                <p className="text-sm text-muted-foreground mt-1">{step.body}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <Badge variant="secondary">Wait</Badge>
                                {isCompleted && <Badge variant="success">Completed</Badge>}
                                {isCurrent && <Badge variant="default">In Progress</Badge>}
                              </div>
                              <p className="text-sm">
                                Wait for {step.seconds} second{step.seconds !== 1 ? 's' : ''}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workflow Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Workflow ID</span>
              <code className="text-xs bg-secondary px-2 py-1 rounded">{enrollment.workflowId}</code>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cadence ID</span>
              <Link href={`/cadences/${enrollment.cadenceId}`}>
                <code className="text-xs bg-secondary px-2 py-1 rounded hover:bg-secondary/80 cursor-pointer">
                  {enrollment.cadenceId}
                </code>
              </Link>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Created</span>
              <span>{new Date(enrollment.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Last Updated</span>
              <span>{new Date(enrollment.updatedAt).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
