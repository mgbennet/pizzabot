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
		"price": 9
	},
	"pepperoni pizza": {
		"price": 11
	},
	"salad": {
		"price": 5
	}
}


//
// Bots Dialogs
//
bot.dialog('/', intents);

intents.onDefault([
	function (session, args, next) {
		session.send("Thank you for choosing Fictional Pizzeria, where the food is imaginary but the experience is real. This is an automated chat bot that can take your delivery order.")
		if (!session.userData.name) {
			session.beginDialog('/profile');
		} else {
			next({"preExisting": true});
		}
	},
	function (session, results) {
		var greeting;
		if (results.preExisting) {
			greeting = "Welcome back, "
		} else {
			greeting = "Hello, "
		}
		session.send(greeting + "%s!", session.userData.name);
		newOrder(session);
		session.beginDialog('/order');
	}
]);

intents.matches(/^change name/i, [
	function (session) {
		session.beginDialog('/profile');
	},
	function (session, results) {
		session.send("Ok... Changed your name to %s, your phone number to %s, and your address to %s.", session.userData.name, session.userData.phoneNumber, session.userData.address);
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

var newOrder = function(session) {
	session.privateConversationData.order = {};
}

var order_dialog = new builder.IntentDialog({ recognizers: [order_recognizer]});
bot.dialog('/order', order_dialog);
order_dialog.onBegin(function(session, args) {
		session.send("Currently we only have cheese pizzas for $9 and pepperoni pizzas for $11, and salad for $5. Please place your order one item at a time. When you're done, just say \"I'm done\" and we'll check you out.");
});
order_dialog.matches('AddOrder', [
	function(session, args) {
		var entities = builder.EntityRecognizer.findEntity(args.entities, 'MenuItem');
		if (entities) {
			var menuItem = builder.EntityRecognizer.findBestMatch(menuItems, entities.entity).entity;
			session.send("Ok! Added one %s to your order.", menuItem);
			var order = session.privateConversationData.order;
			if (order[menuItem]) {
				order[menuItem].quantity += 1;
			} else {
				order[menuItem] = {
					"quantity": 1
				}
			}
		} else {
			session.send("I think you're trying to add an item to your order, but I can't figure out what item it is.");
		}
	}
]);
order_dialog.matches("CompleteOrder", [
	function(session, args, next) {
		var order = session.privateConversationData.order;
		if (Object.keys(order).length !== 0) {
			var orderStr = "";
			var totalPrice = 0;
			for (item in order) {
				var plural = order[item].quantity != 1 ? "s" : "";
				orderStr += order[item].quantity + " " + item + plural + "\n";
				totalPrice += order[item].quantity * menuItems[item].price;
			}
			session.send("Ok! I have the following as your order:\n%s. Your total is $%s. It will be delivered to your address at %s, and we have your phone number as %s.", orderStr, totalPrice, session.userData.address, session.userData.phoneNumber);
			builder.Prompts.confirm(session, "Is that all correct?");
		} else {
			session.send("We don't have any items in your order yet. Please order an item first.");
		}
	},
	function(session, results) {
		if (results.response) {
			session.send("It's on its way! Expected delivery time will be determined by a complicated server side algorithm from a combination of distance to your address and how over worked our delivery staff currently is. Cash only, since credit card processing is well beyond the scope of this exercise.");
			// Then of course we need to actually notify the staff to make the order
			// and deliver it.
			session.endDialog();
		} else {
			session.send("Ok let's just start over then.");
			newOrder(session);
		}
	}
]);
order_dialog.onDefault(builder.DialogAction.send("I'm sorry, I'm only a simple bot and didn't understand."));