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

// Add a handler for conversation update events (like new members added)
app.activity("conversationUpdate", async (context, state) => {
  // Check if there are any new members added
  const membersAdded = context.activity.membersAdded;
  if (membersAdded && membersAdded.length > 0) {
    // Loop through all the new members
    for (const member of membersAdded) {
      // Avoid sending a welcome message if the new member is the bot itself
      if (member.id !== context.activity.recipient.id) {
        // Send a welcome message to the new member
        await context.sendActivity("Hi there! Welcome to the bot. Let me know if you need anything!");
      }
    }
  }
});

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

