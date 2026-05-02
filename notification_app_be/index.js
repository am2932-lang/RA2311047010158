"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../logger");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const API_URL = 'https://20.207.122.201/evaluation-service/notifications';
const TOKEN = process.env.API_TOKEN;
/**
 * Fetches notifications from the test server.
 */
function fetchNotifications() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, logger_1.Log)('backend', 'info', 'handler', 'Fetching notifications from test server started');
            // We use https and ignore SSL warnings since it's a raw IP address
            const response = yield axios_1.default.get(API_URL, {
                headers: {
                    'Authorization': `Bearer ${TOKEN}`
                },
                // httpsAgent to ignore self-signed certs (equivalent to curl -k)
                httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
            });
            const notifications = response.data.notifications || [];
            yield (0, logger_1.Log)('backend', 'info', 'handler', `Successfully fetched ${notifications.length} notifications`);
            return notifications;
        }
        catch (error) {
            yield (0, logger_1.Log)('backend', 'error', 'handler', `Failed to fetch notifications: ${error.message}`);
            console.error("Error fetching notifications:", error.message);
            return [];
        }
    });
}
/**
 * Returns the Priority Inbox containing top N notifications.
 * Priority rules:
 * 1. Weight: Placement > Result > Event
 * 2. Recency: Newer timestamp first
 */
function getPriorityInbox(notifications, topN = 10) {
    const weightMap = {
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
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, logger_1.Log)('backend', 'info', 'handler', 'Campus Notifications Microservice initialization started');
        const notifications = yield fetchNotifications();
        // As requested: user's choice is n (top 10)
        const priorityInbox = getPriorityInbox(notifications, 10);
        yield (0, logger_1.Log)('backend', 'info', 'handler', `Generated priority inbox with ${priorityInbox.length} items`);
        console.log("\n==========================================");
        console.log("       CAMPUS PRIORITY INBOX (Top 10)     ");
        console.log("==========================================");
        priorityInbox.forEach((n, index) => {
            console.log(`${index + 1}. [${n.Type}] ${n.Message}`);
            console.log(`   Time: ${n.Timestamp}`);
            console.log("------------------------------------------");
        });
        yield (0, logger_1.Log)('backend', 'info', 'handler', 'Campus Notifications Microservice execution completed successfully');
    });
}
// Execute the service
main();
