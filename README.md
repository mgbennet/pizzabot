# pizzabot
A mock chat bot that takes pizza orders. Built using [Microsoft Bot Framework](https://dev.botframework.com/). You can use it by going to [https://mgbennet.github.io/pizzabot/webchat.html](https://mgbennet.github.io/pizzabot/webchat.html).

To setup and test this on your local machine:

1. `git clone https://github.com/mgbennet/pizzabot.git`

2. `cd pizzabot`

3. `npm install`

4. `node app.js`

5. In the [Bot Framework Emulator](https://docs.botframework.com/en-us/tools/bot-framework-emulator/), go to http://localhost:3978/api/messages (password and app id are empty). Send any message to start the conversation. App ID is 7f08e462-310c-414e-bc83-41f2e34b50f1, password is bcqgPBW64fqUkvfvTu4Wkcy.

You also can test it out by pointing your Bot Framework to http://pizzabottest.azurewebsites.net/api/messages.

## Future to-dos
* Proper identification of multiple quantaties in order, ie "I'd like two cheese pizzas" will add 2 pizzas, not one.

* Bigger menu loaded in from json file, with variations like Large and modifiers like extra cheese with corresponding price increases.

* Better profile management.

* More commands, like removing items from order or status check on the order before checking out.
