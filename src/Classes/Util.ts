
import * as Types from "../index";

class Util implements Types.UtilInterface {

    public state: Types.State;

    constructor(
        public id: Types.TriggerID,
        public session: Types.TriggerSession,
        public database: Types.Database,
    ) {
        this.state = {
            type: "triggerstate",
            session: this.session
        };
    }

    getStateProperty(property: Types.StateProperty) { return this.state[property]; }
    setStateProperty(property: Types.StateProperty, value: Types.StateValue) { this.state[property] = value; }
    deleteStateProperty(property: Types.StateProperty) { delete this.state[property]; }

    async loadState() {
        this.state = (await this.database.findOne({
            type: "triggerstate",
            session: this.session
        })) || {
            type: "triggerstate",
            session: this.session
        };
    }

    saveState() {
        return this.database.update({
            type: "triggerstate",
            session: this.session
        }, this.state);
    }

    deleteState() {
        return this.database.delete({
            type: "triggerstate",
            session: this.session
        });
    }

    addListener(event: Types.Event) {
        return this.database.insert({
            type: `listener`,
            session: this.session,
            event: event.toString()
        })
    }

    removeListener(event: Types.Event) {
        return this.database.delete({
            type: `listener`,
            session: this.session,
            event: event.toString()
        })
    }

    removeAllListeners() {
        return this.database.delete({
            type: `listener`,
            session: this.session
        });
    }

}

export default Util;