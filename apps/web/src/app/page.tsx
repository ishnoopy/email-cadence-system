'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useCadences } from '@/lib/hooks/use-cadences'
import { useEnrollments } from '@/lib/hooks/use-enrollments'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function HomePage(): JSX.Element {
  const { data: cadences, isLoading: cadencesLoading } = useCadences()
  const { data: enrollments, isLoading: enrollmentsLoading } = useEnrollments()

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Email Cadence System</h1>
        <p className="text-muted-foreground mt-2">
          Manage email cadences and enrollments with Temporal.io workflows
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Cadences</CardTitle>
                  <CardDescription>Manage email cadence templates</CardDescription>
                </div>
                <Link href="/cadences/new">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Cadence
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {cadencesLoading ? (
                <p className="text-sm text-muted-foreground">Loading cadences...</p>
              ) : !cadences || cadences.length === 0 ? (
                <p className="text-sm text-muted-foreground">No cadences yet. Create one to get started.</p>
              ) : (
                <div className="space-y-3">
                  {cadences.map((cadence) => (
                    <Link key={cadence.id} href={`/cadences/${cadence.id}`}>
                      <div className="p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{cadence.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {cadence.steps.length} step{cadence.steps.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <Badge variant="secondary">{cadence.id}</Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Enrollments</CardTitle>
                  <CardDescription>Active workflow enrollments</CardDescription>
                </div>
                <Link href="/enrollments/new">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Enrollment
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {enrollmentsLoading ? (
                <p className="text-sm text-muted-foreground">Loading enrollments...</p>
              ) : !enrollments || enrollments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No enrollments yet. Create one to start a workflow.</p>
              ) : (
                <div className="space-y-3">
                  {enrollments.map((enrollment) => (
                    <Link key={enrollment.id} href={`/enrollments/${enrollment.id}`}>
                      <div className="p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{enrollment.contactEmail}</p>
                          <Badge
                            variant={
                              enrollment.status === 'COMPLETED'
                                ? 'success'
                                : enrollment.status === 'FAILED'
                                ? 'destructive'
                                : 'default'
                            }
                          >
                            {enrollment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Step {enrollment.currentStepIndex} • Version {enrollment.stepsVersion}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
