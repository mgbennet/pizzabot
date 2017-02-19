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
var order_recognizer = new builder.LuisRecognizer(model);

//Menu
//We ought to have a database or at least a JSON file populating this
var menuItems = {
	"cheese pizza": {
		"cost": 9
	},
	"pepperoni pizza": {
		"cost": 10
	},
	"salad": {
		"cost": 5
	}
}


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
		session.send("Hello %s! Currently we only have cheese and pepperoni pizzas, and salad. Please place your order one item at a time.", session.userData.name);
		session.beginDialog('/order');
	}
]);

intents.matches(/^change name/i, [
	function (session) {
		session.beginDialog('/profile');
	},
	function (session, results) {
		session.send("Ok... Changed your name to %s", session.userData.name);
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


var order_dialog = new builder.IntentDialog({ recognizers: [order_recognizer]});
bot.dialog('/order', order_dialog);
order_dialog.matches('AddOrder', [
	function(session, args) {
		var entities = builder.EntityRecognizer.findEntity(args.entities, 'MenuItem');
		if (entities) {
			var menuItem = builder.EntityRecognizer.findBestMatch(menuItems, entities.entity).entity;
			session.send("Ok! Added one %s to your order.", menuItem);
		} else {
			session.send("I think you're trying to add an item to the order, but I can't figure out what item it is.");
		}
	}
]);
order_dialog.matches("CompleteOrder", [
	function(session, args, next) {
		session.send("Ok! I have the following as your order: TBD\nIt will be delivered to your address at %s, and we have your phone number as %s.", session.userData.address, session.userData.phoneNumber);
		builder.Prompts.confirm(session, "Is that all correct?");
	},
	function(session, results) {
		console.log(results.response);
		if (results.response) {
			session.send("It's on its way! Expected delivery time will be determined by a complicated server side algorithm from a combination of distance to your address and how over worked our delivery staff currently is. Cash only, since credit card processing is well beyond the scope of this exercise.");
			// Then of course we need to actually notify the staff to make the order
			// and deliver it.
		} else {
			session.send("What is incorrect?"); //steps to figure out what went wrong
		}
	}
]);
order_dialog.onDefault(builder.DialogAction.send("I'm sorry, I'm only a simple bot and didn't understand."));