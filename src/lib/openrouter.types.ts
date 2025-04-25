import { z } from "zod";

// Types for request/response
export interface ChatCompletionRequest {
  userMessage: string;
  systemMessage?: string;
  modelParams?: ModelParameters;
  model?: string;
}

export interface ChatCompletionResponse {
  text: string;
  tags: string[];
}

export interface ModelParameters {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface OpenRouterConfig {
  apiKey: string;
  baseURL: string;
  defaultModel: string;
  modelParams: ModelParameters;
  defaultSystemMessage: string;
}

export interface RequestPayload {
  model: string;
  messages: {
    role: "system" | "user" | "assistant";
    content: string;
  }[];
  response_format: {
    type: string;
    json_schema: {
      name: string;
      strict: boolean;
      schema: Record<string, unknown>;
    };
  };
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

// Custom error types
export class NetworkError extends Error {
  constructor(
    message: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = "NetworkError";
  }
}

export class APIError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly response?: Record<string, unknown>
  ) {
    super(message);
    this.name = "APIError";
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly data?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
  }
}

// Zod schema for response validation
export const responseSchema = z.object({
  text: z.string(),
  tags: z.array(z.string()),
});
