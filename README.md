# twitch-e7-draft
e7 draft bot for twitch chat

e7-chat-bot.herokuapp.com

# Flow

Starts a server
Go to e7-chat-bot.herokuapp.com/auth to authenticate

Once logged in the bot stays on until the server is disabled.

| command       | params        | users         | description                                                 |
| ------------- | ------------- | ------------- | ----------------------------------------------------------- |
| `!startRTA`   |               | channel owner | attach's RTA bot to the chat                                |
| `!reset`      |               | channel owner | removes the RTA bot from the chat                           |
| `!startDraft` |               | channel owner | Starts tracking votes. 1 vote per user                      |
| `!endDraft`   |               | channel owner | alias for `!next`. The bot is still connected and listening |
| `!next`       |               | channel owner | resets the count and announces winner                       |
| `!pick`       | `<hero name>` | all users     |                                                             |


# Thoughts

current thinking is that making a bot that will recognize things like preban, 1 vs 2 picks, etc is a bit complicated. So I can iterate, but I'm starting with:

* not bothering to code advanced user management and just locking the program to one channel/user
* same as other bots, will need mod permissions to be able to send messages
* Bot RTA will be designed for all viewers get to participate (compared to your guided RTA with 1 person)
* all viewers get to pick (1 max per user)
* have the bot start by typing !startRTA
* they pick by typing !pick <name> (must be exact right now, work is being done to recognize common synonyms like arby, singelica, etc)
* when the channel owner is ready type !next
* the bot will print out the winner (can also print out 2nd place if needed)

* next immediate goal that I think might make this usable is to add a webpage that can be imported as an overlay to show users real time votes with pics of the selected unit. I'm thinking something like just top 3 to try and incentivize more consolidated votes)
