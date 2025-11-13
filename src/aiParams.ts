import { ChainType } from "@/chainFactory";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatPromptTemplate } from "@langchain/core/prompts";

import { ModelCapability } from "@/constants";
import { settingsAtom, settingsStore } from "@/settings/model";
import { SelectedTextContext } from "@/types/message";
import { atom, useAtom } from "jotai";

const userModelKeyAtom = atom<string | null>(null);
const modelKeyAtom = atom(
  (get) => {
    const userValue = get(userModelKeyAtom);
    if (userValue !== null) {
      return userValue;
    }
    return get(settingsAtom).defaultModelKey;
  },
  (get, set, newValue) => {
    set(userModelKeyAtom, newValue);
  }
);

const userChainTypeAtom = atom<ChainType | null>(null);
const chainTypeAtom = atom(
  (get) => {
    const userValue = get(userChainTypeAtom);
    if (userValue !== null) {
      return userValue;
    }
    return get(settingsAtom).defaultChainType;
  },
  (get, set, newValue) => {
    set(userChainTypeAtom, newValue);
  }
);

const currentProjectAtom = atom<ProjectConfig | null>(null);
const projectLoadingAtom = atom<boolean>(false);

export interface FailedItem {
  path: string;
  type: "md" | "nonMd";
  error?: string;
  timestamp?: number;
}

interface ProjectContextLoadState {
  success: Array<string>;
  failed: Array<FailedItem>;
  processingFiles: Array<string>;
  total: Array<string>;
}

export const projectContextLoadAtom = atom<ProjectContextLoadState>({
  success: [],
  failed: [],
  processingFiles: [],
  total: [],
});

const selectedTextContextsAtom = atom<SelectedTextContext[]>([]);

export interface ProjectConfig {
  id: string;
  name: string;
  description?: string;
  systemPrompt: string;
  projectModelKey: string;
  modelConfigs: {
    temperature?: number;
    maxTokens?: number;
  };
  contextSource: {
    inclusions?: string;
    exclusions?: string;
  };
  created: number;
  UsageTimestamps: number;
}

export interface ModelConfig {
  modelName: string;
  temperature?: number;
  streaming: boolean;
  maxRetries: number;
  maxConcurrency: number;
  maxTokens?: number;
  maxCompletionTokens?: number;
  openAIApiKey?: string;
  openAIOrgId?: string;
  anthropicApiKey?: string;
  cohereApiKey?: string;
  azureOpenAIApiKey?: string;
  azureOpenAIApiInstanceName?: string;
  azureOpenAIApiDeploymentName?: string;
  azureOpenAIApiVersion?: string;
  // Google and TogetherAI API key share this property
  apiKey?: string;
  openAIProxyBaseUrl?: string;
  groqApiKey?: string;
  mistralApiKey?: string;
  enableCors?: boolean;
}

export interface SetChainOptions {
  prompt?: ChatPromptTemplate;
  chatModel?: BaseChatModel;
  noteFile?: any;
  abortController?: AbortController;
  refreshIndex?: boolean;
}

/**
 * ModelProvider represents a service provider (e.g., OpenAI, Kimi, Anthropic).
 * Each provider can host multiple models.
 */
export interface ModelProvider {
  /** Unique identifier (UUID) */
  id: string;
  /** Display name (e.g., "OpenAI", "Kimi", "月之暗面") */
  name: string;
  /** Provider type (e.g., "openai", "anthropic", "azure_openai") */
  type: string;
  /** API base URL */
  baseUrl: string;
  /** API key for authentication */
  apiKey: string;
  /** Whether this provider is enabled */
  enabled: boolean;
}

/**
 * CustomModel represents an AI model that belongs to a provider.
 * Simplified structure - provider-specific configs (baseUrl, apiKey) are now in ModelProvider.
 */
export interface CustomModel {
  /** Model name (e.g., "gpt-4", "claude-3-opus") */
  name: string;
  /** Reference to the provider ID */
  providerId: string;
  /** Whether this model is enabled */
  enabled: boolean;
  /** Whether this is an embedding model */
  isEmbeddingModel?: boolean;
  /** Enable CORS for this model */
  enableCors?: boolean;
  /** Whether to stream responses */
  stream?: boolean;
  /** Model temperature (0-1) */
  temperature?: number;
  /** Maximum tokens for generation */
  maxTokens?: number;
  /** Top-p sampling parameter */
  topP?: number;
  /** Frequency penalty */
  frequencyPenalty?: number;
  /** Whether enabled for project mode */
  projectEnabled?: boolean;
  /** Model capabilities (reasoning, vision, etc.) */
  capabilities?: ModelCapability[];
  /** Display name override */
  displayName?: string;
  /** Embedding dimension (for embedding models only) */
  dimensions?: number;
  /** Reasoning effort level (for reasoning models) */
  reasoningEffort?: "minimal" | "low" | "medium" | "high";
  /** Verbosity level (for reasoning models) */
  verbosity?: "low" | "medium" | "high";

  // Provider-specific deployment configurations (optional overrides)
  /** Override base URL for this specific model deployment */
  baseUrl?: string;
  /** Amazon Bedrock region (for Bedrock provider) */
  bedrockRegion?: string;
  /** Azure OpenAI instance name (for Azure provider) */
  azureOpenAIApiInstanceName?: string;
  /** Azure OpenAI chat deployment name (for Azure provider) */
  azureOpenAIApiDeploymentName?: string;
  /** Azure OpenAI embedding deployment name (for Azure provider) */
  azureOpenAIApiEmbeddingDeploymentName?: string;
  /** Azure OpenAI API version (for Azure provider) */
  azureOpenAIApiVersion?: string;
}

/**
 * Generates a unique model key from model and providerId.
 * Format: "modelName@providerId"
 */
