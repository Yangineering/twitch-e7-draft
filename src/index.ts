import { ChatClient } from "twitch-chat-client";
import {
  AccessToken,
  StaticAuthProvider,
  RefreshableAuthProvider,
  ClientCredentialsAuthProvider,
  AuthProvider,
} from "twitch-auth";
import dotenv from "dotenv";
import { promises as fs } from "fs";

dotenv.config();

const clientSecret = `${process.env.clientSecret}`;
const clientId = `${process.env.clientId}`;

async function getAccessToken(
  clientId: string,
  clientSecret: string
): Promise<AccessToken> {
  const appTokenProvider = new ClientCredentialsAuthProvider(
    clientId,
    clientSecret
  );
  return appTokenProvider.getAccessToken();
}

async function getAuthProvider(
  clientId: string,
  tokenData: {
    accessToken: string;
    refreshToken: string;
    expiryTimestamp: Date;
  }
): Promise<AuthProvider> {
  const auth = new RefreshableAuthProvider(
    new StaticAuthProvider(clientId, tokenData.accessToken),
    {
      clientSecret,
      refreshToken: tokenData.refreshToken,
      expiry:
        tokenData.expiryTimestamp === null
          ? null
          : new Date(tokenData.expiryTimestamp),
      onRefresh: async ({ accessToken, refreshToken, expiryDate }) => {
        const newTokenData = {
          accessToken,
          refreshToken,
          expiryTimestamp: expiryDate === null ? null : expiryDate.getTime(),
        };
        await fs.writeFile(
          "./tokens.json",
          JSON.stringify(newTokenData, null, 4),
          "utf8"
        );
      },
    }
  );

  return auth;
}

async function createClient(chatClient: ChatClient) {
  // listen to more events...
  await chatClient.connect();
  chatClient.onMessage((channel, user, message) => {
    if (message === "!ping") {
      chatClient.say(channel, "Pong!");
    } else if (message === "!dice") {
      const diceRoll = Math.floor(Math.random() * 6) + 1;
      chatClient.say(channel, `@${user} rolled a ${diceRoll}`);
    }
  });
}

async function main() {
  const tokenData = JSON.parse(await fs.readFile("./tokens.json", "utf8"));

  const authProvider = await getAuthProvider(clientId, tokenData);
  const chatClient = new ChatClient(authProvider, { channels: ["endqwerty"] });
  createClient(chatClient);
}

main();
