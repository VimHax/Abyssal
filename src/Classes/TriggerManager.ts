
import * as Types from "../index";
import Util from "./Util";
import uniqid from "uniqid";

class TriggerManager implements Types.TriggerManagerInterface {

    private triggers: Types.Trigger[] = [];
    private eventListeners: string[] = [];
    private groupedTriggers: { [key: string]: Types.Trigger[] } = {};

    add(trigger: Types.Trigger) {
        this.triggers.push(trigger);
        this.eventListeners = [];
        this.groupedTriggers = {};
        this.triggers.forEach(trig => {
            trig.eventListeners.forEach(listener =>
                !this.eventListeners.includes(listener.toString()) && this.eventListeners.push(listener.toString())
            );
            trig.events.forEach(event => {
                event = event.toString();
                if (this.groupedTriggers.hasOwnProperty(event)) this.groupedTriggers[event].push(trig);
                else this.groupedTriggers[event] = [trig];
            });
        });
    }

    remove(id: Types.TriggerID) {
        const idx = this.triggers.findIndex(e => e.id == id);
        this.triggers.splice(idx, 1);
        this.eventListeners = [];
        this.groupedTriggers = {};
        this.triggers.forEach(trig => {
            trig.eventListeners.forEach(listener =>
                !this.eventListeners.includes(listener.toString()) && this.eventListeners.push(listener.toString())
            );
            trig.events.forEach(event => {
                event = event.toString();
                if (this.groupedTriggers.hasOwnProperty(event)) this.groupedTriggers[event].push(trig);
                else this.groupedTriggers[event] = [trig];
            });
        });
    }

    async eventHandler(event: Types.Event, args: Types.EventArgs, database: Types.Database) {

        if (this.eventListeners.includes(event.toString())) {
            const eventList = await database.find({
                type: "listener",
                event: event.toString()
            });
            eventList.forEach(e => {
                const trigger = this.triggers.find(trig => e.session.startsWith(trig.id));
                trigger?.eventHandler(event, args, new Util(trigger.id, e.session, database));
            });
        }

        if (this.groupedTriggers.hasOwnProperty(event.toString())) {

            let sessions: Types.TriggerSession[] = this.groupedTriggers[event.toString()].map(trig => uniqid(`${trig.id}-`));

            const promises = this.groupedTriggers[event.toString()].map((trig, i) => trig.validate(event, args, new Util(trig.id, sessions[i], database)));
            const resolved = await Promise.all(promises);
            const executed: Types.Trigger[] = [];

            resolved.forEach((res, i) => {
                if (res == true) {
                    const trigger = this.groupedTriggers[event.toString()][i];
                    executed.push(trigger);
                    trigger.execute(event, args, new Util(trigger.id, sessions[i], database));
                }
            });

            return executed;

        }

        return [];

    }

}

export default TriggerManager;