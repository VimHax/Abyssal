import { Database, Query, Document } from './Database';
import { Tree } from './Tree';
import { Client } from './Client';
import Debug from 'debug';

const debug = Debug('abyssal:util');

export interface State {
	type: 'state';
	session: string;
	[key: string]: any;
}

export interface Listener {
	type: 'listener';
	event: string;
	session: string;
	branch: string;
}

function matchQuery(query: Query, document: Document): boolean {
	const keys = Object.keys(query);
	for (const key of keys) if (document[key] !== query[key]) return false;
	return true;
}

export class Util {
	public treeID: string;
	public branchID: string | false;
	public event: string | symbol;
	public args: any[];
	public session: string;
	public state: State;
	public listeners: Listener[] = [];
	public database: Database;
	public client: Client;
	private readonly tree: Tree;

	public constructor(config: {
		tree: Tree;
		branchID: string | false;
		event: symbol | string;
		args: any[];
		session: string;
		database: Database;
		client: Client;
	}) {
		this.treeID = config.tree.id;
		this.branchID = config.branchID;
		this.event = config.event;
		this.args = config.args;
		this.session = config.session;
		this.database = config.database;
		this.client = config.client;
		this.tree = config.tree;
		this.state = {
			type: 'state',
			session: config.session
		};
	}

	public execBranch(branchID: string) {
		debug(`[ Tree: ${this.treeID}, Branch: ${this.branchID}, Session: ${this.session} ] Execute branch`, branchID);
		this.branchID = branchID;
		return this.tree.execBranch(branchID, this);
	}

	public getStateProperty(property: string) {
		debug(`[ Tree: ${this.treeID}, Branch: ${this.branchID}, Session: ${this.session} ] Get state property`, property);
		return this.state[property];
	}

	public setStateProperty(property: string, value: any) {
		debug(`[ Tree: ${this.treeID}, Branch: ${this.branchID}, Session: ${this.session} ] Set state property`, property, value);
		this.state[property] = value;
	}

	public deleteStateProperty(property: string) {
		debug(`[ Tree: ${this.treeID}, Branch: ${this.branchID}, Session: ${this.session} ] Delete state property`, property);
		delete this.state[property];
	}

	public async loadState() {
		debug(`[ Tree: ${this.treeID}, Branch: ${this.branchID}, Session: ${this.session} ] Load state`);
		this.state = (await this.database.findOne({
			type: 'state',
			session: this.session
		})) as State || {
			type: 'state',
			session: this.session
		};
	}

	public saveState() {
		debug(`[ Tree: ${this.treeID}, Branch: ${this.branchID}, Session: ${this.session} ] Save state`);
		return this.database.update({
			type: 'state',
			session: this.session
		}, this.state);
	}

	public deleteState() {
		debug(`[ Tree: ${this.treeID}, Branch: ${this.branchID}, Session: ${this.session} ] Delete state`);
		return this.database.delete({
			type: 'state',
			session: this.session
		});
	}

	public async loadListeners() {
		debug(`[ Tree: ${this.treeID}, Branch: ${this.branchID}, Session: ${this.session} ] Load listeners`);
		this.listeners = (await this.database.find({
			type: 'listener',
			session: this.session
		})) as Listener[];
	}

	public async addListener(event: string | symbol, branchID: string) {
		debug(`[ Tree: ${this.treeID}, Branch: ${this.branchID}, Session: ${this.session} ] Add listener`, event, branchID);
		const listener: Listener = {
			type: 'listener',
			event: event.toString(),
			session: this.session,
			branch: branchID
		};
		this.listeners.push(listener);
		return this.database.insert(listener);
	}

	public async removeListener(event: string | symbol, branchID: string) {
		debug(`[ Tree: ${this.treeID}, Branch: ${this.branchID}, Session: ${this.session} ] Remove listener`, event, branchID);
		const query: Query = {
			event: event.toString(),
			branch: branchID
		};
		this.listeners = this.listeners.filter(listener => !matchQuery(query, listener));
		query.type = 'listener';
		query.session = this.session;
		return this.database.delete(query);
	}

	public async removeAllListeners() {
		debug(`[ Tree: ${this.treeID}, Branch: ${this.branchID}, Session: ${this.session} ] Remove all listeners`);
		this.listeners = [];
		return this.database.delete({ type: 'listener', session: this.session });
	}
}
