import { ChatClient } from "twitch-chat-client";
import {
  StaticAuthProvider,
  RefreshableAuthProvider,
  AuthProvider,
} from "twitch-auth";
import dotenv from "dotenv";
import { promises as fs } from "fs";
import express from "express";
import open from "open";
import fetch from "node-fetch";

dotenv.config();

const clientSecret = `${process.env.clientSecret}`;
const clientId = `${process.env.clientId}`;
const channel = `${process.env.channel}`;
const redirectURI = `${process.env.redirectURI}`;

const app = express();
const state = Date.now();

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
        // store in db for this user
        // await fs.writeFile(
        //   "./tokens.json",
        //   JSON.stringify(newTokenData, null, 4),
        //   "utf8"
        // );
      },
    }
  );

  return auth;
}

async function createClient(chatClient: ChatClient) {
  // listen to more events...
  await chatClient.connect();
  chatClient.onMessage((channel, user, message) => {
    // check if user has already voted
    if (message.startsWith("!pick")) {
      const pick = message.slice(5).trim();
      chatClient.say(channel, pick);
    }
  });
}
async function main(code: string) {
  const response = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&code=${code}&grant_type=authorization_code&redirect_uri=${redirectURI}`,
    { method: "POST" }
  );
  const tokenData = await response.json();

  // const tokenData = JSON.parse(await fs.readFile("./tokens.json", "utf8"));
  const authProvider = await getAuthProvider(clientId, tokenData);
  const chatClient = new ChatClient(authProvider, { channels: [channel] });
  createClient(chatClient);
}
app.get("/", function (req: express.Request, res: express.Response) {
  console.log(req.query.code);
  if (parseInt(`${req.query.state}`) == state) {
    res.send("e7_bot has received authentication");
    main(`${req.query.code}`);
  } else {
    res.send(
      "State does not match! Potential security vulnerability detected."
    );
  }
});
app.listen(3000);
open(
  `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURI(
    redirectURI
  )}&response_type=code&scope=chat:read+chat:edit&force_verify=true&state=${state}`
);
