import { Util, Listener } from './Util';
import { Database } from './Database';
import { Tree, TreeID } from './Tree';
import { Client } from './Client';
import uniqid from 'uniqid';
import Debug from 'debug';

const debug = Debug(`abyssal:manager`);

export interface EventHandlerConfig {
	event: string | symbol;
	args: any[];
	database: Database;
	client: Client;
}

export class Manager {
	private readonly trees: Tree[] = [];

	public addTree(tree: Tree) {
		this.trees.push(tree);
	}

	public removeTree(id: TreeID) {
		const idx = this.trees.findIndex(e => e.id === id);
		this.trees.splice(idx, 1);
	}

	public async eventHandler(config: EventHandlerConfig) {
		debug(`Event handler method executed`);
		const { event, args, database, client } = config;
		const eventList = await database.find({
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
				database,
				client
			}));
		});
		this.trees.forEach(tree => tree.emit(event, new Util({
			tree,
			branchID: false,
			event,
			args,
			session: uniqid(`${tree.id}-`),
			database,
			client
		})));
	}
}
