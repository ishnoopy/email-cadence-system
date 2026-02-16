export const queryKeys = {
  cadences: {
    all: ['cadences'] as const,
    detail: (id: string) => ['cadences', id] as const,
  },
  enrollments: {
    all: ['enrollments'] as const,
    detail: (id: string) => ['enrollments', id] as const,
  },
}
