import type { LineStackEnv } from "../env/schema.js";

export type LogLevel = LineStackEnv["LOG_LEVEL"];

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export type LogFields = Record<string, unknown>;

export type Logger = {
  debug: (message: string, fields?: LogFields) => void;
  info: (message: string, fields?: LogFields) => void;
  warn: (message: string, fields?: LogFields) => void;
  error: (message: string, fields?: LogFields) => void;
  child: (bindings: LogFields) => Logger;
};

function shouldLog(current: LogLevel, target: LogLevel): boolean {
  return LEVEL_ORDER[target] >= LEVEL_ORDER[current];
}

function emit(level: LogLevel, message: string, bindings: LogFields, fields?: LogFields) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    msg: message,
    ...bindings,
    ...fields,
  };
  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export function createLogger(level: LogLevel = "info", bindings: LogFields = {}): Logger {
  const log =
    (target: LogLevel) =>
    (message: string, fields?: LogFields) => {
      if (shouldLog(level, target)) emit(target, message, bindings, fields);
    };

  return {
    debug: log("debug"),
    info: log("info"),
    warn: log("warn"),
    error: log("error"),
    child: (childBindings) => createLogger(level, { ...bindings, ...childBindings }),
  };
}
