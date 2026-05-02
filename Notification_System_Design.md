# Stage 1: Notification System Design

## Overview
The Campus Notifications Microservice is designed to fetch real-time notifications and present users with a Priority Inbox containing the top 10 most relevant updates.

## Priority Logic
The sorting mechanism determines the "importance" of unread notifications based on two key factors:
1. **Weight (Category):** `Placement` > `Result` > `Event`. We mapped this to numerical values (Placement = 3, Result = 2, Event = 1).
2. **Recency (Timestamp):** When weights are identical, newer notifications take precedence.

### Algorithm
- Fetch all incoming notifications from the API.
- Use a stable sorting approach: compare the mapped weights of two items.
- If the weights differ, the one with the higher weight is placed first.
- If the weights are equal, we parse the `Timestamp` fields into Date objects and compare them to place the more recent notification first.
- The sorted array is then sliced to extract the top `N` notifications efficiently.

## Logging Middleware Integration
To ensure the system is observable:
- A custom, reusable `Log` function was implemented in `logger/index.ts`.
- It captures all critical lifecycle events (e.g., fetching started, successful retrieval, failed requests, and inbox generation).
- Logs are forwarded to the evaluation service via a POST request with the required structure (`stack`, `level`, `package`, `message`).
- The log messages are constrained to 48 characters to conform to the API's requirements.

## Maintenance
As new notifications stream in, the service would typically cache the latest ones or query them dynamically. Sorting an array of a few hundred items is extremely fast (`O(n log n)`). If the volume grows to millions, an efficient priority queue (Min-Heap / Max-Heap) or an ordered database index based on weight and timestamp can be utilized.
