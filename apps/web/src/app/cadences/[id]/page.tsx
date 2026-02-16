'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCadence, useUpdateCadence } from '@/lib/hooks/use-cadences'
import { ArrowLeft, Clock, Mail, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { CadenceStep } from 'shared-types'

export default function CadencePage({ params }: { params: { id: string } }): JSX.Element {
  const { data: cadence, isLoading } = useCadence(params.id)
  const updateMutation = useUpdateCadence()

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [steps, setSteps] = useState<CadenceStep[]>([])

  const startEditing = (): void => {
    if (cadence) {
      setName(cadence.name)
      setSteps([...cadence.steps])
      setIsEditing(true)
    }
  }

  const cancelEditing = (): void => {
    setIsEditing(false)
  }

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
      await updateMutation.mutateAsync({ id: params?.id, data: { name, steps } })
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update cadence:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <p>Loading cadence...</p>
      </div>
    )
  }

  if (!cadence) {
    return (
      <div className="container mx-auto py-8">
        <p>Cadence not found</p>
      </div>
    )
  }

  const displaySteps = isEditing ? steps : cadence.steps
  const displayName = isEditing ? name : cadence.name

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
            <h1 className="text-4xl font-bold">{displayName}</h1>
            <p className="text-muted-foreground mt-2">
              <Badge variant="secondary">{cadence.id}</Badge>
            </p>
          </div>
          {!isEditing && (
            <Button onClick={startEditing}>Edit Cadence</Button>
          )}
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cadence Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="name">Cadence Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Workflow Steps</CardTitle>
                <Button type="button" onClick={addStep} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>
            </CardHeader>
            <CardContent>
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
                                  required
                                />
                              </div>
                              <div>
                                <Label>Email Body</Label>
                                <Textarea
                                  value={step.body || ''}
                                  onChange={(e) => updateStep(step.id, { body: e.target.value })}
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
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" onClick={cancelEditing}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Workflow Steps</CardTitle>
            <CardDescription>{displaySteps.length} steps in this cadence</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displaySteps.map((step, index) => (
                <Card key={step.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        {step.type === 'SEND_EMAIL' ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <Badge>Send Email</Badge>
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
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
