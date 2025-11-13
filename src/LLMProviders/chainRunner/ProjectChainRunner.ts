import { AdvancedChainRunner } from "./AdvancedChainRunner";

/**
 * ProjectChainRunner - Chain runner for project-based chats
 *
 * Project context is automatically added to L1 via ChatManager.getSystemPromptForMessage()
 * No override needed - inherits all behavior from AdvancedChainRunner
 */
export class ProjectChainRunner extends AdvancedChainRunner {
  // No overrides needed - project context automatically in L1 via ChatManager
}
