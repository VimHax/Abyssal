
import * as Types from "../index";
import Util from "./Util";
import uniqid from "uniqid";

class CommandManager implements Types.CommandManagerInterface {

    private commands: Types.Command[] = [];

    add(command: Types.Command) {
        this.commands.push(command);
    }

    remove(id: Types.CommandID) {
        const idx = this.commands.findIndex(e => e.id == id);
        this.commands.splice(idx, 1);
    }

    async eventHandler(event: Types.UtilEvent, args: Types.UtilArgs, database: Types.Database) {

        const eventList = await database.find({
            type: "listener",
            event: event.toString()
        });

        eventList.forEach(e => {
            const command = this.commands.find(cmd => e.session.startsWith(cmd.id));
            command?.event(event, args, new Util(command.id, e.session, database));
        });

        let sessions: Types.CommandSession[] = [];
        for (let i = 0; i < this.commands.length; i++) {
            sessions.push(uniqid(`${this.commands[i].id}-`));
        }

        const promises = this.commands.map((cmd, idx) => cmd.validate(event, args, new Util(cmd.id, sessions[idx], database)));
        const resolved = await Promise.all(promises);
        const executed: Types.CommandID[] = [];

        resolved.forEach((res, idx) => {
            if (res == true) {
                const command = this.commands[idx];
                executed.push(command.id);
                command.execute(event, args, new Util(command.id, sessions[idx], database));
            }
        });

        return executed;

    }

}

export default CommandManager;