'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useCadences } from '@/lib/hooks/use-cadences'
import { useCreateEnrollment } from '@/lib/hooks/use-enrollments'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'

export default function NewEnrollmentPage(): JSX.Element {
  const router = useRouter()
  const { data: cadences, isLoading: cadencesLoading } = useCadences()
  const createMutation = useCreateEnrollment()

  const [cadenceId, setCadenceId] = useState('')
  const [contactEmail, setContactEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    try {
      const result = await createMutation.mutateAsync({ cadenceId, contactEmail })
      router.push(`/enrollments/${result.id}`)
    } catch (error) {
      console.error('Failed to create enrollment:', error)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
        <h1 className="text-4xl font-bold">Create New Enrollment</h1>
        <p className="text-muted-foreground mt-2">Start a new workflow for a contact</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Enrollment Details</CardTitle>
            <CardDescription>Select a cadence and enter contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="cadence">Select Cadence</Label>
              {cadencesLoading ? (
                <p className="text-sm text-muted-foreground">Loading cadences...</p>
              ) : !cadences || cadences.length === 0 ? (
                <div className="text-sm text-muted-foreground p-4 border rounded-md">
                  No cadences available. <Link href="/cadences/new" className="text-primary underline">Create one first</Link>.
                </div>
              ) : (
                <Select value={cadenceId} onValueChange={setCadenceId} required>
                  <SelectTrigger id="cadence">
                    <SelectValue placeholder="Choose a cadence" />
                  </SelectTrigger>
                  <SelectContent>
                    {cadences.map((cadence) => (
                      <SelectItem key={cadence.id} value={cadence.id}>
                        {cadence.name} ({cadence.steps.length} steps)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Contact Email</Label>
              <Input
                id="email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="contact@example.com"
                required
              />
            </div>

            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={createMutation.isPending || !cadenceId || !contactEmail}
              >
                {createMutation.isPending ? 'Starting Workflow...' : 'Start Enrollment'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
