export type LogStack = 'backend' | 'frontend';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type LogPackage = 'api' | 'component' | 'hook' | 'page' | 'state' | 'style' | 'handler' | 'service';
/**
 * Reusable Logging Middleware Function
 * Captures lifecycle events and posts them to the evaluation service logs endpoint.
 */
export declare function Log(stack: LogStack, level: LogLevel, pkg: LogPackage | string, message: string): Promise<any>;
//# sourceMappingURL=index.d.ts.map