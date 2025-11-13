/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomModel, getProviderForModel, getProviderType } from "@/aiParams";
import { EmbeddingModelProviders, ProviderInfo } from "@/constants";
import { getDecryptedKey } from "@/encryptionService";
import { CustomError } from "@/error";
import { getModelKeyFromModel } from "@/aiParams";
import { getSettings, subscribeToSettingsChange } from "@/settings/model";
import { logError } from "@/logger";
import { err2String, safeFetch } from "@/utils";
import { CohereEmbeddings } from "@langchain/cohere";
import { Embeddings } from "@langchain/core/embeddings";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { OllamaEmbeddings } from "@langchain/ollama";
import { AzureOpenAIEmbeddings, OpenAIEmbeddings } from "@langchain/openai";
import { Notice } from "obsidian";
import { CustomOpenAIEmbeddings } from "./CustomOpenAIEmbeddings";

type EmbeddingConstructorType = new (config: any) => Embeddings;

const EMBEDDING_PROVIDER_CONSTRUCTORS = {
  [EmbeddingModelProviders.OPENAI]: OpenAIEmbeddings,
  [EmbeddingModelProviders.COHEREAI]: CohereEmbeddings,
  [EmbeddingModelProviders.GOOGLE]: GoogleGenerativeAIEmbeddings,
  [EmbeddingModelProviders.AZURE_OPENAI]: AzureOpenAIEmbeddings,
  [EmbeddingModelProviders.OLLAMA]: OllamaEmbeddings,
  [EmbeddingModelProviders.LM_STUDIO]: CustomOpenAIEmbeddings,
  [EmbeddingModelProviders.OPENAI_FORMAT]: OpenAIEmbeddings,
  [EmbeddingModelProviders.SILICONFLOW]: CustomOpenAIEmbeddings,
} as const;

type EmbeddingProviderConstructorMap = typeof EMBEDDING_PROVIDER_CONSTRUCTORS;

export default class EmbeddingManager {
  private activeEmbeddingModels: CustomModel[];
  private static instance: EmbeddingManager;
  private static embeddingModel: Embeddings;
  private static modelMap: Record<
    string,
    {
      hasApiKey: boolean;
      EmbeddingConstructor: EmbeddingConstructorType;
      vendor: string;
    }
  >;

  /**
   * Helper method to get provider info for a model.
   * Returns provider's baseUrl and apiKey, with model-level baseUrl override support.
   */
  private getProviderInfo(customModel: CustomModel): {
    baseUrl: string | undefined;
    apiKey: string;
    type: string;
  } {
    const settings = getSettings();
    const provider = getProviderForModel(customModel, settings.providers);

    if (!provider) {
      logError(`Provider not found for model: ${customModel.name}`);
      return {
        baseUrl: undefined,
        apiKey: "",
        type: "",
      };
    }

    return {
      // Use model-specific baseUrl if provided, otherwise use provider's baseUrl
      baseUrl: customModel.baseUrl || provider.baseUrl,
      apiKey: provider.apiKey,
      type: provider.type,
    };
  }

  private constructor() {
    this.initialize();
    subscribeToSettingsChange(() => this.initialize());
  }

  private initialize() {
    const activeEmbeddingModels = getSettings().activeEmbeddingModels;
    this.activeEmbeddingModels = activeEmbeddingModels;
    this.buildModelMap(activeEmbeddingModels);
  }

  static getInstance(): EmbeddingManager {
    if (!EmbeddingManager.instance) {
      EmbeddingManager.instance = new EmbeddingManager();
    }
    return EmbeddingManager.instance;
  }

  getProviderConstructor(model: CustomModel): EmbeddingConstructorType {
    const providerType = getProviderType(model, getSettings().providers);
    const constructor = EMBEDDING_PROVIDER_CONSTRUCTORS[providerType as EmbeddingModelProviders];
    if (!constructor) {
      console.warn(`Unknown provider: ${providerType} for model: ${model.name}`);
      throw new Error(`Unknown provider: ${providerType} for model: ${model.name}`);
    }
    return constructor;
  }

  // Build a map of modelKey to model config
  private buildModelMap(activeEmbeddingModels: CustomModel[]) {
    EmbeddingManager.modelMap = {};
    const modelMap = EmbeddingManager.modelMap;

    activeEmbeddingModels.forEach((model) => {
      if (model.enabled) {
        const providerType = getProviderType(model, getSettings().providers);
        if (
          !Object.values(EmbeddingModelProviders).contains(providerType as EmbeddingModelProviders)
        ) {
          console.warn(`Unknown provider: ${providerType} for embedding model: ${model.name}`);
          return;
        }
        const constructor = this.getProviderConstructor(model);
        const providerInfo = this.getProviderInfo(model);

        const modelKey = getModelKeyFromModel(model);
        modelMap[modelKey] = {
          hasApiKey: Boolean(providerInfo.apiKey),
          EmbeddingConstructor: constructor,
          vendor: providerType,
        };
      }
    });
  }

  static getModelName(embeddingsInstance: Embeddings): string {
    const emb = embeddingsInstance as any;
    if ("model" in emb && emb.model) {
      return emb.model as string;
    } else if ("modelName" in emb && emb.modelName) {
      return emb.modelName as string;
    } else {
      throw new Error(
        `Embeddings instance missing model or modelName properties: ${embeddingsInstance}`
      );
    }
  }

  // Get the custom model that matches the name and provider from the model key
  private getCustomModel(modelKey: string): CustomModel {
    return this.activeEmbeddingModels.filter((model) => {
      const key = getModelKeyFromModel(model);
      return modelKey === key;
    })[0];
  }

