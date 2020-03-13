
import * as Types from "../index";

class Task implements Types.TaskInterface {

    public execute: Types.TaskExecutor;
    constructor(
        public id: Types.TaskID,
        public events: Types.UtilEvent[],
        task: Types.TaskExecutor
    ) { this.execute = task; }

}

export default Task;