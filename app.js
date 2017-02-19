var restify = require('restify');
var builder = require('botbuilder');


//Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
	console.log('%s listening to %s', server.name, server.url);
});

//Create chat bot
var connector = new builder.ChatConnector({
	appId: process.env.MICROSOFT_APP_ID,
	appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());
var intents = new builder.IntentDialog();

//Luis setup
var model = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/d7a6d502-2ffd-4a89-9502-39c0490472b5?subscription-key=b5c9dacc5f00482799f8bc63166d615b&verbose=true";
var recognizer = new builder.LuisRecognizer(model);
var order_dialog = new builder.IntentDialog({ recognizers: [recognizer]});


//
// Bots Dialogs
//
bot.dialog('/', intents);

intents.onDefault([
	function (session, args, next) {
		if (!session.userData.name) {
			session.beginDialog('/profile');
		} else {
			next();
		}
	},
	function (session, results) {
		session.send("Hello %s! Would you like to place an order?", session.userData.name);
		session.beginDialog('/order');
	}
]);

intents.matches(/^change name/i, [
	function (session) {
		session.beginDialog('/profile');
	},
	function (session, results) {
		session.send('Ok... Changed your name to %s', session.userData.name);
	}
]);

bot.dialog('/profile', [
	function(session) {
		builder.Prompts.text(session, "What's your name?");
	},
	function(session, results) {
		session.userData.name = results.response;
		builder.Prompts.text(session, "What's your phone number?");
	},
	function(session, results) {
		session.userData.phoneNumber = results.response;
		builder.Prompts.text(session, "What's your address?");
	},
	function(session, results) {
		session.userData.address = results.response;
		session.endDialog();
	}
]);

bot.dialog('/order', order_dialog);
order_dialog.matches("CompleteOrder", builder.DialogAction.send("Completing order!"));
order_dialog.matches("AddOrder", builder.DialogAction.send("Adding something to order"));
order_dialog.onDefault(builder.DialogAction.send("I'm sorry, I'm only a simple bot and didn't understand."));