
import * as Types from "../index";

class TaskManager implements Types.TaskManagerInterface {

    private tasks: Types.TaskInterface[] = [];

    add(task: Types.TaskInterface) {
        this.tasks.push(task);
    }

    remove(id: Types.TaskID) {
        const idx = this.tasks.findIndex(e => e.id == id);
        this.tasks.splice(idx, 1);
    }

    async eventHandler(event: Types.UtilEvent, args: Types.UtilArgs, commands: Types.CommandID[], datastore: Types.DatastoreInterface) {
        this.tasks.forEach(task => {
            if (task.events.includes(event)) {
                task.execute(event, args, commands, datastore);
            }
        });
    }

}

export default TaskManager;