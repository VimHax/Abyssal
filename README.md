# Abyssal - 0.0.5 Alpha

<p><a href="https://www.npmjs.com/package/abyssal"><img src="https://img.shields.io/npm/v/abyssal.svg?maxAge=3600" alt="NPM version" /></a>
    <a href="https://www.npmjs.com/package/abyssal"><img src="https://img.shields.io/npm/dt/abyssal.svg?maxAge=3600" alt="NPM downloads" /></a>
    <a href="https://www.codacy.com/manual/VimHax/Abyssal?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=VimHax/Abyssal&amp;utm_campaign=Badge_Grade"><img src="https://api.codacy.com/project/badge/Grade/7b935d0d874d4aa5860e8722fc276036" alt="Codacy grade" /></a>
<br>
<a href="https://nodei.co/npm/abyssal/"><img src="https://nodei.co/npm/abyssal.png?downloads=true&stars=true" alt="npm installnfo" /></a>
</p>

​	**Abyssal** is a *minimalist [Discord.js](https://discord.js.org/) framework*. It's **goal** is to make your Discord bot _**modular** & **elegant**_ in *nature*. Abyssal **divides** a typical Discord bot's functionality into **components**. All of these *components* can be *extended* to **add new or change existing functionality**. All of these components come together to *create a working Discord bot*. 

> ​	I **highly recommended** you to **read the documentation** below, as Abyssal introduces **new concepts**, *which you may or may not have heard of before*, so that you can **be familiar with them & put them to use**.

> ​	I also **highly recommended** that whenever you **extend** any of these **components**, you still **keep the general functionality** of each of the **methods** & **properties** as **described in the documentation**, so that *others can use your extended components*, in their own projects, *without hassle*.

## Installation

**[Node.js](https://nodejs.org/) 12.0.0 or newer is required, for [Discord.js](https://discord.js.org/) to run properly.**

Simply run the following command to install Abyssal - `npm install discord.js abyssal`

> `Discord.js` is a peer dependency which is required to make Abyssal run properly, so it is also installed in the above command.

## Documentation

### Database - `new Database(debug?: boolean)`

​	This *component* **abstracts** the **interaction between the bot & database** down to *6 simple methods*, *allowing* Abyssal to *interact with, virtually, any database imaginable*. The component, by *default*, stores data in *memory*, however, this can be changed by simply *extending* the component. Abyssal **stores `State` & `Listener` data** using this component, **by default**. (`State` & `Listener`s are elaborated under *Util* section in the documentation)

#### Documents

​	**The *"unit of data"* in the database is a `Document`** - `{ [key: string]: any }`. The **database** can be imagined as *a large **array of `Document`s***.

#### Queries

​	**Queries return**, *one or more*, **`Document`s which match** the *"shape"* of **the provided `Query`** - `{ [key: string]: any }` object, from the database. **A `Document` matches** the *"shape"* of **a `Query` object**, **if *all* the values of *all* the properties in the `Query` object *match* the values of the *corresponding* properties in the `Document`**.  The following `function` returns `true` or `false` if & if not the provided `Document` matches the *"shape"* of the provided `Query` object, respectively.

```typescript
function matchQuery(query: Query, document: Document): boolean {
	const keys = Object.keys(query);
	for (const key of keys) if (document[key] !== query[key]) return false;
	return true;
}
```

#### Interface

```typescript
interface Document {
    [key: string]: any
}

interface Query {
    [key: string]: any
}

interface Database {
	initialize: () => Promise<void>;
	find: (query: Query) => Promise<Document[]>;
	findOne: (query: Query) => Promise<Document | undefined>;
	update: (query: Query, document: Document) => Promise<void>;
	insert: (document: Document) => Promise<void>;
	delete: (query: Query) => Promise<void>;
}
```

#### Functionality

|    Method    | Function                                                     |
| :----------: | :----------------------------------------------------------- |
| `initialize` | **Runs *any* code** which is **required** to **initialize** *the methods*, like creating the connection to the database, for example. This method is called *before* the `Client` logs in. |
|    `find`    | **Returns** an **array of `Document`s**, *all* of which **match** the **`Query` object** provided. (**Empty array** if *none* of the `Document`s **match**) |
|  `findOne`   | **Returns** *one* **`Document`** which **matches** the **`Query` object** provided. (**`undefined`** if *none* of the `Document`s **match**) |
|   `update`   | **Replaces** *all* the **`Document`s** which **match** the **`Query` object** *with* the **`Document` provided**. If there were *no* replacements, then the **provided `Document`** is **inserted** in to the **database**. |
|   `insert`   | **Inserts** the **provided `Document`** in to the **database**. |
|   `delete`   | **Deletes** *any* **`Document`** which **matches** the **`Query` object** provided. |

#### Example Extension

```typescript
import * as Abyssal from 'abyssal';

let Data: Abyssal.Document[] = []; // The "database" holding all the documents

export class Database extends Abyssal.Database {
    // Empty, since there is no code needed to be ran to initialize the methods
	public async initialize() { }

    // Filters & returns all documents which matchQuery returns true to
	public async find(query: Abyssal.Query) {
		return Data.filter(doc => matchQuery(query, doc));
	}

    // Finds & returns one document which matchQuery returns true to, undefined if none
	public async findOne(query: Abyssal.Query) {
		return Data.find(doc => matchQuery(query, doc));
	}

	public async update(query: Abyssal.Query, document: Abyssal.Document) {
		let updated = false; // Set to true if atleast one document was replaced
        // Maps all the documents which matchQuery returns true to, with the provided
    	// document
		Data = Data.map(doc => (matchQuery(query, doc) && ((updated = true) && document)) || doc);
        // If updated is false, meaning none of the documents were replaced, the
        // provided document is pushed into the array
		if (!updated) Data.push(document);
	}

    // Simply pushes the provided document into the array
	public async insert(document: Abyssal.Document) {
		Data.push(document);
	}

    // Filters all the documents which matchQuery does NOT return true to, &
    // replaces the "database" with it
	public async delete(query: Abyssal.Query) {
		Data = Data.filter(doc => !matchQuery(query, doc));
	}
}
```

### Tree - `new Tree(id: TreeID)`

​	This component **fulfills the same functionality `Command` classes do in other frameworks**. However, there are *major* differences. Conventionally, `Command`s are only triggered whenever a [`message`](https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-message) event is emitted, `Tree`s, instead, **can be triggered through *any* event**. Additionally, unlike `Command`s, `Tree`s **_contain_ `Branch`es**, which are *named code blocks which can be executed using the `Util` instance provided*. (basically a `Function`) This component ***extends* the built-in [`EventEmitter`](https://nodejs.org/api/events.html#events_class_eventemitter) class**, to provide a *event-based API* to handle the event emissions.

#### Interface

```typescript
type TreeID = string;
type BranchID = string;
type BranchMethod = (util: Util) => Promise<void>;

interface Tree extends EventEmitter {
    id: TreeID;
    branch: (id: BranchID, method: BranchMethod) => void;
    execBranch: (id: BranchID, util: Util) => Promise<void>;
    on: (event: string | symbol, listener: (util: Util) => void) => this;
	once: (event: string | symbol, listener: (util: Util) => void) => this;
	emit: (event: string | symbol, util: Util) => boolean;
}
```

#### Functionality

| Property | Function                                                 |
| :------: | :------------------------------------------------------- |
|   `id`   | A `string` which **uniquely** identifies *each* `Tree` . |

|  **Method**  | Function                                                     |
| :----------: | ------------------------------------------------------------ |
|   `branch`   | **Defines** a `Branch` .                                     |
| `execBranch` | **Finds** a **`Branch`** *with* the **provided `id`** & **calls** it's **`BranchMethod`** *with* the **provided `Util` instance** as it's *only* **argument**. Throws an **error** if a `Branch` was **not** found. |

**All** the *other* properties have the **same** functionality as in the **`EventEmitter` class**.

#### Example Extension

```typescript
import * as Abyssal from 'abyssal';

interface Branch {
	id: Abyssal.BranchID;
	method: Abyssal.BranchMethod;
}

export class Tree extends Abyssal.Tree {
	private readonly allBranches: Branch[] = []; // Contains all the branches

	public constructor(public id: Abyssal.TreeID) {
		super(id);
	}

	public branch(id: Abyssal.BranchID, method: Abyssal.BranchMethod) {
		this.allBranches.push({ id, method }); // Pushes a new branch into the array
	}

    // Finds the branch with the given ID & executes it's method,
    // throws an error if a branch was not found
	public async execBranch(id: Abyssal.BranchID, util: Abyssal.Util) {
		const branch = this.allBranches.find(branch => branch.id === id);
		if (branch) await branch.method(util);
		else throw new Error(`Branch does not exist - ${id}`);
	}
}
```

#### Example Usage

##### Example 1

The example *below* is of a `Tree` which **responds to `"ping"` with `"Pong!"`**.

![Example Usage](https://i.postimg.cc/7L13FBqq/Peek-2020-03-24-19-03.gif)

```typescript
import * as Abyssal from 'abyssal';

const Ping = new Abyssal.Tree('ping');

// on 'message'
Ping.on('message', util => {
	const { args: [message] } = util;
    // If the author is not a bot & the content is equal to 'ping'
	if (!message.author.bot && message.content === 'ping') {
        // Respond with 'Pong!'
        message.channel.send('Pong!');
    }
});

export default Ping;
```

##### Example 2

*Below* is a example of `Tree` which **sends join & leave messages to a channel**, *with the ID `CHANNEL_ID`*.

![Example Usage](https://i.postimg.cc/7Zz78Bqf/Peek-2020-03-24-19-14.gif)

```typescript
import * as Abyssal from 'abyssal';
import DiscordJS from 'discord.js';

const JoinLeaveMsg = new Abyssal.Tree('joinleavemsg');

// on 'guildMemberAdd'
JoinLeaveMsg.on('guildMemberAdd', util => {
	const { args: [member] } = util;
	const channel = util.client.channels.cache.get(CHANNEL_ID); // Get the channel
    // If the channel exists
	if (channel) {
        // Send 'member has joined!'
        (channel as DiscordJS.TextChannel).send(`${member.displayName} has joined!`);
    }
});

// on 'guildMemberRemove'
JoinLeaveMsg.on('guildMemberRemove', util => {
	const { args: [member] } = util;
	const channel = util.client.channels.cache.get(CHANNEL_ID); // Get the channel
    // If the channel exists
	if (channel) {
        // Send 'member has left!'
        (channel as DiscordJS.TextChannel).send(`${member.displayName} has left!`);
    }
});

export default JoinLeaveMsg;
```

##### Example 3

The *final* example is of a `Tree` which **adds 2 given numbers**. `Branch`es are used in this `Tree` to *"organize"* the steps taken to *execute the command*, however, this isn't the purpose `Branch`es  are *meant* to serve, the *true purpose* `Branch`es serve is documented under the *Util* section.

![Example Usage](https://i.postimg.cc/sg8rScW9/Peek-2020-03-24-19-17.gif)

```typescript
import * as Abyssal from 'abyssal';

const Add = new Abyssal.Tree('add');

// on 'message'
Add.on('message', util => {
	const { args: [message] } = util;
    // If the author is not a bot
	if (!message.author.bot) {
        // Execute the 'validate' branch
        util.execBranch('validate');
    }
});

// The 'validate' branch
Add.branch('validate', async util => {
	const { args: [message] } = util;
    // If the message starts with 'add'
	if (message.content.startsWith('add')) {
        // Split the content by ' '
		const args: string[] = message.content.slice(3).split(' ');
        // Remove the first element (which will always be 'add')
		args.shift();
        // If the array is empty
		if (args.length === 0) {
            // Send 'Please provide 2 numbers to add.'
			message.channel.send('Please provide 2 numbers to add.');
			return;
		}
        // If any of the provided arguments do not parse into a number
		if (args.find(arg => isNaN(parseInt(arg, 10)))) {
            // Send 'Invalid number provided.'
			message.channel.send('Invalid number provided.');
			return;
		}
        // If only one argument was provided
		if (args.length !== 2) {
            // Send 'Please provide the 2nd number to add.'
			message.channel.send('Please provide the 2nd number to add.');
			return;
		}
		util.execBranch('execute'); // Execute the 'execute' branch
	}
});

// The 'execute' branch
Add.branch('execute', async util => {
	const { args: [message] } = util;
    // Split the content by ' '
	const args: string[] = message.content.split(' ');
    // Remove the first element
	args.shift();
    // Map all the string arguments into numbers
	const numbers = args.map(arg => parseInt(arg, 10));
    // Total the numbers
	const answer = numbers.reduce((acc, curr) => acc + curr);
    // Send the answer
	message.channel.send(`${answer} is the answer. (${numbers[0]} + ${numbers[1]})`);
});

export default Add;
```

### Util - `new Util(config: UtilConfig, debug?: boolean)`

​	This component's **main purpose** is to **expose methods**, to the `Tree`, **which manipulate** it's **`State` & `Listener`s**. However, this component *also* contains properties, which expose the *current `event` name, the current `event` `arguments`, the `Client` which is executing the `Tree` etc*. The *below* explanations of `Session` & `Listener`s will probably be *confusing*, hopefully the *Example Usage* section will get rid of the confusion.

#### Session

​	**When *any* `event` is emitted** on the `Client`, a **new `Session` is created** for **each `Tree`**. The `Session`, which is in the format `${TreeID}-someuniquestring`, generated using [Uniqid](https://www.npmjs.com/package/uniqid), **uniquely** identifies **each** *instance* of the `Tree` executed/executing. Notice, **every single `Tree` execution** always starts inside of a `event listener`, *attached* to the `Tree`, & it **always** ends in either the `event listener`, which started it, or inside a `Branch`. The whole *journey* of this execution, from the `event listener` till the end, is one *instance* of a `Tree`. `Util.session` exposes the `Session` of the current *instance*.

#### State

​	**Each *instance* can have it's own `State`**. **`State` is** basically **a `Document`** which you can **store data to**, which may want to access later in the same *instance* in a different `Branch`. `State` is **unique to each *instance***, it's *tracked* using the `Session` string. Below is the `Interface` *defining* the `State` document. (notice that *additional* properties can be added to it, these would be the *actual data stored*)

```typescript
interface State {
	type: 'state';
	session: string;
	[key: string]: any;
}
```

​	**Do not confuse `Util.state` with the actual `State`**. **`Util.state` contains a local copy of the actual `State`**, for *fast access & editing*, it is **not guaranteed to be the *same* as the actual `State`**, *which is stored in the database*. This is *why* the methods which use the local `State`, `Util.getStateProperty` for example, are *synchronous*, as they only use the *local `State`*, which is *stored in memory*, & why methods, which *use the actual `State`*, `Util.saveState` for example,  are *asynchronous*, as they have to use the *asynchronous methods provided by the `Database` component* to store the `Document` in the database. **Note, the actual `State` is not loaded into `Util.state` when `Util` is initialized, thus, to access data in the actual `State`, first run the method `Util.loadState`.**

#### Listeners

​	Using `Listener`s, you may **make *any* `Branch` execute whenever *any* `event` is emitted**. This is the *true* purpose `Branch`es serve. Whenever a `Branch` is executed using a `Listener`, the `Branch` is still part of the same *instance*, meaning it contains *the same `Session` & `State`*. Below is the `Interface` *defining* the `Listener` document.

```typescript
interface Listener {
	type: 'listener';
	event: string;
	session: string;
	branch: string;
}
```

​	`Util.listeners` contains a *local copy* of the `Listener`s which are currently *attached* to the current *instance*. Like with the local `State`, **`Util.listeners` may not reflect the actual `Listener`s attached**. However, running `Util.loadListeners` will copy *all* the `Listener`s attached, to the array.

#### Interface

```typescript
interface Util {
    treeID: string;
	branchID: string | false;
	event: string | symbol;
	args: any[];
	session: string;
	state: State;
	listeners: Listener[];
	database: Database;
	client: Client;
    execBranch: (branchID: string) => Promise<void>;
    getStateProperty: (property: string) => void; 
    setStateProperty: (property: string, value: any) => void;
    deleteStateProperty: (property: string) => void;
    loadState: () => Promise<void>;
    saveState: () => Promise<void>;
    deleteState: () => Promise<void>;
    loadListeners: () => Promise<void>;
    addListener: (event: string | symbol, branchID: string) => Promise<void>;
    removeListener: (event: string | symbol, branchID: string) => Promise<void>;
    removeAllListeners: () => Promise<void>;
}

interface UtilConfig {
    tree: Tree;
	branchID: string | false;
	event: symbol | string;
	args: any[];
	session: string;
	database: Database;
	client: Client;
}
```

#### Functionality - `Util Interface`

|  Property   | Function                                                     |
| :---------: | ------------------------------------------------------------ |
|  `treeID`   | The **ID of the current `Tree`** being executed.             |
| `branchID`  | The **ID of the current `Branch`,** `false` if currently *not* in a `Branch`. |
|   `event`   | The *name* of the **current `event`**.                       |
|   `args`    | The **`argument`s provided** by the `event`.                 |
|  `session`  | The **current `Session`**.                                   |
|   `state`   | **Local copy of the actual `State`**, *may be outdated*.     |
| `listeners` | **Local copy of** *all* the **currently attached `Listener`s**, *may be outdated*. |
| `database`  | **The `Database` component** provided to the `Client`, *on initialization*. |
|  `client`   | **The `Client`** which is executing the `Tree`.              |

|        Method         | Function                                                     |
| :-------------------: | ------------------------------------------------------------ |
|     `execBranch`      | **Executes the `Branch` with the given ID**, throws an error if a `Branch` with the given ID *doesn't exist*. (**The same `Util` instance is passed down as the `argument`**) |
|  `getStateProperty`   | **Returns the value of the property**, with the given name, **of the local `State`**. |
|  `setStateProperty`   | **Sets the value of the property**, with the given name, to the given value, **of the local `State`**. |
| `deleteStateProperty` | **Deletes the property**, with the given name, **off of the local `State`**. |
|      `loadState`      | **Finds the actual `State`**, in the database, **& replaces the local `State` with it**. If *not found*, a `State`, containing *only the properties defined by the `Interface`*, is set to the local `State`. |
|      `saveState`      | **Updates the actual `State`** with the local `State`.       |
|     `deleteState`     | **Deletes the `State`** document off of the database.        |
|    `loadListeners`    | **Copies all the `Listeners`**, *stored in the database*, **to** the **`Util.listeners`** array. |
|     `addListener`     | **Adds a new `Listener`** to the database, which is *attached* to the `event` & `BranchID` provided. |
|   `removeListener`    | **Removes all `Listener`s** which are **_attached_ to the `event` & `BranchID`** provided. |
| `removeAllListeners`  | **Removes all `Listener`s** *attached* to the current *instance*. |

#### Functionality - `UtilConfig Interface`

|  Property  | Function                                                     |
| :--------: | ------------------------------------------------------------ |
|   `tree`   | **The `Tree`** to *bind* the `Util` instance to.             |
| `branchID` | **The ID of the `Branch`** *currently* being executed, `false` is none. |
|  `event`   | The *name* of the **`event` emitted**.                       |
|   `args`   | **The `argument`s** provided by the `event`.                 |
| `session`  | **The `Session`** to *bind* the `Util` instance to.          |
| `database` | **The `Database` component** provided to the `Client`, *on initialization*. |
|  `client`  | **The `Client`** which is executing the `Tree`.              |

#### Example Extension

```typescript
import * as Abyssal from 'abyssal';

export class Util extends Abyssal.Util {
	public treeID: string;
	public branchID: string | false;
	public event: string | symbol;
	public args: any[];
	public session: string;
	public state: Abyssal.State;
	public listeners: Abyssal.Listener[] = [];
	public database: Abyssal.Database;
	public client: Abyssal.Client;
	private readonly currentTree: Abyssal.Tree; // Holds the current tree

	public constructor(config: {
		tree: Abyssal.Tree;
		branchID: string | false;
		event: symbol | string;
		args: any[];
		session: string;
		database: Abyssal.Database;
		client: Abyssal.Client;
	}) {
		super(config);
		this.treeID = config.tree.id;
		this.branchID = config.branchID;
		this.event = config.event;
		this.args = config.args;
		this.session = config.session;
		this.database = config.database;
		this.client = config.client;
		this.currentTree = config.tree; // Set the current tree
        // Set default local state
		this.state = {
			type: 'state',
			session: config.session
		};
	}

    // Execute the execBranch method of the current tree
	public execBranch(branchID: string): Promise<void> {
		this.branchID = branchID;
		return this.currentTree.execBranch(branchID, this);
	}

    // Return the value of the property
	public getStateProperty(property: string) {
		return this.state[property];
	}

    // Set the value of the property
	public setStateProperty(property: string, value: any) {
		this.state[property] = value;
	}

    // Delete the property
	public deleteStateProperty(property: string) {
		delete this.state[property];
	}

    // Find state document from database & replace local state with it,
    // if there is none, set it to default local state
	public async loadState() {
		this.state = (await this.database.findOne({
			type: 'state',
			session: this.session
		}) || {
			type: 'state',
			session: this.session
		}) as Abyssal.State;
	}

    // Update the state document with the local state,
    // If the database didn't have a state document, the update method will
    // insert the document, as it's suppose to do
	public saveState() {
		return this.database.update({
			type: 'state',
			session: this.session
		}, this.state);
	}

    // Delete the state document
	public deleteState() {
		return this.database.delete({
			type: 'state',
			session: this.session
		});
	}

    // Find all the listeners & set Util.listeners to it
	public async loadListeners() {
		this.listeners = (await this.database.find({
			type: 'listener',
			session: this.session
		})) as Abyssal.Listener[];
	}

    // Insert a new listener to the database,
    // update Util.listeners appropriately as well
	public async addListener(event: string | symbol, branchID: string) {
		const listener: Abyssal.Listener = {
			type: 'listener',
			event: event.toString(),
			session: this.session,
			branch: branchID
		};
		this.listeners.push(listener);
		return this.database.insert(listener);
	}

    // Remove a listener from the database,
    // update Util.listeners appropriately as well
	public async removeListener(event: string | symbol, branchID: string) {
		const query: Abyssal.Query = {
			event: event.toString(),
			branch: branchID
		};
		this.listeners = this.listeners.filter(listener => !matchQuery(query, listener));
		query.type = 'listener';
		query.session = this.session;
		return this.database.delete(query);
	}

    // Remove all listeners, by querying only the type & session
	public async removeAllListeners() {
		this.listeners = [];
		return this.database.delete({ type: 'listener', session: this.session });
	}
}
```

#### Example Usage

##### Example 1

The example *below* is of a `Tree` which **generates a random number**, between 0 & 100.

![Example Usage](https://i.postimg.cc/jqDWN8BC/Peek-2020-03-24-19-00.gif)

```typescript
import * as Abyssal from 'abyssal';

const GenNumber = new Abyssal.Tree('gennumber');

// on 'message'
GenNumber.on('message', util => {
	const { args: [message] } = util;
    // If the author is not a bot & content is 'generate number'
	if (!message.author.bot && message.content === 'generate number') {
        // Execute the 'generateNumber' branch
		util.execBranch('generateNumber');
	}
});

// The 'generateNumber' branch
GenNumber.branch('generateNumber', async util => {
	const { args: [message] } = util;
    // Generate the random number
	const number = Math.round(Math.random() * 100);
    // Store the data required in the local state
	util.setStateProperty('number', number);
	util.setStateProperty('user', message.author.id);
	util.setStateProperty('channel', message.channel.id);
	await util.saveState(); // Update the actual state
    // Add a 'message' listener attached to 'showNumber' branch,
    // meaning, every time a 'message' event is emitted in the client,
    // the 'showNumber' branch will be executed with a relevant
    // new Util instance
	await util.addListener('message', 'showNumber');
    // Send messages
	await message.channel.send('Number generated!');
	const content = 'Please respond with "show number" to see the generated number.';
	message.channel.send(content);
});

// The 'showNumber' branch,
// which is executed everytime 'message' event is emitted
GenNumber.branch('showNumber', async util => {
	const { args: [message] } = util;
    // If the author is a bot, quit
	if (message.author.bot) return;
    // If the message is not 'show number'
	if (message.content !== 'show number') {
        // Send a message
		message.channel.send('Number will not be shown.');
        // Delete the state document
		await util.deleteState();
        // Delete all the listeners,
        // meaning this branch won't be fired anymore
		await util.removeAllListeners();
        // And quit, ending the instance
		return;
	}
    // Update the local state with the actual state
	await util.loadState();
    // If the message wasn't sent in the same channel as the number was
    // generated in, quit
	if (message.channel.id !== util.getStateProperty('channel')) return;
    // If the author is not the same user that executed the command, quit
	if (message.author.id !== util.getStateProperty('user')) return;
    // Retrieve the generated number, which was previously stored under 'number'
	const number = util.getStateProperty('number');
    // Send the generated number
	message.channel.send(`The number generated is ${number}`);
    // Cleanup & quit, ending the instance
	await util.deleteState();
	await util.removeAllListeners();
});

export default GenNumber;
```

##### Example 2

The example *below* is of a `Tree` which **sends a message, whose `description` is the current reactions**.

![Example Usage](https://i.postimg.cc/pTSk9JPn/Peek-2020-03-24-17-50.gif)

```typescript
import * as Abyssal from 'abyssal';
import DiscordJS from 'discord.js';

const ReactMsg = new Abyssal.Tree('reactmsg');

// on 'message'
ReactMsg.on('message', util => {
	const { args: [message] } = util;
    // If the author is not a bot & the content is 'react message'
	if (!message.author.bot && message.content === 'react message') {
        // Execute the 'sendMessage' branch
		util.execBranch('sendMessage');
	}
});

// The 'sendMessage' branch
ReactMsg.branch('sendMessage', async util => {
	const { args: [message] } = util;
	const embed = new DiscordJS.MessageEmbed(); // Create embed
    // Set the title & description
	embed.setTitle('Reactions').setDescription('None.');
    // Send the message
	const msg = await message.channel.send(embed);
    // Store the message id under the property 'message'
	util.setStateProperty('message', msg.id);
    // Update the actual state
	await util.saveState();
    // Add listeners to 'messageReactionAdd' & 'messageReactionRemove', both
    // attached to the 'updateMessage' branch, meaning, 'updateMessage' branch
    // will be executed whenever either event is emitted
	await util.addListener('messageReactionAdd', 'updateMessage');
	await util.addListener('messageReactionRemove', 'updateMessage');
});

// The 'updateMessage' branch,
// which is executed on 'messageReactionAdd' & 'messageReactionRemove'
ReactMsg.branch('updateMessage', async util => {
	const { args: [{ message }] } = util;
	await util.loadState(); // Update the local state
    // If the message's id is not equal to the message sent, quit
	if (message.id !== util.getStateProperty('message')) return;
    // Extract all the reactions on the message
	type Reactions = DiscordJS.Collection<string, DiscordJS.MessageReaction>;
	const reactions: Reactions = message.reactions.cache;
	let desc = 'None.'; // Set description to 'None.' by default
    // If there are any reactions
	if (reactions.size > 0) {
		const mapper = (reaction: DiscordJS.MessageReaction) => {
			const expression = `${reaction.count} x ${reaction.emoji}`;
			return expression;
		};
        // Map each reaction into the expression & join all the strings
		desc = reactions.map(mapper).join('\n');
	}
	const embed = new DiscordJS.MessageEmbed(); // Create embed
   	// Set title & description
	embed.setTitle('Reactions').setDescription(desc);
    // Edit the message
	message.edit(embed);
});

export default ReactMsg;
```

##### Example 3

The final example *below*, is of a ***"upgraded"* `Tree` from the *Example 3* under *Example Usage - Tree***. This `Tree` **can handle multiple operations**, namely, *addition, subtraction, multiplication & division*. **The numbers are inputted *through* reactions.**

![Example Usage](https://i.postimg.cc/hv633C0K/Peek-2020-03-24-18-55.gif)

```typescript
import * as Abyssal from 'abyssal';

const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣']; // The number emojis
const operations = ['+', '-', '*', '/']; // The operations

const Calculate = new Abyssal.Tree('calculate');

Calculate.on('message', util => {
	const { args: [message] } = util;
    // If the author is not a bot & content is 'calculate'
	if (!message.author.bot && message.content === 'calculate') {
        // Execute the 'execute' branch
		util.execBranch('execute');
	}
});

// The 'execute' branch
Calculate.branch('execute', async util => {
	const { args: [message] } = util;
    // Send message
	const msg = await message.channel.send('Please react to the first number.');
    // Store the user & message ids
	util.setStateProperty('user', message.author.id);
	util.setStateProperty('message', msg.id);
	await util.saveState(); // Update the actual state
    // Add 'messageReactionAdd' listener, attached to 'inputOne'
	await util.addListener('messageReactionAdd', 'inputOne');
    // Add the reactions,
    // the reactions are the last actions being done because
    // incase the user reacts to the first reaction before the others
    // have yet to be reacted on, the listener & state are already in place
    // waiting for a reaction
	for (const emoji of emojis) await msg.react(emoji);
});

// The 'inputOne' branch,
// which is executed everytime 'messageReactionAdd' event is emitted
Calculate.branch('inputOne', async util => {
	const { args: [reaction, user] } = util;
	const message = reaction.message; // Extract the message
    // If the user is a bot, quit
	if (user.bot) return;
	await util.loadState(); // Update the local state
    // If the user id isn't equal to that of the original user, quit
	if (user.id === util.getStateProperty('user')) return;
    // If the message id isn't equal to that of the original message, quit
	if (message.id === util.getStateProperty('message')) return;
    // Find the index of the reacted emoji in the array
	const idx = emojis.findIndex(emoji => emoji === reaction.emoji.toString());
    // If the index is -1, that means the array doesn't include the reacted emoji,
    // so it must've not been a number sent by the bot, so quit
	if (idx === -1) return;
    // Send message
	const msg = await message.channel.send('Please react to the second number.');
    // Update the message id & store the input
	util.setStateProperty('message', msg.id);
	util.setStateProperty('inputOne', idx + 1);
	await util.saveState(); // Update the actual state
    // Change the listener from the 'inputOne' branch to 'inputTwo'
	await util.removeListener('messageReactionAdd', 'inputOne');
	await util.addListener('messageReactionAdd', 'inputTwo');
    // Add the reactions,
    // it's at the bottom for the same reason as before
	for (const emoji of emojis) await msg.react(emoji);
});

// The 'inputTwo' branch,
// which is executed everytime 'messageReactionAdd' event is emitted
Calculate.branch('inputTwo', async util => {
	const { args: [reaction, user] } = util;
	const message = reaction.message; // Extract the message
    // If the user is a bot, quit
	if (user.bot) return;
	await util.loadState(); // Update the local state
    // If the user id isn't equal to that of the original user, quit
	if (user.id !== util.getStateProperty('user')) return;
    // If the message id isn't equal to that of the original message, quit
	if (message.id !== util.getStateProperty('message')) return;
    // Find the index of the reacted emoji in the array
	const idx = emojis.findIndex(emoji => emoji === reaction.emoji.toString());
    // If the index is -1, quit
	if (idx === -1) return;
    // Send message
	const content = 'Please send the operation to be done on these two numbers. (+, -, *, /)';
	message.channel.send(content);
    // Delete the unnecessary message id data
	util.deleteStateProperty('message');
    // Store the second input & store the channel id
	util.setStateProperty('inputTwo', idx + 1);
	util.setStateProperty('channel', message.channel.id);
	await util.saveState(); // Update the actual state
    // Remove the 'messageReactionAdd' listener attached to 'inputTwo'
	await util.removeListener('messageReactionAdd', 'inputTwo');
    // Add a 'message' listener attached to 'inputThree'
	await util.addListener('message', 'inputThree');
});

// The 'inputThree' branch,
// which is executed everytime 'message' event is emitted
Calculate.branch('inputThree', async util => {
	const { args: [message] } = util;
    // If the author is a bot, quit
	if (message.author.bot) return;
	await util.loadState(); // Update the local state
    // If the channel id is not equal to that of the one the previous message
    // was sent on, quit
	if (message.channel.id !== util.getStateProperty('channel')) return;
    // If the author id isn't equal to that of the original user, quit
	if (message.author.id !== util.getStateProperty('user')) return;
    // Find the index of the message in the array
	const idx = operations.findIndex(operation => operation === message.content);
    // If the index is -1, the message sent wasn't a operation, so send a error
	if (idx === -1) return message.channel.send('Invalid operation.');
    // Retrieve both inputs
	const input1 = util.getStateProperty('inputOne');
	const input2 = util.getStateProperty('inputTwo');
	let answer = input1;
    // Apply the operation, selected by the user, to answer
	switch (idx) {
		case 0: answer += input2; break;
		case 1: answer -= input2; break;
		case 2: answer *= input2; break;
		case 3: answer /= input2; break;
	}
    // Send the message
    const expression = `${input1} ${operations[idx]} ${input2}`;
	message.channel.send(`Answer is ${answer}. (${expression})`);
    // Cleanup & quit, ending the instance
	await util.deleteState();
	await util.removeListener('message', 'inputThree');
});

export default Calculate;
```

### Manager - `new Manager(debugUtil?: boolean)`

​	This component **manages how `event`s emitted by the `Client` are handled**, aka, how `Tree`s are executed. **Whenever *any* `event` is emitted, the `Client` calls the `Manager.eventHandler` method**, with the appropriate `argument`s.

#### Interface

```typescript
interface Manager {
    addTree: (tree: Tree) => void;
    removeTree: (id: TreeID) => void;
    eventHandler: (config: EventHandlerConfig) => Promise<void>;
}

interface EventHandlerConfig {
    event: string | symbol;
    args: any[];
    database: Database;
    client: Client;
}
```

#### Functionality - `Manager Interface`

|     Method     | Function                                                     |
| :------------: | ------------------------------------------------------------ |
|   `addTree`    | **Enables the provided  `Tree`** to be executed.             |
|  `removeTree`  | **Disables the  `Tree`, with the provided ID**, to be executed. (*No error* is thrown if a `Tree` with the provided ID is *not found*) |
| `eventHandler` | **The method which is called on *every* `event` emission.**  |

#### Functionality - `EventHandlerConfig Interface`

|  Property  | Function                                                     |
| :--------: | ------------------------------------------------------------ |
|  `event`   | **The `event`** emitted.                                     |
|   `args`   | **The `argument`s** provided by the `event`.                 |
| `database` | **The `Database` component** provided to the `Client`, *on initialization*. |
|  `client`  | **The `Client`** which the `event` was *emitted on*.         |

#### Example Extension

```typescript
import * as Abyssal from 'abyssal';
import uniqid from 'uniqid';

export class Manager extends Abyssal.Manager {
	private readonly allTrees: Abyssal.Tree[] = []; // Contains all the trees

	public constructor(private readonly debugMode?: boolean) {
		super(debugMode);
	}

    // Push the tree into the array
	public addTree(tree: Abyssal.Tree) {
		this.allTrees.push(tree);
	}

    // Splice the tree out of the array
	public removeTree(id: Abyssal.TreeID) {
		const idx = this.allTrees.findIndex(e => e.id === id);
		this.allTrees.splice(idx, 1);
	}

	public async eventHandler(config: Abyssal.EventHandlerConfig) {
		const { event, args, database, client } = config;
        // Get all the listeners attached to the current event
		const eventList = await database.find({
			type: 'listener',
			event: event.toString()
		}) as Abyssal.Listener[];
        // For each listener, if any,
		eventList.forEach(e => {
            // Find the corresponding tree
			const tree = this.allTrees.find(trig => e.session.startsWith(trig.id));
			// And execute the corresponding branch
            tree?.execBranch(e.branch, new Abyssal.Util({
				tree,
				branchID: e.branch,
				event,
				args,
				session: e.session,
				database,
				client
			}, this.debugMode));
		});
		// Create a session for each tree, using uniqid, & emit it
		this.allTrees.forEach(tree => tree.emit(event, new Abyssal.Util({
			tree,
			branchID: false,
			event,
			args,
			session: uniqid(`${tree.id}-`),
			database,
			client
		}, this.debugMode)));
	}
}
```

### Client - `new Client(config: ClientConfig)`

​	This is the *final* component that is exported in the framework, it **brings together the `Manager` & `Database` to form a instance of your Discord bot**. It **extends `DiscordJS.Client`**, so all the properties & methods of `Client` still apply.

#### Interface

```typescript
interface Client extends DiscordJS.Client {
    database: Database;
    manager: Manager;
}

interface ClientConfig {
    database: Database;
    manager: Manager;
    clientOptions?: DiscordJS.ClientOptions;
}
```

#### Functionality - `Client Interface`

|  Property  | Function                                         |
| :--------: | ------------------------------------------------ |
| `database` | **The `Database`** provided *on initialization*. |
| `manager`  | **The `Manager`** provided *on initialization*.  |

#### Functionality - `ClientConfig Interface`

|    Property     | Function                                                     |
| :-------------: | ------------------------------------------------------------ |
|   `database`    | **The `Database`** to use to *store data*.                   |
|    `manager`    | **The `Manager`** to use to call when *`event`s are emitted*. |
| `clientOptions` | **Options for the `DiscordJS.Client`.**                      |

#### Example Extension

```typescript
import * as Abyssal from 'abyssal';
import DiscordJS from 'discord.js';

export class Client extends Abyssal.Client {
	public database: Abyssal.Database;
	public manager: Abyssal.Manager;
	public constructor(config: {
		database: Abyssal.Database;
		manager: Abyssal.Manager;
		clientOptions?: DiscordJS.ClientOptions;
	}) {
		super(config);
		this.database = config.database;
		this.manager = config.manager;
	}
	
    // Call the Client.manager.eventHandler method on every emission
	public emit(event: string | symbol, ...args: any[]) {
		this.manager.eventHandler({
			event,
			args,
			database: this.database,
			client: this
		});
		return super.emit(event, ...args);
	}

    // Call Client.database.initialize method before logging in
	public async login(token: string) {
		await this.database.initialize();
		return super.login(token);
	}
}
```

#### Example Usage

*Assuming all the above `Tree` examples are inside of `./Examples/`*, the example *below* would **import all of them, add them to the `Manager` & then initialize the `Client` with them**.

```typescript
import * as Abyssal from 'abyssal';
// Import all the trees
import Ping from './Examples/Ping';
import JoinLeaveMsg from './Examples/JoinLeaveMsg';
import Add from './Examples/Add';
import GenNumber from './Examples/GenNumber';
import ReactMsg from './Examples/ReactMsg';
import Calculate from './Examples/Calculate';

const manager = new Abyssal.Manager(); // Initialize the manager
// Add all the trees to the manager
manager.addTree(Ping);
manager.addTree(JoinLeaveMsg);
manager.addTree(Add);
manager.addTree(GenNumber);
manager.addTree(ReactMsg);
manager.addTree(Calculate);

// Initialize the client
const client = new Abyssal.Client({ database: new Abyssal.Database(), manager });
// Login
client.login('secret token');
// On ready, log to the console
client.on('ready', () => console.log(`Client Logged In - ${client.user?.tag}`));
```