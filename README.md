# Abyssal - Alpha 0.0.5
<p><a href="https://www.npmjs.com/package/abyssal"><img src="https://img.shields.io/npm/v/abyssal.svg?maxAge=3600" alt="NPM version" /></a>
    <a href="https://www.npmjs.com/package/abyssal"><img src="https://img.shields.io/npm/dt/abyssal.svg?maxAge=3600" alt="NPM downloads" /></a>
    <a href="https://www.codacy.com/manual/VimHax/Abyssal?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=VimHax/Abyssal&amp;utm_campaign=Badge_Grade"><img src="https://api.codacy.com/project/badge/Grade/7b935d0d874d4aa5860e8722fc276036" alt="Codacy grade" /></a>
<br>
<a href="https://nodei.co/npm/abyssal/"><img src="https://nodei.co/npm/abyssal.png?downloads=true&stars=true" alt="npm installnfo" /></a>
</p>

A [Discord.js](https://discord.js.org/) framework, whose goal is to make your Discord bot very modular in nature. Almost every component is customizable and, in fact, you are recommended to do so, as, the defaults are, to put lightly, unusable. This framework is more like a template, as, it basically doesn't come with any built-in features, such as syntax parsing, command cool-downs, permissions or even commands! Rather you have to build them on your own, giving you the full control over how your bot functions, only the most bare-bones functionality is provided.

I highly recommend you read the documentation, as this framework introduces many new concepts, which you may or may not have heard before, so that you can fully understand them & put them to use.

**Note - All the code in this README, as well as the framework, is written in [`Typescript`](https://www.typescriptlang.org/)**

# Installation

**[Node.js](https://nodejs.org/) 12.0.0 or newer is required. (For [Discord.js](https://discord.js.org/) to run properly)**

Simply execute the following command on your terminal to install `Abyssal` - `npm install abyssal`

# Example Usage

```typescript
import * as Abyssal from "abyssal";

const triggerManager = new Abyssal.TriggerManager();
const jobManager = new Abyssal.JobManager();

const Ping = new Abyssal.Trigger({
	id: "ping",
	events: ["message"],
	eventListeners: [],
	validator: async (event, [message], util) => !message.author.bot && message.content == "ping",
	executor: async (event, [message], util) => message.channel.send("pong!")
});

triggerManager.add(Ping);

const client = new Abyssal.Client({
	database: new Abyssal.Database(),
	triggerManager: triggerManager,
	jobManager: jobManager
});

client.login("secret token");
client.on("ready", () => console.log(`Client Logged In - ${client.user?.tag}`));
```

# Documentation

## Database - `new Abyssal.Database()`

This class abstracts the interactions between the client & the database into very simple methods which the framework uses to interact with virtually any database imaginable, given that the class extension is implemented as specified. The default implementation is provided below under *Example Implementation*.
 
**Documents**

The *"unit of data"* in the database is a `Document`. A `Document` is defined as - `{ [key: string]: any }`. The database can be thought of as (& is how it's actually implemented in the default implementation) an array of `Document`s.

**Queries**

*Querying the database* means filtering certain `Document`s out of the database, specifically, `Document`s which match a certain *"shape"*. This *"shape"* is defined by the `Query` object. The `Query` object has the same definition as the `Document` object - `{ [key: string]: any }`.

A `Document` matches the *"shape"* defined by the `Query` object if, & only if, all the values of all the properties of the `Query` object correspond to the values of corresponding the properties of the `Document`. (Strict equality)

**Examples Of Queries**

Assume all the `Document`s in the database are the following...
```typescript
[
	{ type: "number", value: 1 },
	{ type: "number", value: 2 },
	{ type: "letter", value: "A" }
]
 ```
The `Query` object, `{ type: "number" }`, matches the *"shape"* of `{ type: "number", value: 1 }` & `{ type: "number", value: 2 }` but not `{ type: "letter", value: "A" }`, because the `type` property in the `Query` object is not equal to that of the `Document`, `Query.type != Document.type`.

Similarly, the `Query` object, `{ value: "A"}`, only matches the *"shape"* of `{ type: "letter", value: "A" }` because this is the only document whose `value` property is equal to `"A"`, `Query.value == Document.value`

And, as a final example, the `Query` object, `{ type: "number", value: 2 }`, only matches `{ type: "number", value: 2 }` as this is the only document whose properties, `type`, `number`, are equal to the corresponding values, `"number"`, `2`, `Query.type == Document.type && Query.value == Document.value`

**Definition**

```typescript
interface Database {
	initialize: () => Promise<void>;
	find: (query: Query) => Promise<Document[]>;
	findOne: (query: Query) => Promise<Document | undefined>;
	update: (query: Query, document: Document) => Promise<void>;
	insert: (document: Document) => Promise<void>;
	delete: (query: Query) => Promise<void>;
}
```

| Method       | Function                                                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `initialize` | Runs any code which is required to initialize the methods, like creating the connection to the database, for example.                                                                 |
| `find`       | Returns an array of `Document`s, all of which match the `Query` object provided. (Empty array if none of the `Document`s match)                                                       |
| `findOne`    | Returns one `Document` which matches the `Query` object provided. (`undefined` if none of the `Document`s match)                                                                      |
| `update`     | Replaces all the `Document`s which match the `Query` object with the `Document` provided. If there were no replacements, then the provided `Document` is inserted in to the database. |
| `insert`     | Inserts the provided `Document` in to the database.                                                                                                                                   |
| `delete`     | Deletes any `Document` which matches the `Query` object provided.                                                                                                                     |

**Example Implementation (The Default Implementation)**
 ```typescript
import * as Abyssal from "abyssal";

// Data is the "database" which holds all the Documents in this implementation
let Data: Abyssal.Document[] = [];

// This function checks whether a specified Document matches a specified Query
function matchQuery(query: Abyssal.Query, document: Abyssal.Document): boolean {
	const props = Object.keys(query);
	let found = true;
	props.forEach(prop => document[prop] === query[prop] || (found = false));
	return found;
}

class Database extends Abyssal.Database {

	async initialize() {} // Empty method as there is nothing to initialize
	
	// Filters out & returns the Documents which match the Query
	async find(query: Abyssal.Query) {
		return Data.filter(doc => matchQuery(query, doc));
	}

	// Filters out & returns the first Document which matches the Query
	async findOne(query: Abyssal.Query) {
		return Data.filter(doc => matchQuery(query, doc))[0];
	}
	
	// Replaces all Documents which match the Query with the Document provided
	// If nothing was replaced, it inserts the Document in to the "database"
	async update(query: Abyssal.Document, document: Abyssal.Document) {
		let updated = false;
		Data = Data.map(doc => (matchQuery(query, doc) && ((updated = true) && document)) || doc);
		if (!updated) Data.push(document);
	}
	
	// Inserts the Document in to the "database"
	async insert(data: Abyssal.Document) {
		Data.push(data);
	}

	// Filters out the Documents which do not match the Query & replaces the "database" with it
	async delete(query: Abyssal.Document) {
		Data = Data.filter(doc => !matchQuery(query, doc));
	}
	
}

export default Database;
```

## Trigger - `new Abyssal.Trigger(TriggerConfig)`

This class is the equivalent to the `Command` class in other frameworks, except, `Trigger`s are much more general. Conventionally, `Command`s are triggered only through [`message`](https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-message) events, however, `Trigger`s  can be triggered through any `Event`. (even the [`"debug"`](https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-debug) event if you wish) Therefore, they are much more flexible than `Command`s. It extends the built-in [EventEmitter](https://nodejs.org/api/events.html) class in [Node.js](https://nodejs.org/), to provide a event-based API to handle `Listener`s.

**Definition**

```typescript
type Event = string | symbol;
type EventArgs = any[];
type EventListener = (args: EventArgs, util: Util) => void;
type TriggerID = string;
type TriggerExecutor = (event: Event, args: EventArgs, util: Util) => Promise<void>;
type TriggerValidator = (event: Event, args: EventArgs, util: Util) => Promise<boolean>;

interface Trigger extends EventEmitter {
	id: TriggerID; // The unique ID of the Trigger
	events: Event[]; // All the Events which TriggerValidator will be executed on
	eventListeners: Event[]; // All the Events, Listeners may be attached to
	execute: TriggerExecutor; // The TriggerExecutor function
	validate: TriggerValidator; // The TriggerValidator function
	eventHandler: (event: Event, args: EventArgs, util: Util) => void; // EventEmitter.emit wrapper
	on: (event: Event, listener: EventListener) => this; // EventEmitter.on type
}
```

**Events, Event Arguments & Event Listeners**

A `Event`, which is defined as - `string | symbol`, refers to any `Event` which [emits](https://nodejs.org/api/events.html#events_emitter_emit_eventname_args) on the Discord.js [`Client`](https://discord.js.org/#/docs/main/stable/class/Client). So, [`"message"`](https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-message), [`"messageReactionAdd"`](https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-messageReactionAdd), [`"ready"`](https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-ready) etc. (can be a custom `Event` as well) 

Event arguments or `EventArgs`, which is defined as - `any[]`, refers to the arguments provided by the `Event`. So, in the case of the `"message"` `Event`, `EventArgs` would be `[ DiscordJS.Message ]` & in the case of the `"messageReactionAdd"` `Event`, `EventArgs` would be `[ DiscordJS.MessageReaction, DiscordJS.User ]`

A `EventListener`, which is defined as - `(args: EventArgs, util: Util) => void`, is simply a function  which handles `Event` emissions. However, the arguments are always `EventArgs` & `Util`. (`Util` is covered later on in the documentation)

**Trigger Executor & Trigger Validator**

`TriggerExecutor`, which is defined as - `(event: Event, args: EventArgs, util: Util) => Promise<void>`, is the *"body"* or *"content"* of the `Trigger`. It is executed if, & only if, the `TriggerValidator` returns true.

`TriggerValidator`, which is defined as - `(event: Event, args: EventArgs, util: Util) => Promise<boolean>`, decides whether or not to execute `TriggerExecutor`. If it does or does not, it returns `true` or `false`, respectively.

**Config**

```typescript
interface TriggerConfig {
	id: TriggerID; // The unique ID of the Trigger
	events: Event[]; // All the Events which TriggerValidator will be executed on
	eventListeners: Event[]; // All the Events, Listeners may be attached to
	executor: TriggerExecutor; // The TriggerExecutor function
	validator: TriggerValidator; // The TriggerValidator function
}
```

**Example Usage**

Below is a implementation of a `Trigger` which responds with `"pong!"` when you send `"ping"`.

```
User -> ping
 Bot -> pong!
```

```typescript
import * as Abyssal from "abyssal";

const Ping = new Abyssal.Trigger({
	id: "ping",
	events: ["message"], // ["message"] since we only care about the "message" event
	eventListeners: [], // Empty since we don't attach any Listeners
	// Returns true if the author is not a bot & if the content is equal to "ping"
	validator: async (event, [message], util) => !message.author.bot && message.content == "ping",
	// Sends "pong!" to the channel the message was sent on
	executor: async (event, [message], util) => message.channel.send("pong!")
});

export default Ping;
```

## Util - `new Abyssal.Util(TriggerID, TriggerSession, Database)`	

In the default implementation, this class mainly provides methods to load, change, save, delete `TriggerState`
 & add or remove `Listener`s using the provided `Database`. Instances of `Util` are *binded* to a `TriggerID` & `TriggerSession`.

**Definition**

```typescript
type State = Document;
type StateProperty = string;
type StateValue = any;
type TriggerSession = string;

interface Util {
	// ID of the Trigger
	id: TriggerID;
	// The local State of the Trigger, may not up to date with the one saved in the Database
	state: State;
	// The Trigger Session
	session: TriggerSession;
	// The Database provided
	database: Database;
	// Returns the value of the property provided of the local State, undefined if it doesn't exist
	getStateProperty: (property: StateProperty) => StateValue | undefined;
	// Sets the property provided to the value provided in the local State
	setStateProperty: (property: StateProperty, value: StateValue) => void;
	// Deletes a provided property off of the local State
	deleteStateProperty: (property: StateProperty) => void;
	// Updates the local State with the one saved in the Database
	loadState: () => Promise<void>;
	// Updates the Database to the local State
	saveState: () => Promise<void>;
	// Deletes the Trigger State in the Database
	deleteState: () => Promise<void>;
	// Adds a Listener to the Trigger
	addListener: (event: Event) => Promise<void>;
	// Removes a Listener in the Trigger
	removeListener: (event: Event) => Promise<void>;
	// Removes all Listeners in the Trigger
	removeAllListeners: () => Promise<void>;
}
```
 
**Session**

In the default implementation of the `TriggerManager`, the `TriggerSession` is created right before the `TriggerValidator` is called. It is in the form of a `string` in the format `"${TriggerID}-auniquestring"` which is generated using [`Uniqid`](https://www.npmjs.com/package/uniqid). It stays constant among the `TriggerValidator`, `TriggerExecutor` & `EventListeners` if it's in the same *instance*. (The idea of *instances* will be elaborated on at the end of this section)

**State**

The `State` is a `Document` which, well, keeps track of the `Trigger`'s state. The `State` is also *binded* to the `TriggerSession`, anywhere the `TriggerSession` is constant, the same `State` is carried. The `State` is stored in the `Database`, so that, if the `Database` is *persistent* (whose data would be available even after the application has been fully restarted), the `State` can still be maintained. However, do not confuse the actual `State` vs the local `State`, `Util`'s `getStateProperty`, `setStateProperty` & `deleteStateProperty` methods only manipulate the local `State`, the actual `State`, which is saved in the `Database`, is unchanged. To update the actual `State`, you have to run the `saveState` method, it updates the actual `State` with the local one. This is done to increase efficiency, as updating one major change is more efficient than updating on many minor changes. (This also means that the methods which manipulate the local `State` can be, & are, synchronous) Keep in mind that the actual `State` isn't loaded in to the local `State` when `Util` is initialized, so the `loadState` method is required to be ran to retrieve the most up to date actual `State`. The format of the `State` `Document` is given below.

```typescript
{
	type: "triggerstate",
	session: TriggerSession,
	[key: string]: any
}
```

**Listeners**

The term `Listener` refers to a `Document` which stores data about the `Event` that it is attached to. From any `Listener`, the `Trigger` which attached the `Listener`, in what `TriggerSession` as well as the `State` can be found. When any `Event` is emitted, the `Abyssal` `Client` runs the `TriggerManager`, which in it's default implementation, runs a query to find any `Listener`s attached to the `Event` emitted. If the query returns with at least one `Listener`,  then the `TriggerManager` finds which `Trigger` attached that `Listener`, then generates a `Util` instance & feeds the `Event`, `EventArgs` & the `Util` instance to the `eventHandler` method of the `Trigger`, this will cause any `EventListener`s, attached to the corresponding `Event` in the `Trigger`, to fire.  How this works can be much better understood by giving a peek at the code in `Client.ts` and `TriggerManager.ts` under `/Classes/`. The format of a `Listener` `Document` is given below.

```typescript
{
	type: `listener`,
	session: TriggerSession,
	event: Event
}
```

**Example Usage**

These ideas can be best shown & understood through examples. All the following examples make use of all the three ideas, `TriggerSession`, `State` & `Listener`s. 

This first example is of a `Trigger` which generates a number when you send `"gen number"` & to see it, you need to respond with `"show number"`.

```
User -> gen number
 Bot -> Generated number!
 Bot -> Please respond with 'show number' to show the generated number.
User -> show number
 Bot -> The number was - TheGeneratedNumber
```

```typescript
import * as Abyssal from "abyssal";

const GenNumber = new Abyssal.Trigger({
	id: "gennumber",
	events: ["message"],
	eventListeners: ["message"], // ["message"] since we attach a Listener only to the "message" Event
	validator: async (event, [message], util) => !message.author.bot && message.content == "gen number",
	executor: async (event, [message], util) => {
		const number = Math.round(Math.random() * 100);
		util.setStateProperty("number", number); // Set the number property in the local State
		await util.saveState(); // Update the actual State
		await util.addListener("message"); // Add the "message" Listener
		await message.channel.send("Generated number!");
		await message.channel.send("Please respond with 'show number' to show the generated number.");
	}
});

// Listen to the "message" Event
GenNumber.on("message", async ([message], util) => {
	if (message.author.bot) return; // Return if the message was sent by a bot
	await util.loadState(); // Retrieve the actual State
	await util.deleteState(); // Delete the State Document in the Database
	await util.removeListener("message"); // Remove the "message" Listener
	// Send the message if the content was "show number"
	if (message.content == "show number")
		await message.channel.send(`The number was - ${util.getStateProperty("number")}`);
});
	
export default GenNumber;
```

This second example is of a `Trigger` which returns the result of a google search of the term entered until "exit" is sent, after "google search" was sent. This `Trigger` will make use of a imaginary function called `googleSearch` which is defined as `(searchTerm: string) => Promise<string>`. It will also ignore messages sent by other users.

```
User -> google search
 Bot -> Okay, please enter a search term.
User -> Programming
 Bot -> TheResultOfTheProgrammingGoogleSearch
 Bot -> Okay, please enter another search term if you wish. To exit please enter 'exit'.
Other User (Ignored) -> C++
User -> Typescript
 Bot -> TheResultOfTheTypescriptGoogleSearch
 Bot -> Okay, please enter another search term if you wish. To exit please enter 'exit'.
Other User (Ignored) -> C++
User -> exit
 Bot -> Exited google search.
```

```typescript
import * as Abyssal from "abyssal";

const GoogleSearch = new Abyssal.Trigger({
	id: "googlesearch",
	events: ["message"],
	eventListeners: ["message"], // ["message"] since we attach a Listener only to the "message" Event
	validator: async (event, [message], util) => !message.author.bot && message.content == "google search",
	executor: async (event, [message], util) => {
		util.setStateProperty("user", message.author.id); // Set the user property in the local State
		await util.saveState(); // Update the actual State
		await util.addListener("message"); // Add the "message" Listener
		await message.channel.send("Okay, please enter a search term.");
	}
});

// Listen to the "message" Event
GoogleSearch.on("message", async ([message], util) => {
	await util.loadState(); // Retrieve the actual State
	// Ignore if the author's id is not equal to that of the "user" property in the State
	if (message.author.id == util.getStateProperty("user")) {
		if (message.content == "exit") {
			await util.deleteState(); // Delete the State Document in the Database
			await util.removeListener("message"); // Remove the "message" Listener
			await message.channel.send("Exited google search.");
		} else {
			await message.channel.send(await googleSearch(message.content));
			await message.channel.send("Okay, please enter another search term if you wish. To exit please enter 'exit'.");
		}
	}
});
	
export default GoogleSearch;
```

The third, & final, example is the most complicated example by far. This `Trigger` will do a `+`, `-`, `*` or a `/` operation on two numbers. The `Trigger` first prompts the user for the first & second number, the input is taken through reactions, by making the user react to numbered emojis. Then the trigger prompts for the operation to be done on the numbers. (without reactions) The `Trigger` then calculates the result & returns the answer. This entire process is triggered when the user sends `"calculate"`.

```
User -> calculate
Bot -> Please react on the first number.
Bot (Reactions) -> 1️⃣, 2️⃣, 3️⃣, 4️⃣, 5️⃣
User (Reacted) -> 2
Bot -> Please react on the second number.
Bot (Reactions) -> 1️⃣, 2️⃣, 3️⃣, 4️⃣, 5️⃣
User (Reacted) -> 5
Bot -> What operation do you wish to do on these two numbers? (+, -, *, /)
User -> *
Bot -> 10 is the answer.
```

```typescript
import * as Abyssal from "abyssal";

const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];
const operations = ["+", "-", "*", "/"];

const Calculate = new Abyssal.Trigger({
	id: "calculate",
	events: ["message"],
	// ["message", "messageReactionAdd"] since both events are being listened to
	eventListeners: ["message", "messageReactionAdd"],
	validator: async (event, [message], util) => !message.author.bot && message.content == "calculate",
	executor: async (event, [message], util) => {
		const msg = await message.channel.send("Please react on the first number.");
		util.setStateProperty("user", message.author.id); // Set the user property in the local State
		util.setStateProperty("message", msg.id); // Set the message property in the local State
		util.setStateProperty("first", true); // Set the "first" flag in the local State to true
		await util.saveState(); // Update the actual State
		await util.addListener("messageReactionAdd"); // Add the "messageReactionAdd" Listener
		// React to the message sent with the emojis
		for (const emoji of emojis) {
			await msg.react(emoji);
		}
	}
});

// Listen to the "messageReactionAdd" Event
Calculate.on("messageReactionAdd", async ([reaction, user], util) => {
	await util.loadState(); // Retrieve the actual State
	// Check if the user's id is equal to that of the "user" property in the local State
	// and if the reaction.message's id is equal to that of the "message" property in the local State
	if (user.id == util.getStateProperty("user") && reaction.message.id == util.getStateProperty("message")) {
		// Get the index of the emoji reacted in the emoji array
		const idx = emojis.findIndex(emoji => emoji == reaction.emoji.toString());
		if (idx != -1) {
			if (util.getStateProperty("first")) {
				// Initiate the second reaction input
				const msg = await reaction.message.channel.send("Please react on the second number.");
				util.setStateProperty("message", msg.id);
				util.setStateProperty("first", false); // Set the "first" flag to false
				util.setStateProperty("num1", idx + 1); // Set "num1" to the first input
				await util.saveState();
				for (const emoji of emojis) {
					await msg.react(emoji);
				}
			} else {
				// Initiate the operation prompt
				await reaction.message.channel.send("What operation do you wish to do on these two numbers? (+, -, *, /)");
				// Remove unnecessary data
				util.deleteStateProperty("message"); // 
				util.deleteStateProperty("first");
				util.setStateProperty("num2", idx + 1); // Set "num2" to the second input
				util.setStateProperty("channel", reaction.message.channel.id); // Set "channel" to the channel that the message was sent on
				await util.removeListener("messageReactionAdd"); // Remove the "messageReactionAdd" Listener
				await util.addListener("message"); // Add the "message" Listener
				await util.saveState();
			}
		}
	}
});

Calculate.on("message", async ([message], util) => {
	await util.loadState(); // Retrieve the actual State
	// Check if the channel id is equal to the "channel" state property
	// and if the author's id is equal to the "user" state property
	if (message.channel.id == util.getStateProperty("channel") && message.author.id == util.getStateProperty("user")) {
		// Find the index of the operation entered in the operations array
		const idx = operations.findIndex(operation => operation == message.content);
		if (idx != -1) {
			// Calculate the answer
			let answer = util.getStateProperty("num1");
			switch (operations[idx]) {
				case "+":
					answer += util.getStateProperty("num2");
					break;
				case "-":
					answer -= util.getStateProperty("num2");
					break;
				case "*":
					answer *= util.getStateProperty("num2");
					break;
				case "/":
					answer /= util.getStateProperty("num2");
					break;
					
			}
			// Send the answer
			await message.channel.send(`${answer} is the answer.`);
			// Clean up
			await util.deleteState();
			await util.removeListener("message");
		} else {
			// Send error message
			await message.channel.send("Invalid operation.");
		}
	}
});
	
export default Calculate;
```

**Instances**

When you look at the code of the `Trigger`s in the examples given above, you only see one *instance* of the `Trigger`. You only see the code for the `Trigger` that's being ran once. However, in reality, there can be many *instances* of the same `Trigger` running simultaneously, all, possibly, having different `State`s, `Session`s & `Listener`s & being at different *stages* in the process of execution. For example, let's look at some *instances* of the `GenNumber` `Trigger`.
```typescript
Instance 1 - Stage of Execution: Validation
			            Session: "gennumber-687418"
			              State: * none *
			          Listeners: * none *
			          
Instance 2 - Stage of Execution: Showing Number
			            Session: "gennumber-168484"
			              State: * deleted *
			          Listeners: * removed *
			          
Instance 3 - Stage of Execution: Generated Number
			            Session: "gennumber-789134"
			              State: * number = 34 set & saved *
			          Listeners: * "message" added *
```

With this knowledge, you can truly understand what `State`s, `Session`s,  `Listener`s & being at different *stages* in the process of execution mean.

## Job - `new Abyssal.Job(JobID, Event[], JobExecutor)`

The `Job` class, in a nutshell, is a simplified `Trigger` class. `Job`s don't have validation, sessions or even state, therefore no, default, access to a instance of the `Util` class. They are meant to handle background jobs, like collecting statistics, sending welcome messages, logging etc. They are always executed after `Trigger`s, so, they have the ability to see which `Trigger`/s went off (their `TriggerExecutor` executed).

**Definition**

```typescript
type JobID = string;
type JobExecutor = (event: Event, args: EventArgs, triggers: Trigger[], database: Database) => Promise<void>;

interface Job {
	id: JobID; // A unique string identifier
	events: Event[]; // All the events for the JobExecutor to be executed on
	execute: JobExecutor; // The JobExecutor function
}
```

**Example Usage**

The `Job` below keeps track of how many times the `Trigger` with the `TriggerID` `"ping"` went off, & logs it every 5 times executed.

```typescript
import * as Abyssal from "abyssal";

let pingCount = 0;

const PingCounter = new Abyssal.Job("pingcounter", ["message"], async (event, args, triggers, database) => {
	if (triggers.some(trigger => trigger.id == "ping")) {
		pingCount++;
		if (pingCount % 5 == 0) console.log(`Ping trigger has been ran ${pingCount} times!`);
	}
});

export default PingCounter;
```

## Trigger Manager - `new Abyssal.TriggerManager()`

This class manages all the `Trigger`s. Specifically, how they are being executed, including the `TriggerValidator`s & the `Listener`s.

**Definition**

```typescript
interface TriggerManager {
	add: (trigger: Trigger) => void;
	remove: (id: TriggerID) => void;
	eventHandler: (event: Event, args: EventArgs, database: Database) => Promise<Trigger[]>;
}
```

| Method   | Function                                                                                           |
| -------- | -------------------------------------------------------------------------------------------------- |
| `add`    | Adds a `Trigger` to a collection of `Trigger`s which may be executed                               |
| `remove` | Removes a `Trigger` from the collection, making it unable to be executed                           |
| `event`  | All emitted `Event`s are fed in to this method. It returns all the `Trigger`s which were executed. |

**Example Implementation (Default Implementation)**

```typescript
import * as Abyssal from "abyssal";
import uniqid from "uniqid";

class TriggerManager extends Abyssal.TriggerManager {

	private triggers: Abyssal.Trigger[] = []; // Contains all the Triggers
	// Contains all the eventListeners of all the Triggers, without duplicates
	private eventListeners: string[] = [];
	// Contains all the Triggers grouped by their events
	private groupedTriggers: { [key: string]: Abyssal.Trigger[] } = {};

	add(trigger: Abyssal.Trigger) {
		// Push the Trigger in to this.triggers
		this.triggers.push(trigger);
		// Reset this.eventListeners & this.groupedTriggers
		this.eventListeners = [];
		this.groupedTriggers = {};
		// Goes through all the Triggers in this.triggers
		this.triggers.forEach(trig => {
			// Goes through all the listeners in trig.eventListeners and
			// adds listeners, which are not included in this.eventListeners, to this.eventListeners
			trig.eventListeners.forEach(listener => !this.eventListeners.includes(listener.toString()) && this.eventListeners.push(listener.toString()));
			// Goes through all the events in trig.events
			trig.events.forEach(event => {
				event = event.toString();
				// If this.groupedTriggers has the property event then
				// push trig in to that list
				if (this.groupedTriggers.hasOwnProperty(event)) this.groupedTriggers[event].push(trig);
				// Else define the property in this.groupedTriggers
				else this.groupedTriggers[event] = [trig];
			});
		});
	}

	remove(id: Abyssal.TriggerID) {
		// Splice the Trigger, which the provided ID belongs to, out of the array
		const idx = this.triggers.findIndex(e => e.id == id);
		this.triggers.splice(idx, 1);
		// Reset this.eventListeners & this.groupedTriggers
		this.eventListeners = [];
		this.groupedTriggers = {};
		// Goes through all the Triggers in this.triggers
		this.triggers.forEach(trig => {
			// Goes through all the listeners in trig.eventListeners and
			// adds listeners, which are not included in this.eventListeners, to this.eventListeners
			trig.eventListeners.forEach(listener => !this.eventListeners.includes(listener.toString()) && this.eventListeners.push(listener.toString()));
			// Goes through all the events in trig.events
			trig.events.forEach(event => {
				event = event.toString();
				// If this.groupedTriggers has the property event then
				// push trig in to that list
				if (this.groupedTriggers.hasOwnProperty(event)) this.groupedTriggers[event].push(trig);
				// Else define the property in this.groupedTriggers
				else this.groupedTriggers[event] = [trig];
			});
		});
	}

	async eventHandler(event: Abyssal.Event, args: Abyssal.EventArgs, database: Abyssal.Database) {
		// If event.toString() is included in this.eventListeners,
		// (Meaning there may, potentially, be some listeners attached to this event)
		if (this.eventListeners.includes(event.toString())) {
			// Retrieve any attached listeners
			const eventList = await database.find({
				type: "listener",
				event: event.toString()
			});
			// For each retrieved listener (if any)
			eventList.forEach(e => {
				// Find the Trigger which attached the listener
				const trigger = this.triggers.find(trig => e.session.startsWith(trig.id));
				// And run the eventHandler method on it
				trigger?.eventHandler(event, args, new Util(trigger.id, e.session, database));
			});
		}
		// If this.groupedTriggers has a property of event.toString()
		// (Meaning there may, potentially, be some TriggerValidators which return true)
		if (this.groupedTriggers.hasOwnProperty(event.toString())) {
			// Generate the sessions (using uniqid)
			let sessions: Abyssal.TriggerSession[] = this.groupedTriggers[event.toString()].map(trig => uniqid(`${trig.id}-`));
			// Run the TriggerValidators
			const promises = this.groupedTriggers[event.toString()].map((trig, i) => trig.validate(event, args, new Util(trig.id, sessions[i], database)));
			const resolved = await Promise.all(promises);
			// This array will hold all the Triggers whose TriggerValidator returned true (if any)
			const executed: Abyssal.Trigger[] = [];
			// Go through each TriggerValidator result
			resolved.forEach((res, i) => {
				// If it's true
				if (res == true) {
					// Find the corresponding Trigger
					const trigger = this.groupedTriggers[event.toString()][i];
					// Push it to the executed array
					executed.push(trigger);
					// & execute it
					trigger.execute(event, args, new Util(trigger.id, sessions[i], database));
				}
			});
			// Return the executed array
			return executed;
		}
		// Return a empty array, since no TriggerExecutors were executed
		return [];
	}
}

export default TriggerManager;
```

## Job Manager - `new Abyssal.JobManager()`

The `JobManager` class is the `TriggerManager` class, but for managing `Job`s, instead of `Trigger`s.

**Definition**

```typescript
interface JobManager {
	add: (job: Job) => void;
	remove: (id: JobID) => void;
	eventHandler: (event: Event, args: EventArgs, triggers: Trigger[], database: Database) => Promise<void>;
}
```

| Method   | Function                                                                    |
| -------- | --------------------------------------------------------------------------- |
| `add`    | Adds a `Job` to a collection of `Job`s which may be executed                |
| `remove` | Removes a `Job` from the collection, making it unable to be executed        |
| `event`  | All emitted `Event`s are fed in to this method, after the `TriggerManager`. |

**Example Implementation (Default Implementation)**

```typescript
import * as Abyssal from "abyssal";

class JobManager extends Abyssal.JobManager {

	// Contains all the Jobs
	private jobs: Abyssal.Job[] = [];

	add(job: Abyssal.Job) {
		// Pushes the Job in to this.jobs
		this.jobs.push(job);
	}

	remove(id: Abyssal.JobID) {
		// Splices the Job out of this.jobs
		const idx = this.jobs.findIndex(e => e.id == id);
		this.jobs.splice(idx, 1);
	}

	async eventHandler(event: Abyssal.Event, args: Abyssal.EventArgs, triggers: Abyssal.Trigger[], database: Abyssal.Database) {
		// Go through all the Jobs
		this.jobs.forEach(job => {
			// If job.events includes event
			if (job.events.includes(event)) {
				// Then run the JobExecutor
				job.execute(event, args, triggers, database);
			}
		});
	}
}

export default JobManager;
```

## Client - `new Abyssal.Client(ClientConfig)`

And finally, the `Client`, the class which makes all of the above components work together to make your discord bot. The `Client` manages the `Database`, `TriggerManager` and `JobManager`. It extends the `Discord.js` [`Client`](https://discord.js.org/#/docs/main/stable/class/Client).

**Definition**

```typescript
interface Client extends DiscordJS.Client {
	config: ClientConfig;
	database: Database;
	triggerManager: TriggerManager;
	clientOptions?: DiscordJS.ClientOptions;
}
```
**Config**

```typescript
interface ClientConfig {
	database: Database,
	triggerManager: TriggerManager,
	jobManager: JobManager,
	clientOptions?: DiscordJS.ClientOptions
}
```

**Example Implementation (Default Implementation)**

```typescript
import * as Abyssal from "abyssal";
import DiscordJS from "discord.js";

class Client extends Abyssal.Client {

	public database: Abyssal.Database;
	public triggerManager: Abyssal.TriggerManager;
	public jobManager: Abyssal.JobManager;

	constructor(public config: Abyssal.ClientConfig) {
		super(config.clientOptions);
		this.database = config.database;
		this.triggerManager = config.triggerManager;
		this.jobManager = config.jobManager;
	}

	emit(event: Abyssal.Event, ...args: Abyssal.EventArgs) {
		// On any event emission, fire the this.fireManagers method
		this.fireManagers(event, args);
		return super.emit(event, ...args);
	}

	private async fireManagers(event: Abyssal.Event, args: Abyssal.EventArgs) {
		// Fires the TriggerManager & then JobManager
		const triggers = await this.config.triggerManager.eventHandler(event, args, this.config.database);
		this.config.jobManager.eventHandler(event, args, triggers, this.config.database)
	}

	async login(token: string) {
		// Runs the initialize method of the Database
		await this.config.database.initialize();
		// Then logs in
		return super.login(token);
	}
}

export default Client;
```