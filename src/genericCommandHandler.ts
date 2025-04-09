import { Selector } from "@microsoft/teams-ai";
import { Activity, TurnContext } from "botbuilder";
import { ApplicationTurnState } from "./internal/interface";
import { mathCommandHandler } from "./mathCommandHandler";

/**
 * The `GenericCommandHandler` registers patterns and responds
 * with appropriate messages if the user types general command inputs, such as "hi", "hello", and "help".
 */
export class GenericCommandHandler {
  triggerPatterns: string | RegExp | Selector | (string | RegExp | Selector)[] = new RegExp(/^.+$/);
  async handleCommandReceived(
    context: TurnContext,
    state: ApplicationTurnState
  ): Promise<string | Partial<Activity> | void> {
    console.log(`App received message: ${context.activity.text}`);
    const text = context.activity.text.toLowerCase().trim();
    
    // More precise matching
    if (["hi", "hello"].includes(text)) {
      return "Hello! I'm Giullya's Math Bot. Ask me any math question using the /math command!";
    } else if (text === "help") {
      return "Here's how to use me:\n- Type '/math' followed by your math question\n- Example: /math Solve for x: 2x+3=7\n- Type 'hi' or 'hello' for a greeting";
    } else if (text.startsWith("/math")) {
      // This won't execute if you've properly registered the math handler,
      // but it's a backup in case the message falls through
      await mathCommandHandler(context, state);
      return;
    } else {
      return `I didn't understand that. Try using the /math command followed by a math question. Type 'help' for more information.`;
    }
  }
}
