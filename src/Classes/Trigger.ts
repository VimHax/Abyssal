
import * as Types from '../typings';
import Util from './Util';
import EventEmitter from 'events';

class Trigger extends EventEmitter.EventEmitter implements Types.TriggerInterface {
	public id: Types.TriggerID;
	public events: Types.Event[];
	public eventListeners: Types.Event[];
	public execute: Types.TriggerExecutor;
	public validate: Types.TriggerValidator;
	public constructor(config: Types.TriggerConfig) {
		super();
		this.id = config.id;
		this.events = config.events;
		this.eventListeners = config.eventListeners;
		this.execute = config.executor;
		this.validate = config.validator;
	}

	public eventHandler(event: Types.Event, args: Types.EventArgs, util: Util) {
		this.emit(event, args, util);
	}
}

export default Trigger;
