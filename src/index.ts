import { ChatClient } from 'twitch-chat-client';
import { StaticAuthProvider, RefreshableAuthProvider, AuthProvider } from 'twitch-auth';
import dotenv from 'dotenv';
import express from 'express';
import fetch from 'node-fetch';
import NameChecker from './NameCheker';

dotenv.config();

const clientSecret = `${process.env.clientSecret}`;
const clientId = `${process.env.clientId}`;
const channel = `${process.env.channel}`;
const redirectURI = `${process.env.redirectURI}`;
const port = process.env.PORT || 3000;

const app = express();
const state = Date.now();
const nameChecker = new NameChecker();

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

async function createDrafterClient(chatClient: ChatClient, rtaClient: ChatClient) {
  await chatClient.connect();
  await rtaClient.connect();
  chatClient.onMessage((channel, user, message) => {
    if (channel == `#${user}`) {
      switch (message) {
        case '!startRTA':
          rtaClient.connect();
          rtaClient.say(channel, 'e7-RTA-Client: connected');
          break;
        case '!reset':
          rtaClient.say(channel, 'e7-RTA-Client: quitting');
          rtaClient.quit();
          break;
        case '!startDraft':
          rtaClient.say(channel, 'Type !pick to select a unit');
          startPicks(rtaClient);
          break;
        case '!next':
          clearPicks(rtaClient);
          break;
        case '!endDraft':
          clearTimeout();
          break;
      }
    }
  });
}
async function startPicks(chatClient: ChatClient) {
  await chatClient.say(channel, 'Picks OPEN');

  chatClient.onMessage(async (channel, user, message) => {
    if (message.startsWith('!pick')) {
      if (!users.has(user)) {
        const pick = message.slice(5).trim();

        if (nameChecker.checkCanonicalName(pick) != '') {
          draft.set(pick, draft.get(pick) || 0 + 1);
          users.set(user, true);
        } else {
          await chatClient.say(channel, `${pick} is not recognized`);
        }
      } else {
        await chatClient.say(channel, `${user} has already picked`);
      }
    }
  });
}
async function clearPicks(chatClient: ChatClient) {
  const winner = [...draft.entries()].reduce((previous, current) => (current[1] > previous[1] ? current : previous));
  await chatClient.say(channel, `The winner was ${winner[0]} with ${winner[1]} votes!`);
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
  const rtaClient = new ChatClient(authProvider, { channels: [channel] });
  createDrafterClient(chatClient, rtaClient);
}

app.get('/auth', function (req: express.Request, res: express.Response) {
  if (parseInt(`${req.query.state}`) == state) {
    res.send('e7_bot has received authentication');
    main(`${req.query.code}`);
  } else {
    res.send('State does not match! Potential security vulnerability detected.');
  }
});

app.get('/start', function (req: express.Request, res: express.Response) {
  res.redirect(
    `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=https://${req.hostname}/auth&response_type=code&scope=chat:read+chat:edit&force_verify=true&state=${state}`,
  );
});
app.listen(port);
