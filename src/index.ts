
import DiscordJS from "discord.js";
import EventEmitter from "events";

import Database from "./Classes/Database";
import Util from "./Classes/Util";
import Command from "./Classes/Command";
import CommandManager from "./Classes/CommandManager";
import Task from "./Classes/Task";
import TaskManager from "./Classes/TaskManager";
import Client from "./Classes/Client";

// Database //

export type DatabaseDataValue = any;
export type DatabaseDataProperty = string;
export type DatabaseData = {
    [key: string]: DatabaseDataValue;
};

export interface DatabaseInterface {
    initialize: () => Promise<void>;
    find: (query: DatabaseData) => Promise<DatabaseData[]>;
    findOne: (query: DatabaseData) => Promise<DatabaseData | undefined>;
    update: (query: DatabaseData, data: DatabaseData) => Promise<void>;
    insert: (data: DatabaseData) => Promise<void>;
    delete: (query: DatabaseData) => Promise<void>;
}

// Util //

export type CommandID = string;
export type CommandSession = string;
export type UtilArgs = any[];
export type UtilEvent = string | symbol;

export interface UtilInterface {
    id: CommandID;
    session: CommandSession;
    database: Database;
    getStateProperty: (property: DatabaseDataProperty) => DatabaseDataValue | undefined;
    setStateProperty: (property: DatabaseDataProperty, value: DatabaseDataValue) => void;
    deleteStateProperty: (property: DatabaseDataProperty) => void;
    loadState: () => Promise<void>;
    saveState: () => Promise<void>;
    deleteState: () => Promise<void>;
    addListener: (event: UtilEvent) => Promise<void>;
    removeListener: (event: UtilEvent) => Promise<void>;
    removeAllListeners: () => Promise<void>;
}

// Command //

export type CommandExecutor = (event: UtilEvent, args: UtilArgs, util: Util) => Promise<void>;
export type CommandValidator = (event: UtilEvent, args: UtilArgs, util: Util) => Promise<boolean>;

export interface CommandInterface extends EventEmitter.EventEmitter {
    id: CommandID;
    events: UtilEvent[];
    eventListeners: UtilEvent[];
    execute: CommandExecutor
    validate: CommandValidator;
    event: (event: UtilEvent, args: UtilArgs, util: Util) => void;
    on: (event: UtilEvent, listener: (args: UtilArgs, util: Util) => void) => this;
}

export interface CommandConfig {
    id: CommandID,
    events: UtilEvent[],
    eventListeners: UtilEvent[],
    execute: CommandExecutor,
    validator: CommandValidator
}

// Command-Manager //

export interface CommandManagerInterface {
    add: (command: Command) => void;
    remove: (id: CommandID) => void;
    eventHandler: (event: UtilEvent, args: UtilArgs, database: Database) => Promise<CommandID[]>;
}

// Task //

export type TaskID = string;
export type TaskExecutor = (event: UtilEvent, args: UtilArgs, commands: CommandID[], database: Database) => Promise<void>;

export interface TaskInterface {
    id: TaskID;
    events: UtilEvent[];
    execute: TaskExecutor;
}

// Task-Manager //

export interface TaskManagerInterface {
    add: (task: Task) => void;
    remove: (id: TaskID) => void;
    eventHandler: (event: UtilEvent, args: UtilArgs, commands: CommandID[], database: Database) => void;
}

// Client //

export type ClientConfig = {
    database: Database,
    commandManager: CommandManager,
    taskManager: TaskManager,
    clientOptions?: DiscordJS.ClientOptions
};

export interface ClientInterface extends DiscordJS.Client {
    config: ClientConfig;
}

export {
    Database,
    Util,
    Command,
    CommandManager,
    Task,
    TaskManager,
    Client
}