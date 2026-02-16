'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Mail, Clock } from 'lucide-react'
import { useCreateCadence } from '@/lib/hooks/use-cadences'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CadenceStep } from 'shared-types'

export default function NewCadencePage(): JSX.Element {
  const router = useRouter()
  const createMutation = useCreateCadence()

  const [name, setName] = useState('')
  const [steps, setSteps] = useState<CadenceStep[]>([])

  const addStep = (): void => {
    const newStep: CadenceStep = {
      id: `step_${Date.now()}`,
      type: 'SEND_EMAIL',
      subject: '',
      body: '',
    }
    setSteps([...steps, newStep])
  }

  const removeStep = (id: string): void => {
    setSteps(steps.filter((s) => s.id !== id))
  }

  const updateStep = (id: string, updates: Partial<CadenceStep>): void => {
    setSteps(steps.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    try {
      const result = await createMutation.mutateAsync({ name, steps })
      router.push(`/cadences/${result.id}`)
    } catch (error) {
      console.error('Failed to create cadence:', error)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Create New Cadence</h1>
        <p className="text-muted-foreground mt-2">Define your email cadence workflow</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Cadence Details</CardTitle>
            <CardDescription>Basic information about your cadence</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Cadence Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Welcome Flow"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Workflow Steps</CardTitle>
                <CardDescription>Define the steps in your cadence</CardDescription>
              </div>
              <Button type="button" onClick={addStep} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {steps.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No steps added yet. Click "Add Step" to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {steps.map((step, index) => (
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
                                <SelectItem value="SEND_EMAIL">
                                  <div className="flex items-center">
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send Email
                                  </div>
                                </SelectItem>
                                <SelectItem value="WAIT">
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-2" />
                                    Wait
                                  </div>
                                </SelectItem>
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
                                  placeholder="Email subject"
                                  required
                                />
                              </div>
                              <div>
                                <Label>Email Body</Label>
                                <Textarea
                                  value={step.body || ''}
                                  onChange={(e) => updateStep(step.id, { body: e.target.value })}
                                  placeholder="Email content"
                                  rows={4}
                                  required
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
                                placeholder="e.g., 86400 for 1 day"
                                min={1}
                                required
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
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={createMutation.isPending || !name || steps.length === 0}>
            {createMutation.isPending ? 'Creating...' : 'Create Cadence'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
