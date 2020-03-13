
import * as Types from "../index";

class TaskManager implements Types.TaskManagerInterface {

    private tasks: Types.Task[] = [];

    add(task: Types.Task) {
        this.tasks.push(task);
    }

    remove(id: Types.TaskID) {
        const idx = this.tasks.findIndex(e => e.id == id);
        this.tasks.splice(idx, 1);
    }

    async eventHandler(event: Types.UtilEvent, args: Types.UtilArgs, commands: Types.CommandID[], database: Types.Database) {
        this.tasks.forEach(task => {
            if (task.events.includes(event)) {
                task.execute(event, args, commands, database);
            }
        });
    }

}

export default TaskManager;