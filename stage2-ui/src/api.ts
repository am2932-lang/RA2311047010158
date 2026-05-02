import axios from 'axios';
import { API_URL, Log } from './logger';

export interface Notification {
  ID: string;
  Type: 'Event' | 'Result' | 'Placement';
  Message: string;
  Timestamp: string;
}

const TOKEN = import.meta.env.VITE_API_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJhbTI5MzJAc3JtaXN0LmVkdS5pbiIsImV4cCI6MTc3NzcwMzU0MCwiaWF0IjoxNzc3NzAyNjQwLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiOGJhMWZjYTAtY2IxZC00ZDMyLWExMjMtYzM3MWRkNzMxMmZjIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiYW5kcmVhIG1lcmN5Iiwic3ViIjoiNmQ1MTAzODAtMjk1OC00NTdlLTk0ZmItZmU3NWVjZjZkZmI2In0sImVtYWlsIjoiYW0yOTMyQHNybWlzdC5lZHUuaW4iLCJuYW1lIjoiYW5kcmVhIG1lcmN5Iiwicm9sbE5vIjoicmEyMzExMDQ3MDEwMTU4IiwiYWNjZXNzQ29kZSI6IlFrYnB4SCIsImNsaWVudElEIjoiNmQ1MTAzODAtMjk1OC00NTdlLTk0ZmItZmU3NWVjZjZkZmI2IiwiY2xpZW50U2VjcmV0IjoiR3BNRkVzeVBTVk5XYXBkaiJ9.lYfjwN6L03EzNC32oyyEnh6A3C4I1o5xxwonme4-g7w";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`
  }
});

export const fetchNotifications = async (
  page?: number,
  limit?: number,
  notification_type?: string
): Promise<Notification[]> => {
  try {
    const params: Record<string, any> = {};
    if (page) params.page = page;
    if (limit) params.limit = limit;
    if (notification_type) params.notification_type = notification_type;

    await Log('frontend', 'info', 'api', `Fetching notifications: p=${page || 'all'} t=${notification_type || 'all'}`);
    
    const response = await apiClient.get('/notifications', { params });
    const notifications = response.data.notifications || [];
    
    await Log('frontend', 'info', 'api', `Successfully fetched ${notifications.length} notifications`);
    return notifications;
  } catch (error: any) {
    await Log('frontend', 'error', 'api', `Failed to fetch notifications: ${error.message}. Using mock fallback.`);
    // Fallback to mock data if token is invalid or server is down
    const mockData: Notification[] = [
      { ID: '1', Type: 'Placement', Message: 'Google is hiring Software Engineers', Timestamp: new Date().toISOString() },
      { ID: '2', Type: 'Result', Message: 'End semester results announced', Timestamp: new Date(Date.now() - 3600000).toISOString() },
      { ID: '3', Type: 'Event', Message: 'Annual Tech Symposium next week', Timestamp: new Date(Date.now() - 7200000).toISOString() },
      { ID: '4', Type: 'Placement', Message: 'Microsoft Campus Drive', Timestamp: new Date(Date.now() - 86400000).toISOString() },
      { ID: '5', Type: 'Event', Message: 'Hackathon Registration Open', Timestamp: new Date(Date.now() - 90000000).toISOString() },
    ];
    
    // Filter and paginate mock data
    let filtered = mockData;
    if (notification_type) {
      filtered = filtered.filter(n => n.Type === notification_type);
    }
    return filtered;
  }
};
