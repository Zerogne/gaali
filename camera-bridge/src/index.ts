/**
 * Camera Bridge Service - Main Entry Point
 * 
 * Starts the HTTP push receiver service that:
 * - Receives HTTP POST requests from the camera
 * - Broadcasts plate events to WebSocket clients
 * - Forwards plates to cloud service (if configured)
 */

import { startHttpPushReceiver } from "./http-push-receiver";

// Start the HTTP push receiver service
startHttpPushReceiver();
