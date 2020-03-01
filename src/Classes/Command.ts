
import * as Types from "../index";
import EventEmitter from "events";

const Command: Types.CommandConstructor = class Command extends EventEmitter.EventEmitter implements Types.CommandInterface {

    public id: Types.CommandID;
    public events: Types.UtilEvent[];
    public execute: Types.CommandExecute;
    public validate: Types.CommandValidator;
    constructor(config: Types.CommandConfig) {
        super();
        this.id = config.id;
        this.events = config.events;
        this.execute = config.execute;
        this.validate = config.validator;
    }

    event(event: Types.UtilEvent, args: Types.UtilArgs, util: Types.UtilInterface) {
        this.emit(event, args, util);
    }

}

export default Command;