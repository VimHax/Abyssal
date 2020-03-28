import Debug from 'debug';
import { Util } from './Util';
import { Event } from './Client';

const debug = Debug('abyssal:tree');

export type BranchID = string;
export type TriggerID = string;
export type ListenerID = string;
export type ListenerEvents = Event[];
export type Action = (util: Util) => Promise<void>;
export type Condition = (util: Util) => Promise<boolean>;
export type BranchMethod = (util: Util) => Promise<void>;
export type ListenerMethod = (util: Util) => Promise<void>;

interface Branch {
	id: BranchID;
	method: BranchMethod;
}

interface Listener {
	id: ListenerID;
	events: ListenerEvents;
	method: ListenerMethod;
}

export class Trigger {
	public validate: Condition = async () => true;
	public execute: Action = async () => undefined;
	public readonly listeners: Listener[] = [];

	// eslint-disable-next-line no-useless-constructor
	public constructor(public id: TriggerID) { }

	public condition(method: Condition) {
		this.validate = method;
	}

	public action(method: Action) {
		this.execute = method;
	}

	public listener(id: ListenerID, events: ListenerEvents, method: ListenerMethod) {
		this.listeners.push({ id, events, method });
	}

	public async execListener(id: ListenerID, util: Util) {
		debug(`[ Tree: ${this.id} ] Execute Listener`, id);
		const listener = this.listeners.find(listener => listener.id === id);
		if (listener) await listener.method(util);
		else throw new Error(`Listener does not exist - ${id}`);
	}
}
