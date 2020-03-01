
import DiscordJS from "discord.js";
import EventEmitter from "events";

import Datastore from "./Classes/Datastore";
import Util from "./Classes/Util";
import Command from "./Classes/Command";
import CommandManager from "./Classes/CommandManager";
import Task from "./Classes/Task";
import TaskManager from "./Classes/TaskManager";
import Client from "./Classes/Client";

// Datastore //

export type DatastoreID = string;
export type DatastoreDataValue = any;
export type DatastoreDataProperty = string;
export type DatastoreData = {
    [key: string]: DatastoreDataValue;
};

export interface DatastoreInterface {
    initialize: () => Promise<void>;
    find: (query: DatastoreData) => Promise<DatastoreData[]>;
    findOne: (query: DatastoreData) => Promise<DatastoreData>;
    update: (query: DatastoreData, data: DatastoreData) => Promise<void>;
    insert: (data: DatastoreData) => Promise<void>;
    delete: (query: DatastoreData) => Promise<void>;
}

// Util //

export type CommandID = string;
export type CommandSession = string;
export type UtilArgs = any[];
export type UtilEvent = string | symbol;

export interface UtilInterface {
    id: CommandID;
    session: CommandSession;
    datastore: DatastoreInterface;
    getStateProperty: (property: DatastoreDataProperty) => DatastoreDataValue;
    setStateProperty: (property: DatastoreDataProperty, value: DatastoreDataValue) => void;
    deleteStateProperty: (property: DatastoreDataProperty) => void;
    loadState: () => Promise<void>;
    saveState: () => Promise<void>;
    deleteState: () => Promise<void>;
    addListener: (event: UtilEvent) => Promise<void>;
    removeListener: (event: UtilEvent) => Promise<void>;
    removeAllListeners: () => Promise<void>;
}

export interface UtilConstructor {
    new(id: CommandID, session: CommandSession, datastore: DatastoreInterface): UtilInterface;
}

// Command //

export type CommandExecute = (event: UtilEvent, args: UtilArgs, util: UtilInterface) => Promise<void>;
export type CommandValidator = (event: UtilEvent, args: UtilArgs, util: UtilInterface) => Promise<boolean>;

export interface CommandInterface extends EventEmitter.EventEmitter {
    id: CommandID;
    events: UtilEvent[];
    execute: CommandExecute
    validate: CommandValidator;
    event: (event: UtilEvent, args: UtilArgs, util: UtilInterface) => void;
    on: (event: UtilEvent, listener: (args: UtilArgs, util: UtilInterface) => void) => this;
}

export interface CommandConfig {
    id: CommandID,
    events: UtilEvent[],
    execute: CommandExecute,
    validator: CommandValidator
}

export interface CommandConstructor {
    new(config: CommandConfig): CommandInterface;
}

// Command-Manager //

export interface CommandManagerInterface {
    add: (command: CommandInterface) => void;
    remove: (id: CommandID) => void;
    eventHandler: (event: UtilEvent, args: UtilArgs, datastore: DatastoreInterface) => Promise<CommandID[]>;
}

// Task //

export type TaskID = string;
export type TaskExecute = (event: UtilEvent, args: UtilArgs, commands: CommandID[], datastore: DatastoreInterface) => Promise<void>;

export interface TaskInterface {
    id: TaskID;
    events: UtilEvent[];
    execute: TaskExecute;
}

export interface TaskConstructor {
    new(id: TaskID, events: UtilEvent[], execute: TaskExecute): TaskInterface;
}

// Task-Manager //

export interface TaskManagerInterface {
    add: (task: TaskInterface) => void;
    remove: (id: TaskID) => void;
    eventHandler: (event: UtilEvent, args: UtilArgs, commands: CommandID[], datastore: DatastoreInterface) => void;
}

// Client //

export type ClientConfig = {
    datastore: DatastoreInterface,
    commandManager: CommandManagerInterface,
    taskManager: TaskManagerInterface,
    clientOptions?: DiscordJS.ClientOptions
};

export interface ClientInterface extends DiscordJS.Client {
    config: ClientConfig;
}

export interface ClientConstructor {
    new(config: ClientConfig): ClientInterface;
}

export {
    Datastore,
    Util,
    Command,
    CommandManager,
    Task,
    TaskManager,
    Client
}