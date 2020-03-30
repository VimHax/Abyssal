import Debug from 'debug';
import { Util } from './Util';
import { Event } from './Client';

const debug = Debug('abyssal:trigger');

export type TriggerID = string;
export type HandlerID = string;
export type HandlerEvents = Event[];
export type Action = (util: Util) => Promise<void>;
export type Condition = (util: Util) => Promise<boolean>;
export type HandlerMethod = (util: Util) => Promise<void>;

interface Handler {
	id: HandlerID;
	events: HandlerEvents;
	method: HandlerMethod;
}

export class Trigger {
	public validate: Condition = async () => true;
	public execute: Action = async () => undefined;
	public readonly handlers: Handler[] = [];

	// eslint-disable-next-line no-useless-constructor
	public constructor(public id: TriggerID) { }

	public condition(method: Condition): void {
		this.validate = method;
	}

	public action(method: Action): void {
		this.execute = method;
	}

	public handler(id: HandlerID, events: HandlerEvents, method: HandlerMethod): void {
		this.handlers.push({ id, events, method });
	}

	public async execHandler(id: HandlerID, util: Util): Promise<void> {
		debug(`[ Trigger: ${this.id} ] Execute Handler`, id);
		const listener = this.handlers.find(listener => listener.id === id);
		if (listener) await listener.method(util);
		else throw new Error(`Handler does not exist - ${id}`);
	}
}
