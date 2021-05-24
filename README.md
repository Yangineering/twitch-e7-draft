# twitch-e7-draft
e7 draft bot for twitch chat

# Flow

Starts a local server
Local server opens a browser window asking for twitch auth (req permission for saving this auth?)
Store secret
Connect to twitch chat
Local server hosts a page that shows the overlay image (load as webpage through obs)
Listens to chat for !pick commands
After a set time, log the winner and start next pick

# Future

* option to not save twitch auth
* UX improvements around pick/ban
