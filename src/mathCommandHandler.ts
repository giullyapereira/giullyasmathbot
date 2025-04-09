import { TurnContext } from "botbuilder";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

// Don't create the client here - wait until after env vars are loaded

export async function mathCommandHandler(context: TurnContext, state: any): Promise<void> {

  console.log('------- MATH COMMAND HANDLER -------');
  console.log('Received message:', context.activity.text);  // Extract math question from the message
  
  const message = context.activity.text;
  const mathQuestion = message.replace(/^\/math\s+/i, "").trim();
  
  // Log environment variables after they've been loaded
  console.log("Environment variables in handler:");
  console.log("AWS_REGION:", process.env.AWS_REGION);
  console.log("AWS_ACCESS_KEY_ID exists:", !!process.env.AWS_ACCESS_KEY_ID);
  console.log("AWS_SECRET_ACCESS_KEY exists:", !!process.env.AWS_SECRET_ACCESS_KEY);
  console.log("AWS_BEDROCK_MODEL_ID:", process.env.AWS_BEDROCK_MODEL_ID);
  
  if (!mathQuestion) {
    await context.sendActivity("Please provide a math question. For example: `/math Solve for x: 2x + 3 = 7`");
    return;
  }

  try {
    await context.sendActivity("Solving your math problem...");
    const response = await solveMathProblem(mathQuestion);
    await context.sendActivity(response);
  } catch (error) {
    console.error("Error details:", error);
    await context.sendActivity(`Error: ${error.message}`);
  }
}

export async function solveMathProblem(mathQuestion: string): Promise<string> {
  // Create the Bedrock client here, after environment variables are loaded
  const bedrockClient = new BedrockRuntimeClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
    }
  });

  // Use the correct model ID
  const MODEL_ID = process.env.AWS_BEDROCK_MODEL_ID || "anthropic.claude-3-5-sonnet-20240620-v1:0";
  
  // Prepare the prompt for the AI model
  const promptText = `You are a math tutor assistant. Please solve the following math problem step by step, showing your work clearly. If multiple approaches are possible, show the most straightforward one.

Math Problem: ${mathQuestion}`;

  try {
    // Format the payload according to the model type
    let payload: any = {};
    
    if (MODEL_ID.includes("anthropic.claude")) {
      // Updated Claude model format
      payload = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: promptText
              }
            ]
          }
        ]
      };
    } else if (MODEL_ID.includes("amazon.titan")) {
      // Amazon Titan model format
      payload = {
        inputText: promptText,
        textGenerationConfig: {
          maxTokenCount: 1000,
          temperature: 0,
          topP: 0.9
        }
      };
    } else {
      throw new Error(`Unsupported model: ${MODEL_ID}`);
    }

    console.log("Sending request to AWS Bedrock");
    console.log("Using model:", MODEL_ID);
    
    // Call AWS Bedrock
    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      body: JSON.stringify(payload),
      contentType: "application/json",
      accept: "application/json"
    });

    console.log("Waiting for response from AWS Bedrock");
    const response = await bedrockClient.send(command);
    console.log("Received response from AWS Bedrock");
    
    // Parse the response based on model type
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    console.log("Response body structure:", Object.keys(responseBody));
    
    let solution = "";
    if (MODEL_ID.includes("anthropic.claude")) {
      solution = responseBody.content[0].text;
    } else if (MODEL_ID.includes("amazon.titan")) {
      solution = responseBody.results[0].outputText;
    }

    return solution;
  } catch (error) {
    console.error("Error calling AWS Bedrock:", error);
    throw error;
  }
}