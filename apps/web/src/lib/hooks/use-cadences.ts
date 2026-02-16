import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../query-keys'
import { fetchCadences, fetchCadence, createCadence, updateCadence } from '../api'
import { CreateCadenceDto, Cadence } from 'shared-types'

export function useCadences() {
  return useQuery({
    queryKey: queryKeys.cadences.all,
    queryFn: fetchCadences,
  })
}

export function useCadence(id: string) {
  return useQuery({
    queryKey: queryKeys.cadences.detail(id),
    queryFn: () => fetchCadence(id),
    enabled: !!id,
  })
}

export function useCreateCadence() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCadenceDto) => createCadence(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cadences.all })
    },
  })
}

export function useUpdateCadence() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Cadence> }) =>
      updateCadence(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cadences.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.cadences.detail(variables.id) })
    },
  })
}
