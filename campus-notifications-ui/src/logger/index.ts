import axios from 'axios';

// Get token from env variables
const TOKEN = import.meta.env.VITE_API_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJhbTI5MzJAc3JtaXN0LmVkdS5pbiIsImV4cCI6MTc3NzcwMzU0MCwiaWF0IjoxNzc3NzAyNjQwLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiOGJhMWZjYTAtY2IxZC00ZDMyLWExMjMtYzM3MWRkNzMxMmZjIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiYW5kcmVhIG1lcmN5Iiwic3ViIjoiNmQ1MTAzODAtMjk1OC00NTdlLTk0ZmItZmU3NWVjZjZkZmI2In0sImVtYWlsIjoiYW0yOTMyQHNybWlzdC5lZHUuaW4iLCJuYW1lIjoiYW5kcmVhIG1lcmN5Iiwicm9sbE5vIjoicmEyMzExMDQ3MDEwMTU4IiwiYWNjZXNzQ29kZSI6IlFrYnB4SCIsImNsaWVudElEIjoiNmQ1MTAzODAtMjk1OC00NTdlLTk0ZmItZmU3NWVjZjZkZmI2IiwiY2xpZW50U2VjcmV0IjoiR3BNRkVzeVBTVk5XYXBkaiJ9.lYfjwN6L03EzNC32oyyEnh6A3C4I1o5xxwonme4-g7w";
const API_URL = 'http://20.207.122.201/evaluation-service/logs';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type LogPackage = 'api' | 'component' | 'hook' | 'page' | 'state' | 'style'; 

export async function Log(stack: 'frontend', level: LogLevel, pkg: LogPackage, message: string) {
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
        console.error('[Frontend Logger Error]', error?.response?.data || error.message);
    }
}
