
import * as Types from "../index";
import EventEmitter from "events";

class Command extends EventEmitter.EventEmitter implements Types.CommandInterface {

    public id: Types.CommandID;
    public events: Types.UtilEvent[];
    public eventListeners: Types.UtilEvent[];
    public execute: Types.CommandExecutor;
    public validate: Types.CommandValidator;
    constructor(config: Types.CommandConfig) {
        super();
        this.id = config.id;
        this.events = config.events;
        this.eventListeners = config.eventListeners;
        this.execute = config.execute;
        this.validate = config.validator;
    }

    event(event: Types.UtilEvent, args: Types.UtilArgs, util: Types.Util) {
        this.emit(event, args, util);
    }

}

export default Command;