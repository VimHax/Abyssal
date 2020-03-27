import { Database } from './Database';
import { Tree, TreeID } from './Tree';
import { Util, Listener } from './Util';
import DiscordJS from 'discord.js';
import Uniqid from 'uniqid';
import Debug from 'debug';

const debug = Debug('abyssal:client');

export type Event = string | symbol;
export type Args = any[];

export class Client extends DiscordJS.Client {
	private readonly trees: Tree[] = [];
	public constructor(public database: Database, clientOptions?: DiscordJS.ClientOptions) {
		super(clientOptions);
		this.on('ready', () => debug(`Logged in as ${this.user?.tag}`));
	}

	public addTree(tree: Tree) {
		this.trees.push(tree);
	}

	public removeTree(id: TreeID) {
		const idx = this.trees.findIndex(e => e.id === id);
		this.trees.splice(idx, 1);
	}

	public emit(event: Event, ...args: Args) {
		debug(`'${event.toString()}' event emitted`);
		this.eventHandler(event, args);
		return super.emit(event, ...args);
	}

	private async eventHandler(event: Event, args: Args) {
		debug(`Event handler method executed`);

		const eventList = await this.database.find({
			type: 'listener',
			event: event.toString()
		}) as Listener[];

		eventList.forEach(e => {
			const tree = this.trees.find(trig => e.session.startsWith(trig.id));
			tree?.execBranch(e.branch, new Util({
				tree,
				branchID: e.branch,
				event,
				args,
				session: e.session,
				database: this.database,
				client: this
			}));
		});

		this.trees.forEach(tree => tree.emit(event, new Util({
			tree,
			branchID: false,
			event,
			args,
			session: Uniqid(`${tree.id}-`),
			database: this.database,
			client: this
		})));
	}

	public async login(token: string) {
		debug('Initializing database...');
		await this.database.initialize();
		debug('Database initialized');
		debug('Logging in...');
		return super.login(token);
	}
}
