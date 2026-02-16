import { Cadence, CadenceStep, Enrollment, CreateCadenceDto, CreateEnrollmentDto } from 'shared-types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}

export async function fetchCadences(): Promise<Cadence[]> {
  return fetcher<Cadence[]>('/cadences')
}

export async function fetchCadence(id: string): Promise<Cadence> {
  return fetcher<Cadence>(`/cadences/${id}`)
}

export async function createCadence(data: CreateCadenceDto): Promise<Cadence> {
  return fetcher<Cadence>('/cadences', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateCadence(id: string, data: Partial<Cadence>): Promise<Cadence> {
  return fetcher<Cadence>(`/cadences/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function fetchEnrollments(): Promise<Enrollment[]> {
  return fetcher<Enrollment[]>('/enrollments')
}

export async function fetchEnrollment(id: string): Promise<Enrollment> {
  return fetcher<Enrollment>(`/enrollments/${id}`)
}

export async function createEnrollment(data: CreateEnrollmentDto): Promise<Enrollment> {
  return fetcher<Enrollment>('/enrollments', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateEnrollmentCadence(id: string, steps: CadenceStep[]): Promise<{ accepted: boolean }> {
  return fetcher<{ accepted: boolean }>(`/enrollments/${id}/update-cadence`, {
    method: 'POST',
    body: JSON.stringify({ steps }),
  })
}
