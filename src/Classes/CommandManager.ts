
import * as Types from "../index";
import Util from "./Util";
import uniqid from "uniqid";

class CommandManager implements Types.CommandManagerInterface {

    private commands: Types.Command[] = [];
    private eventListeners: string[] = [];
    private groupedCommands: { [key: string]: Types.Command[] } = {};

    add(command: Types.Command) {
        this.commands.push(command);
        this.eventListeners = [];
        this.groupedCommands = {};
        this.commands.forEach(cmd => {
            cmd.eventListeners.forEach(listener =>
                !this.eventListeners.includes(listener.toString()) && this.eventListeners.push(listener.toString())
            );
            cmd.events.forEach(event => {
                event = event.toString();
                if (this.groupedCommands.hasOwnProperty(event)) this.groupedCommands[event].push(cmd);
                else this.groupedCommands[event] = [cmd];
            });
        });
    }

    remove(id: Types.CommandID) {
        const idx = this.commands.findIndex(e => e.id == id);
        this.commands.splice(idx, 1);
        this.eventListeners = [];
        this.groupedCommands = {};
        this.commands.forEach(cmd => {
            cmd.eventListeners.forEach(listener =>
                !this.eventListeners.includes(listener.toString()) && this.eventListeners.push(listener.toString())
            );
            cmd.events.forEach(event => {
                event = event.toString();
                if (this.groupedCommands.hasOwnProperty(event)) this.groupedCommands[event].push(cmd);
                else this.groupedCommands[event] = [cmd];
            });
        });
    }

    async eventHandler(event: Types.UtilEvent, args: Types.UtilArgs, database: Types.Database) {

        if (this.eventListeners.includes(event.toString())) {
            const eventList = await database.find({
                type: "listener",
                event: event.toString()
            });
            eventList.forEach(e => {
                const command = this.commands.find(cmd => e.session.startsWith(cmd.id));
                command?.event(event, args, new Util(command.id, e.session, database));
            });
        }

        if (this.groupedCommands.hasOwnProperty(event.toString())) {

            let sessions: Types.CommandSession[] = this.groupedCommands[event.toString()].map(cmd => uniqid(`${cmd.id}-`));

            const promises = this.groupedCommands[event.toString()].map((cmd, i) => cmd.validate(event, args, new Util(cmd.id, sessions[i], database)));
            const resolved = await Promise.all(promises);
            const executed: Types.CommandID[] = [];

            resolved.forEach((res, i) => {
                if (res == true) {
                    const command = this.groupedCommands[event.toString()][i];
                    executed.push(command.id);
                    command.execute(event, args, new Util(command.id, sessions[i], database));
                }
            });

            return executed;

        }

        return [];

    }

}

export default CommandManager;