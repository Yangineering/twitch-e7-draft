import { ChatClient } from "twitch-chat-client";
import {
  StaticAuthProvider,
  RefreshableAuthProvider,
  ClientCredentialsAuthProvider,
} from "twitch-auth";
import dotenv from "dotenv";
import { promises as fs } from "fs";

dotenv.config();

console.log(process.env.clientID);
const clientSecret = `${process.env.clientSecret}`;
const clientId = `${process.env.clientId}`;

const appTokenProvider = new ClientCredentialsAuthProvider(
  clientId,
  clientSecret
);
const accessToken = appTokenProvider.getAccessToken();
appTokenProvider.refresh();

const authProvider = new RefreshableAuthProvider(
  new StaticAuthProvider(clientId, accessToken),
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
        "UTF-8"
      );
    },
  }
);
// const authProvider = new StaticAuthProvider(clientId, accessToken);
const chatClient = new ChatClient(authProvider, { channels: ["endqwerty"] });

async function createClient(chatClient: ChatClient) {
  // listen to more events...
  await chatClient.connect();
}

createClient(chatClient);
