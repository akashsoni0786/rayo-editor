// URL path generation helpers
export const routes = {
  projectSettings: (projectId: string) => `/project/${projectId}/settings`,
  projectSettingsStorage: (projectId: string) => `/project/${projectId}/settings?tab=storage`,
  projectSettingsCMS: (projectId: string) => `/project/${projectId}/settings?tab=cms`,
} as const;
