import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

export type LogStack = 'backend' | 'frontend';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type LogPackage = 'api' | 'component' | 'hook' | 'page' | 'state' | 'style' | 'handler' | 'service'; 

const API_URL = 'http://20.207.122.201/evaluation-service/logs';
const TOKEN = process.env.API_TOKEN;

/**
 * Reusable Logging Middleware Function
 * Captures lifecycle events and posts them to the evaluation service logs endpoint.
 */
export async function Log(stack: LogStack, level: LogLevel, pkg: LogPackage | string, message: string) {
    try {
        const truncatedMessage = message.length > 48 ? message.substring(0, 48) : message;
        const response = await axios.post(
            API_URL,
            {
                stack,
                level,
                package: pkg,
                message: truncatedMessage
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${TOKEN}`
                }
            }
        );
        return response.data;
    } catch (error: any) {
        // Silently catch errors so logging failures don't crash the main app
        const errorMsg = error?.response?.data ? JSON.stringify(error.response.data) : error.message;
        console.error('[Logger Middleware Error]: Failed to send log:', errorMsg);
    }
}
