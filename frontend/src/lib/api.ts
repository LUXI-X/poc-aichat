export type Priority = "High" | "Medium" | "Low";

export type Task = {
  title: string;
  priority: Priority;
};

export type TodoResponse = {
  tasks: Task[];
};

export type SummaryResponse = {
  summary: string;
};

export type ActionResponse = {
  next_action: string;
};

export type ChatResponse = {
  reply: string;
};

export type ErrorResponse = {
  error: string;
  details?: string;
};

export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
};

export type DriveSession = {
  session_id: string;
  folder_id: string;
  files: DriveFile[];
  count: number;
};

export type AudioResponse = {
  transcript: string;
  language: string;
  summary?: string;
};

export type StreamChunk = {
  delta: string;
  [key: string]: any;
};

export async function transcribeAudio(file: File): Promise<AudioResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/transcribe-audio`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || "Failed to transcribe audio");
  }

  return response.json();
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function* readSSEStream(response: Response): AsyncGenerator<string> {
  if (!response.body) throw new Error("No response body");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data:")) continue;
      const raw = trimmed.slice(5).trim();
      if (raw === "[DONE]") return;
      yield raw;
    }
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `API Error: ${response.status} - ${response.statusText}`
      );
    }
    return response.json() as Promise<T>;
  }

  async *streamChat(
    text: string,
    driveContext?: string
  ): AsyncGenerator<StreamChunk> {
    const response = await fetch(`${this.baseUrl}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, drive_context: driveContext }),
    });
    if (!response.ok) throw new Error(`Stream error: ${response.status}`);
    for await (const raw of readSSEStream(response)) {
      try {
        yield JSON.parse(raw) as StreamChunk;
      } catch {
        yield { delta: raw };
      }
    }
  }

  async *streamSummary(
    text: string,
    driveContext?: string
  ): AsyncGenerator<StreamChunk> {
    const response = await fetch(`${this.baseUrl}/generate-summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, drive_context: driveContext }),
    });
    if (!response.ok) throw new Error(`Stream error: ${response.status}`);
    for await (const raw of readSSEStream(response)) {
      try {
        yield JSON.parse(raw) as StreamChunk;
      } catch {
        yield { delta: raw };
      }
    }
  }

  async *streamAction(
    text: string,
    driveContext?: string
  ): AsyncGenerator<StreamChunk> {
    const response = await fetch(`${this.baseUrl}/generate-action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, drive_context: driveContext }),
    });
    if (!response.ok) throw new Error(`Stream error: ${response.status}`);
    for await (const raw of readSSEStream(response)) {
      try {
        yield JSON.parse(raw) as StreamChunk;
      } catch {
        yield { delta: raw };
      }
    }
  }

  async generateTodo(text: string, driveContext?: string): Promise<TodoResponse> {
    const response = await fetch(`${this.baseUrl}/generate-todo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, drive_context: driveContext }),
    });
    return this.handleResponse<TodoResponse>(response);
  }

  async connectDrive(accessToken: string, folderId: string): Promise<DriveSession> {
    const response = await fetch(`${this.baseUrl}/drive/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: accessToken, folder_id: folderId }),
    });
    return this.handleResponse<DriveSession>(response);
  }

  async listDriveFiles(sessionId: string): Promise<{ files: DriveFile[]; count: number }> {
    const response = await fetch(`${this.baseUrl}/drive/${sessionId}/files`);
    return this.handleResponse<{ files: DriveFile[]; count: number }>(response);
  }

  async *streamDriveAnalysis(
    sessionId: string,
    text: string
  ): AsyncGenerator<StreamChunk> {
    const response = await fetch(`${this.baseUrl}/drive/${sessionId}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error(`Stream error: ${response.status}`);
    for await (const raw of readSSEStream(response)) {
      try {
        yield JSON.parse(raw) as StreamChunk;
      } catch {
        yield { delta: raw };
      }
    }
  }

  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch(`${this.baseUrl}/health`);
    return this.handleResponse<{ status: string }>(response);
  }
}

export const api = new ApiClient();
export default ApiClient;