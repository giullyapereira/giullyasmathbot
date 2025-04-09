import { TurnContext } from "botbuilder";
import express from "express";
import { GenericCommandHandler } from "./genericCommandHandler";
import { HelloWorldCommandHandler } from "./helloworldCommandHandler";
import { adapter } from "./internal/initialize";
import { ApplicationTurnState } from "./internal/interface";
import { app } from "./teamsBot";
import { mathCommandHandler } from "./mathCommandHandler";

// This template uses `express` to serve HTTP responses.
// Create express application.
const expressApp = express();
expressApp.use(express.json());

const server = expressApp.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log(`\nBot Started, ${expressApp.name} listening to`, server.address());
});

// Listen for user to say 'helloWorld'
const helloworldCommandHandler = new HelloWorldCommandHandler();
app.message(
  helloworldCommandHandler.triggerPatterns,
  async (context: TurnContext, state: ApplicationTurnState) => {
    const reply = await helloworldCommandHandler.handleCommandReceived(context, state);
    if (reply) {
      await context.sendActivity(reply);
    }
  }
);

// Improve /math command handler
app.message(
  /^\/math/i,
  async (context: TurnContext, state: ApplicationTurnState) => {
    console.log(`Received /math command. Full message: ${context.activity.text}`);
    try {
      await mathCommandHandler(context, state);
    } catch (error) {
      console.error('Error in /math command handler:', error);
      await context.sendActivity('Sorry, there was an error processing your math command.');
    }
  }
);

// Generic command handler (REMOVED DUPLICATE)
const genericCommandHandler = new GenericCommandHandler();
app.message(
  genericCommandHandler.triggerPatterns,
  async (context: TurnContext, state: ApplicationTurnState) => {
    console.log(`Received message: ${context.activity.text}`);
    try {
      const reply = await genericCommandHandler.handleCommandReceived(context, state);
      if (reply) {
        console.log(`Sending reply: ${reply}`);
        await context.sendActivity(reply);
      }
    } catch (error) {
      console.error('Error in generic command handler:', error);
    }
  }
);

// Register an API endpoint with `express`. Teams sends messages to your application
// through this endpoint.
expressApp.post("/api/messages", async (req, res) => {
  await adapter.process(req, res, async (context) => {
    await app.run(context);
  });
});