# pizzabot
A mock chat bot that takes pizza orders. Built using [Microsoft Bot Framework](https://dev.botframework.com/). You can use it by going to [https://mgbennet.github.io/pizzabot/webchat.html](https://mgbennet.github.io/pizzabot/webchat.html).

To setup and test this on your local machine:

1. `git clone https://github.com/mgbennet/pizzabot.git`

2. `cd pizzabot`

3. In config.js, change `process.env.LUIS_URL` to a LUIS url. I might make my LUIS public in the future but for now its private.

4. `npm install`

5. `node app.js`

6. In the [Bot Framework Emulator](https://docs.botframework.com/en-us/tools/bot-framework-emulator/), go to http://localhost:3978/api/messages (password and app id are defined in config.js, by default both are empty strings). Send any message to start the conversation.

You also can test it out by pointing your Bot Framework to http://pizzabottest.azurewebsites.net/api/messages.

## Future to-dos
* Bigger menu with variations like Large and modifiers like Extra Cheese with corresponding price increases.

* Better profile management.

* More commands, like removing items from order or status check on the order before checking out.
