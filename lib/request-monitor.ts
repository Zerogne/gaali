/**
 * Request monitoring utilities
 * Captures detailed information about incoming requests for debugging
 */

import { getDatabase } from "@/lib/db/client"
import { getClientIP } from "./rateLimit"

export interface RequestMetadata {
  method: string
  url: string
  pathname: string
  queryParams: Record<string, string | null>
  headers: Record<string, string>
  body?: any
  contentType?: string
  userAgent?: string
  ipAddress?: string
  timestamp: Date
  responseStatus?: number
  responseTime?: number
  error?: string
}

/**
 * Capture and store request metadata for analysis
 */
export async function captureRequestMetadata(
  request: Request,
  responseStatus: number,
  responseTime: number,
  body?: any,
  error?: string
): Promise<void> {
  try {
    const url = new URL(request.url)
    const headers: Record<string, string> = {}
    
    // Capture all headers
    request.headers.forEach((value, key) => {
      headers[key] = value
    })

    const metadata: RequestMetadata = {
      method: request.method,
      url: request.url,
      pathname: url.pathname,
      queryParams: Object.fromEntries(
        Array.from(url.searchParams.entries()).map(([key, value]) => [key, value])
      ),
      headers,
      body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
      contentType: request.headers.get("content-type") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
      ipAddress: getClientIP(request),
      timestamp: new Date(),
      responseStatus,
      responseTime,
      error,
    }

    // Store in database
    const db = await getDatabase()
    const collection = db.collection("request_logs")
    
    await collection.insertOne(metadata)
    
    // Keep only last 1000 requests (cleanup old ones)
    const count = await collection.countDocuments()
    if (count > 1000) {
      const toDelete = count - 1000
      const oldest = await collection
        .find({})
        .sort({ timestamp: 1 })
        .limit(toDelete)
        .toArray()
      
      if (oldest.length > 0) {
        await collection.deleteMany({
          _id: { $in: oldest.map(doc => doc._id) }
        })
      }
    }
  } catch (error) {
    // Don't fail the request if logging fails
    console.error("Failed to capture request metadata:", error)
  }
}

/**
 * Get recent request logs
 */
export async function getRequestLogs(limit: number = 50): Promise<RequestMetadata[]> {
  const db = await getDatabase()
  const collection = db.collection("request_logs")
  
  const logs = await collection
    .find({})
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray()
  
  return logs.map(log => ({
    method: log.method,
    url: log.url,
    pathname: log.pathname,
    queryParams: log.queryParams || {},
    headers: log.headers || {},
    body: log.body,
    contentType: log.contentType,
    userAgent: log.userAgent,
    ipAddress: log.ipAddress,
    timestamp: log.timestamp,
    responseStatus: log.responseStatus,
    responseTime: log.responseTime,
    error: log.error,
  }))
}

/**
 * Get request logs filtered by pathname
 */
export async function getRequestLogsByPath(
  pathname: string,
  limit: number = 50
): Promise<RequestMetadata[]> {
  const db = await getDatabase()
  const collection = db.collection("request_logs")
  
  const logs = await collection
    .find({ pathname })
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray()
  
  return logs.map(log => ({
    method: log.method,
    url: log.url,
    pathname: log.pathname,
    queryParams: log.queryParams || {},
    headers: log.headers || {},
    body: log.body,
    contentType: log.contentType,
    userAgent: log.userAgent,
    ipAddress: log.ipAddress,
    timestamp: log.timestamp,
    responseStatus: log.responseStatus,
    responseTime: log.responseTime,
    error: log.error,
  }))
}

