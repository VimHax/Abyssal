import Debug from 'debug';
import { Client, Event, Args } from './Client';
import { Trigger, HandlerID } from './Trigger';
import { Database, Query, Data } from './Database';

const debug = Debug('abyssal:util');

export interface State {
	type: 'state';
	session: string;
	[key: string]: any;
}

export interface Listener {
	type: 'listener';
	session: string;
	handler: string;
}

export interface UtilConfig {
	args: Args;
	event: Event;
	client: Client;
	session: string;
	trigger: Trigger;
	database: Database;
}

function matchQuery(query: Query, data: Data): boolean {
	const keys = Object.keys(query);
	for (const key of keys) if (data[key] !== query[key]) return false;
	return true;
}

export class Util {
	public args: Args;
	public event: Event;
	public state: State;
	public client: Client;
	public session: string;
	public database: Database;
	public listeners: Listener[] = [];

	public constructor(config: UtilConfig) {
		this.args = config.args;
		this.event = config.event;
		this.client = config.client;
		this.session = config.session;
		this.database = config.database;
		this.state = {
			type: 'state',
			session: config.session
		};
	}

	public getStateProperty(property: string): any {
		debug(`Session: ${this.session} Get state property`, property);
		return this.state[property];
	}

	public setStateProperty(property: string, value: any): void {
		debug(`Session: ${this.session} Set state property`, property, value);
		this.state[property] = value;
	}

	public deleteStateProperty(property: string): void {
		debug(`Session: ${this.session} Delete state property`, property);
		delete this.state[property];
	}

	public async loadState(): Promise<void> {
		debug(`Session: ${this.session} Load state`);
		this.state = (await this.database.findOne({
			type: 'state',
			session: this.session
		})) as State || {
			type: 'state',
			session: this.session
		};
	}

	public saveState(): Promise<void> {
		debug(`Session: ${this.session} Save state`);
		return this.database.upsert({
			type: 'state',
			session: this.session
		}, this.state);
	}

	public deleteState(): Promise<void> {
		debug(`Session: ${this.session} Delete state`);
		return this.database.delete({
			type: 'state',
			session: this.session
		});
	}

	public async loadAllListeners(): Promise<void> {
		debug(`Session: ${this.session} Load All listeners`);
		this.listeners = (await this.database.find({
			type: 'listener',
			session: this.session
		})) as Listener[];
	}

	public addListener(handlerID: HandlerID): Promise<void> {
		debug(`Session: ${this.session} Add listener`, handlerID);
		const listener: Listener = {
			type: 'listener',
			session: this.session,
			handler: handlerID
		};
		this.listeners.push(listener);
		return this.database.insert(listener);
	}

	public removeListener(handlerID: HandlerID): Promise<void> {
		debug(`Session: ${this.session} Remove listener`, handlerID);
		const query: Query = { handler: handlerID };
		this.listeners = this.listeners.filter(listener => !matchQuery(query, listener));
		query.type = 'listener';
		query.session = this.session;
		return this.database.delete(query);
	}

	public removeAllListeners(): Promise<void> {
		debug(`Session: ${this.session} Remove all listeners`);
		this.listeners = [];
		return this.database.delete({ type: 'listener', session: this.session });
	}
}
