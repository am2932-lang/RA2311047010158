import axios from 'axios';
import { Log } from '../logger';
import * as dotenv from 'dotenv';
dotenv.config();

const API_URL = 'https://20.207.122.201/evaluation-service/notifications';
const TOKEN = process.env.API_TOKEN;

interface Notification {
    ID: string;
    Type: string;
    Message: string;
    Timestamp: string;
}

/**
 * Fetches notifications from the test server.
 */
async function fetchNotifications(): Promise<Notification[]> {
    try {
        await Log('backend', 'info', 'handler', 'Fetching notifications from test server started');
        
        // We use https and ignore SSL warnings since it's a raw IP address
        const response = await axios.get(API_URL, {
            headers: {
                'Authorization': `Bearer ${TOKEN}`
            },
            // httpsAgent to ignore self-signed certs (equivalent to curl -k)
            httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
        });
        
        const notifications = response.data.notifications || [];
        await Log('backend', 'info', 'handler', `Successfully fetched ${notifications.length} notifications`);
        return notifications;
    } catch (error: any) {
        await Log('backend', 'error', 'handler', `Failed to fetch notifications: ${error.message}`);
        console.error("Error fetching notifications:", error.message);
        return [];
    }
}

/**
 * Returns the Priority Inbox containing top N notifications.
 * Priority rules:
 * 1. Weight: Placement > Result > Event
 * 2. Recency: Newer timestamp first
 */
function getPriorityInbox(notifications: Notification[], topN: number = 10): Notification[] {
    const weightMap: Record<string, number> = {
        'Placement': 3,
        'Result': 2,
        'Event': 1
    };

    // Sort the array out-of-place or duplicate it
    const sorted = [...notifications].sort((a, b) => {
        const weightA = weightMap[a.Type] || 0;
        const weightB = weightMap[b.Type] || 0;
        
        // If weights are different, sort by weight descending
        if (weightA !== weightB) {
            return weightB - weightA;
        }
        
        // If weights are equal, sort by Timestamp descending (recency)
        const timeA = new Date(a.Timestamp).getTime();
        const timeB = new Date(b.Timestamp).getTime();
        return timeB - timeA;
    });

    return sorted.slice(0, topN);
}

async function main() {
    await Log('backend', 'info', 'handler', 'Campus Notifications Microservice initialization started');
    
    const notifications = await fetchNotifications();
    
    // As requested: user's choice is n (top 10)
    const priorityInbox = getPriorityInbox(notifications, 10);
    
    await Log('backend', 'info', 'handler', `Generated priority inbox with ${priorityInbox.length} items`);
    
    console.log("\n==========================================");
    console.log("       CAMPUS PRIORITY INBOX (Top 10)     ");
    console.log("==========================================");
    priorityInbox.forEach((n, index) => {
        console.log(`${index + 1}. [${n.Type}] ${n.Message}`);
        console.log(`   Time: ${n.Timestamp}`);
        console.log("------------------------------------------");
    });
    
    await Log('backend', 'info', 'handler', 'Campus Notifications Microservice execution completed successfully');
}

// Execute the service
main();
