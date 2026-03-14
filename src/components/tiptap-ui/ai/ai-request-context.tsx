import React from 'react';

export interface AIRequestPayload {
  text: string;
  option: string;
  projectId: string;
  beforeContext?: string;
  afterContext?: string;
}

interface AIRequestContextValue {
  onAIRequest?: (payload: AIRequestPayload) => Promise<Response>;
}

export const AIRequestContext = React.createContext<AIRequestContextValue>({});
