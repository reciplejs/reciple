export enum CommandType {
    Message = 1,
    Slash = 2,
    ContextMenu = 3
}

export enum CooldownTriggerType {
    Command = 1,
    Interaction = 2
}

export enum CommandPostconditionReason {
    Unknown = 1,
    Error,
    Cooldown,
    PreconditionError,
    PreconditionFailure,
    InvalidArgs,
    MissingArgs,
    InvalidFlags,
    MissingFlags
}
