/**
 * get model name and provider from a formatted string,
 * e.g. `gpt-4@OpenAi` or `claude-3-5-sonnet@20240620@Google`
 * @param modelWithProvider model name with provider separated by last `@` char,
 * @returns [model, provider] tuple, if no `@` char found, provider is undefined
 */
export function getModelProvider(modelWithProvider: string): [string, string?] {
    const [model, provider] = modelWithProvider.split(/@(?!.*@)/);
    return [model, provider];
  }
  


  /**
 * Check if the model name is a GPT-4 related model
 *
 * @param modelName The name of the model to check
 * @returns True if the model is a GPT-4 related model (excluding gpt-4o-mini)
 */
export function isGPT4Model(modelName: string): boolean {
    return (
      (modelName.startsWith("gpt-4") ||
        modelName.startsWith("chatgpt-4o") ||
        modelName.startsWith("o1")) &&
      !modelName.startsWith("gpt-4o-mini")
    );
  }