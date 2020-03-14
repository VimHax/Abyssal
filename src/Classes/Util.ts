
import * as Types from '../typings';
import Database from './Database';

class Util implements Types.UtilInterface {
	public state: Types.State;

	public constructor(
		public id: Types.TriggerID,
		public session: Types.TriggerSession,
		public database: Database
	) {
		this.state = {
			type: 'triggerstate',
			session: this.session
		};
	}

	public getStateProperty(property: Types.StateProperty) { return this.state[property]; }
	public setStateProperty(property: Types.StateProperty, value: Types.StateValue) { this.state[property] = value; }
	public deleteStateProperty(property: Types.StateProperty) { delete this.state[property]; }

	public async loadState() {
		this.state = (await this.database.findOne({
			type: 'triggerstate',
			session: this.session
		})) || {
			type: 'triggerstate',
			session: this.session
		};
	}

	public saveState() {
		return this.database.update({
			type: 'triggerstate',
			session: this.session
		}, this.state);
	}

	public deleteState() {
		return this.database.delete({
			type: 'triggerstate',
			session: this.session
		});
	}

	public addListener(event: Types.Event) {
		return this.database.insert({
			type: `listener`,
			session: this.session,
			event: event.toString()
		});
	}

	public removeListener(event: Types.Event) {
		return this.database.delete({
			type: `listener`,
			session: this.session,
			event: event.toString()
		});
	}

	public removeAllListeners() {
		return this.database.delete({
			type: `listener`,
			session: this.session
		});
	}
}

export default Util;