export function getModelKeyFromModel(model: CustomModel): string {
  return `${model.name}@${model.providerId}`;
}

/**
 * Parses a model key into model name and provider ID.
 * @param modelKey - Format: "modelName@providerId"
 * @returns { modelName, providerId } or null if invalid
 */
export function parseModelKey(modelKey: string): { modelName: string; providerId: string } | null {
  const parts = modelKey.split("@");
  if (parts.length !== 2) {
    return null;
  }
  return {
    modelName: parts[0],
    providerId: parts[1],
  };
}

/**
 * Finds a provider by its ID from the providers list.
 * @param providers - List of providers
 * @param providerId - Provider ID to search for
 * @returns ModelProvider or null if not found
 */
export function getProviderById(
  providers: ModelProvider[],
  providerId: string
): ModelProvider | null {
  return providers.find((p) => p.id === providerId) || null;
}

/**
 * Gets the provider for a given model.
 * @param model - The model to get the provider for
 * @param providers - List of providers
 * @returns ModelProvider or null if not found
 */
export function getProviderForModel(
  model: CustomModel,
  providers: ModelProvider[]
): ModelProvider | null {
  return getProviderById(providers, model.providerId);
}

/**
 * Gets the provider type for a given model.
 * @param model - The model to get the provider type for
 * @param providers - List of providers
 * @returns Provider type string or empty string if not found
 */
export function getProviderType(model: CustomModel, providers: ModelProvider[]): string {
  const provider = getProviderForModel(model, providers);
  return provider?.type || "";
}

export function setModelKey(modelKey: string) {
  settingsStore.set(modelKeyAtom, modelKey);
}

export function getModelKey(): string {
  return settingsStore.get(modelKeyAtom);
}

export function subscribeToModelKeyChange(callback: () => void): () => void {
  return settingsStore.sub(modelKeyAtom, callback);
}

export function useModelKey() {
  return useAtom(modelKeyAtom, {
    store: settingsStore,
  });
}

export function getChainType(): ChainType {
  return settingsStore.get(chainTypeAtom);
}

export function setChainType(chainType: ChainType) {
  settingsStore.set(chainTypeAtom, chainType);
}

export function subscribeToChainTypeChange(callback: () => void): () => void {
  return settingsStore.sub(chainTypeAtom, callback);
}

export function useChainType() {
  return useAtom(chainTypeAtom, {
    store: settingsStore,
  });
}

export function setCurrentProject(project: ProjectConfig | null) {
  settingsStore.set(currentProjectAtom, project);
}

export function getCurrentProject(): ProjectConfig | null {
  return settingsStore.get(currentProjectAtom);
}

export function subscribeToProjectChange(
  callback: (project: ProjectConfig | null) => void
): () => void {
  return settingsStore.sub(currentProjectAtom, () => {
    callback(settingsStore.get(currentProjectAtom));
  });
}

export function useCurrentProject() {
  return useAtom(currentProjectAtom, {
    store: settingsStore,
  });
}

export function setProjectLoading(loading: boolean) {
  settingsStore.set(projectLoadingAtom, loading);
}

export function isProjectLoading(): boolean {
  return settingsStore.get(projectLoadingAtom);
}

export function subscribeToProjectLoadingChange(callback: (loading: boolean) => void): () => void {
  return settingsStore.sub(projectLoadingAtom, () => {
    callback(settingsStore.get(projectLoadingAtom));
  });
}

export function useProjectLoading() {
  return useAtom(projectLoadingAtom, {
    store: settingsStore,
  });
}

export function isProjectMode() {
  return getChainType() === ChainType.PROJECT_CHAIN;
}

export function setSelectedTextContexts(contexts: SelectedTextContext[]) {
  settingsStore.set(selectedTextContextsAtom, contexts);
}

export function getSelectedTextContexts(): SelectedTextContext[] {
  return settingsStore.get(selectedTextContextsAtom);
}

export function addSelectedTextContext(context: SelectedTextContext) {
  const current = getSelectedTextContexts();
  setSelectedTextContexts([...current, context]);
}

export function removeSelectedTextContext(id: string) {
  const current = getSelectedTextContexts();
  setSelectedTextContexts(current.filter((context) => context.id !== id));
}

export function clearSelectedTextContexts() {
  setSelectedTextContexts([]);
}

export function useSelectedTextContexts() {
  return useAtom(selectedTextContextsAtom, {
    store: settingsStore,
  });
}

/**
 * Gets the project context load state from the atom.
 */
export function getProjectContextLoadState(): Readonly<ProjectContextLoadState> {
  return settingsStore.get(projectContextLoadAtom);
}

/**
 * Sets the project context load state in the atom.
 */
export function setProjectContextLoadState(state: ProjectContextLoadState) {
  settingsStore.set(projectContextLoadAtom, state);
}

/**
 * Updates a specific field in the project context load state.
 */
export function updateProjectContextLoadState<K extends keyof ProjectContextLoadState>(
  key: K,
  valueFn: (prev: ProjectContextLoadState[K]) => ProjectContextLoadState[K]
) {
  settingsStore.set(projectContextLoadAtom, (prev) => ({
    ...prev,
    [key]: valueFn(prev[key]),
  }));
}

/**
 * Subscribes to changes in the project context load state.
 */
export function subscribeToProjectContextLoadChange(
  callback: (state: ProjectContextLoadState) => void
): () => void {
  return settingsStore.sub(projectContextLoadAtom, () => {
    callback(settingsStore.get(projectContextLoadAtom));
  });
}

/**
 * Hook to get the project context load state from the atom.
 */
export function useProjectContextLoad() {
  return useAtom(projectContextLoadAtom, {
    store: settingsStore,
  });
}
