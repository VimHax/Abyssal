
import * as Types from "../index";

class Util implements Types.UtilInterface {

    public state: Types.DatabaseData;

    constructor(
        public id: Types.CommandID,
        public session: Types.CommandSession,
        public database: Types.Database,
    ) {
        this.state = {
            type: "commandstate",
            session: this.session
        };
    }

    getStateProperty(property: Types.DatabaseDataProperty) { return this.state[property]; }
    setStateProperty(property: Types.DatabaseDataProperty, value: Types.DatabaseDataValue) { this.state[property] = value; }
    deleteStateProperty(property: Types.DatabaseDataProperty) { delete this.state[property]; }

    async loadState() {
        this.state = (await this.database.findOne({
            type: "commandstate",
            session: this.session
        })) || {
            type: "commandstate",
            session: this.session
        };
    }

    saveState() {
        return this.database.update({
            type: "commandstate",
            session: this.session
        }, this.state);
    }

    deleteState() {
        return this.database.delete({
            type: "commandstate",
            session: this.session
        });
    }

    addListener(event: Types.UtilEvent) {
        return this.database.insert({
            type: `listener`,
            session: this.session,
            event: event.toString()
        })
    }

    removeListener(event: Types.UtilEvent) {
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