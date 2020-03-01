
import * as Types from "../index";

const Util: Types.UtilConstructor = class Util implements Types.UtilInterface {

    private state: Types.DatastoreData;

    constructor(
        public id: Types.CommandID,
        public session: Types.CommandSession,
        public datastore: Types.DatastoreInterface,
    ) {
        this.state = {
            type: "commandstate",
            session: this.session
        };
    }

    getStateProperty(property: Types.DatastoreDataProperty) { return this.state[property]; }
    setStateProperty(property: Types.DatastoreDataProperty, value: Types.DatastoreDataValue) { this.state[property] = value; }
    deleteStateProperty(property: Types.DatastoreDataProperty) { delete this.state[property]; }

    async loadState() {
        this.state = await this.datastore.findOne({
            type: "commandstate",
            session: this.session
        });
    }

    saveState() {
        return this.datastore.update({
            type: "commandstate",
            session: this.session
        }, this.state);
    }

    deleteState() {
        return this.datastore.delete({
            type: "commandstate",
            session: this.session
        });
    }

    addListener(event: Types.UtilEvent) {
        return this.datastore.insert({
            type: `listener`,
            session: this.session,
            event: event.toString()
        })
    }

    removeListener(event: Types.UtilEvent) {
        return this.datastore.delete({
            type: `listener`,
            session: this.session,
            event: event.toString()
        })
    }

    removeAllListeners() {
        return this.datastore.delete({
            type: `listener`,
            session: this.session
        });
    }

}

export default Util;