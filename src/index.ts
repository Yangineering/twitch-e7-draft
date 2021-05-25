import { ChatClient } from 'twitch-chat-client';
import { StaticAuthProvider, RefreshableAuthProvider, AuthProvider } from 'twitch-auth';
import dotenv from 'dotenv';
// import { promises as fs } from "fs";
import express from 'express';
import open from 'open';
import fetch from 'node-fetch';

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
    access_token: string;
    refresh_token: string;
    expires_in: number;
  },
): Promise<AuthProvider> {
  const auth = new RefreshableAuthProvider(new StaticAuthProvider(clientId, tokenData.access_token), {
    clientSecret,
    refreshToken: tokenData.refresh_token,
    expiry: tokenData.expires_in === null ? null : new Date(Date.now() + tokenData.expires_in),
    // onRefresh: async ({ accessToken, refreshToken, expiryDate }) => {
    //   const newTokenData = {
    //     accessToken,
    //     refreshToken,
    //     expiryTimestamp: expiryDate === null ? null : expiryDate.getTime(),
    //   };
    // TODO: store in db for this user
    // await fs.writeFile(
    //   "./tokens.json",
    //   JSON.stringify(newTokenData, null, 4),
    //   "utf8"
    // );
    // },
  });

  return auth;
}

const draft: Map<string, number> = new Map();
const users: Map<string, boolean> = new Map();

async function createDrafterClient(chatClient: ChatClient) {
  await chatClient.connect();
  chatClient.onMessage((channel, user, message) => {
    if (channel == `#${user}`) {
      if (message == '!startDraft') {
        startDraft(chatClient);
      } else if (message == '!endDraft') {
        endDraft(chatClient);
      }
    }
  });
}
async function startDraft(chatClient: ChatClient) {
  chatClient.say(channel, 'Starting Draft');

  chatClient.onMessage((channel, user, message) => {
    if (message.startsWith('!pick')) {
      if (!users.has(user)) {
        const pick = message.slice(5).trim();
        chatClient.say(channel, pick);

        draft.set(pick, draft.get(pick) || 0 + 1);

        // TODO: parse for which hero (check synonymns)
        users.set(user, true);
      } else {
        console.log('user already picked');
      }
    }
  });
}
async function endDraft(chatClient: ChatClient) {
  chatClient.say(channel, 'Draft Ended');
  console.log(draft.toString());
  console.log(users.toString());
  draft.clear();
  users.clear();
}
async function main(code: string) {
  const response = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&code=${code}&grant_type=authorization_code&redirect_uri=${redirectURI}`,
    { method: 'POST' },
  );
  const tokenData = await response.json();
  const authProvider = await getAuthProvider(clientId, tokenData);
  const chatClient = new ChatClient(authProvider, { channels: [channel] });
  createDrafterClient(chatClient);
}
app.get('/', function (req: express.Request, res: express.Response) {
  console.log(req.query.code);
  if (parseInt(`${req.query.state}`) == state) {
    res.send('e7_bot has received authentication');
    main(`${req.query.code}`);
  } else {
    res.send('State does not match! Potential security vulnerability detected.');
  }
});
app.listen(3000);
open(
  `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURI(
    redirectURI,
  )}&response_type=code&scope=chat:read+chat:edit&force_verify=true&state=${state}`,
);