  async getEmbeddingsAPI(): Promise<Embeddings> {
    const { embeddingModelKey } = getSettings();

    if (!EmbeddingManager.modelMap.hasOwnProperty(embeddingModelKey)) {
      throw new CustomError(`No embedding model found for: ${embeddingModelKey}`);
    }

    const customModel = this.getCustomModel(embeddingModelKey);

    const selectedModel = EmbeddingManager.modelMap[embeddingModelKey];
    if (!selectedModel.hasApiKey) {
      throw new CustomError(
        `API key is not provided for the embedding model: ${embeddingModelKey}`
      );
    }

    const config = await this.getEmbeddingConfig(customModel);

    try {
      EmbeddingManager.embeddingModel = new selectedModel.EmbeddingConstructor(config);
      return EmbeddingManager.embeddingModel;
    } catch (error) {
      throw new CustomError(
        `Error creating embedding model: ${embeddingModelKey}. ${error.message}`
      );
    }
  }

  private async getEmbeddingConfig(customModel: CustomModel): Promise<any> {
    const modelName = customModel.name;
    const providerInfo = this.getProviderInfo(customModel);

    const baseConfig = {
      maxRetries: 3,
      maxConcurrency: 3,
    };

    // Define a type that includes additional configuration properties
    type ExtendedConfig<T> = T & {
      configuration?: {
        baseURL?: string;
        fetch?: (url: string, options: RequestInit) => Promise<Response>;
        dangerouslyAllowBrowser?: boolean;
      };
      timeout?: number;
      batchSize?: number;
      dimensions?: number;
    };

    // Update the type definition to include the extended configuration
    const providerConfig: {
      [K in keyof EmbeddingProviderConstructorMap]: ExtendedConfig<
        ConstructorParameters<EmbeddingProviderConstructorMap[K]>[0]
      >;
    } = {
      [EmbeddingModelProviders.OPENAI]: {
        modelName,
        apiKey: await getDecryptedKey(providerInfo.apiKey),
        timeout: 10000,
        batchSize: getSettings().embeddingBatchSize,
        configuration: {
          baseURL: providerInfo.baseUrl,
          fetch: customModel.enableCors ? safeFetch : undefined,
        },
      },
      [EmbeddingModelProviders.COHEREAI]: {
        model: modelName,
        apiKey: await getDecryptedKey(providerInfo.apiKey),
      },
      [EmbeddingModelProviders.GOOGLE]: {
        modelName: modelName,
        apiKey: await getDecryptedKey(providerInfo.apiKey),
      },
      [EmbeddingModelProviders.AZURE_OPENAI]: {
        modelName,
        azureOpenAIApiKey: await getDecryptedKey(providerInfo.apiKey),
        azureOpenAIApiInstanceName: customModel.azureOpenAIApiInstanceName,
        azureOpenAIApiDeploymentName: customModel.azureOpenAIApiEmbeddingDeploymentName,
        azureOpenAIApiVersion: customModel.azureOpenAIApiVersion,
      },
      [EmbeddingModelProviders.OLLAMA]: {
        baseUrl: providerInfo.baseUrl || "http://localhost:11434",
        model: modelName,
        truncate: true,
        headers: {
          Authorization: `Bearer ${await getDecryptedKey(providerInfo.apiKey || "default-key")}`,
        },
      },
      [EmbeddingModelProviders.LM_STUDIO]: {
        modelName,
        openAIApiKey: await getDecryptedKey(providerInfo.apiKey || "default-key"),
        configuration: {
          baseURL: providerInfo.baseUrl || "http://localhost:1234/v1",
          fetch: customModel.enableCors ? safeFetch : undefined,
        },
      },
      [EmbeddingModelProviders.OPENAI_FORMAT]: {
        modelName,
        openAIApiKey: await getDecryptedKey(providerInfo.apiKey),
        batchSize: getSettings().embeddingBatchSize,
        configuration: {
          baseURL: providerInfo.baseUrl,
          fetch: customModel.enableCors ? safeFetch : undefined,
          dangerouslyAllowBrowser: true,
        },
      },
      [EmbeddingModelProviders.SILICONFLOW]: {
        modelName,
        apiKey: await getDecryptedKey(providerInfo.apiKey),
        batchSize: getSettings().embeddingBatchSize,
        configuration: {
          baseURL: providerInfo.baseUrl || ProviderInfo[EmbeddingModelProviders.SILICONFLOW].host,
          fetch: customModel.enableCors ? safeFetch : undefined,
        },
      },
    };

    const selectedProviderConfig =
      providerConfig[providerInfo.type as EmbeddingModelProviders] || {};

    return { ...baseConfig, ...selectedProviderConfig };
  }

  async ping(model: CustomModel): Promise<boolean> {
    const tryPing = async (enableCors: boolean) => {
      const modelToTest = { ...model, enableCors };
      const config = await this.getEmbeddingConfig(modelToTest);
      const testModel = new (this.getProviderConstructor(modelToTest))(config);
      await testModel.embedQuery("test");
    };

    try {
      // First try without CORS
      await tryPing(false);
      return true;
    } catch (firstError) {
      console.log("First ping attempt failed, trying with CORS...");
      try {
        // Second try with CORS
        await tryPing(true);
        new Notice(
          "Connection successful, but requires CORS to be enabled. Please enable CORS for this model once you add it above."
        );
        return true;
      } catch (error) {
        const msg =
          "\nwithout CORS Error: " +
          err2String(firstError) +
          "\nwith CORS Error: " +
          err2String(error);
        throw new Error(msg);
      }
    }
  }
}
