import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CadenceStep, CreateEnrollmentDto } from 'shared-types'
import { createEnrollment, fetchEnrollment, fetchEnrollments, updateEnrollmentCadence } from '../api'
import { queryKeys } from '../query-keys'

export function useEnrollments() {
  return useQuery({
    queryKey: queryKeys.enrollments.all,
    queryFn: fetchEnrollments,
    staleTime: 0,
    refetchInterval: (query) => {
      const enrollments = query.state.data
      const hasRunning = enrollments?.some((e) => e.status === 'RUNNING')
      return hasRunning ? 2000 : false
    },
    refetchIntervalInBackground: true,
  })
}

export function useEnrollment(id: string, enablePolling = false) {
  return useQuery({
    queryKey: queryKeys.enrollments.detail(id),
    queryFn: () => fetchEnrollment(id),
    enabled: !!id,
    staleTime: 0,
    refetchInterval: (query) => {
      if (!enablePolling) return false
      const enrollment = query.state.data
      if (!enrollment) return 2000
      return enrollment.status === 'RUNNING' ? 2000 : false
    },
    refetchIntervalInBackground: true,
  })
}

export function useCreateEnrollment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEnrollmentDto) => createEnrollment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.all })
    },
  })
}

export function useUpdateEnrollmentCadence() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, steps }: { id: string; steps: CadenceStep[] }) =>
      updateEnrollmentCadence(id, steps),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.detail(variables.id) })
    },
  })
}
