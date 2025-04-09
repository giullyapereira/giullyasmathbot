import { Application } from "@microsoft/teams-ai";
import { MemoryStorage } from "botbuilder";
import { ApplicationTurnState } from "./internal/interface";
import { mathCommandHandler, solveMathProblem } from "./mathCommandHandler";
import { loadEnvironmentVariables } from "./internal/environmentLoader";

// Load environment variables manually
loadEnvironmentVariables();

// Define storage and application
const storage = new MemoryStorage();
export const app = new Application<ApplicationTurnState>({
  storage,
});

// Register the math command
app.message("/math", mathCommandHandler);

// Add this to teamsBot.ts
app.activity("message", async (context, state) => {
  const text = context.activity.text;
  // Skip command messages
  if (text.startsWith("/")) return;
  
  // Try to solve math problem
  try {
    const response = await solveMathProblem(text);
    await context.sendActivity(response);
  } catch (error) {
    console.error("Error solving math problem:", error);
    await context.sendActivity("Sorry, I couldn't understand that as a math question.");
  }
});

