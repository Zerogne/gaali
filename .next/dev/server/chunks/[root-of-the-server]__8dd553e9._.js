module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/mongodb [external] (mongodb, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("mongodb", () => require("mongodb"));

module.exports = mod;
}),
"[project]/lib/db/client.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "getDatabase",
    ()=>getDatabase
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongodb__$5b$external$5d$__$28$mongodb$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/mongodb [external] (mongodb, cjs)");
;
if (!process.env.MONGODB_URI) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}
const uri = process.env.MONGODB_URI;
const options = {};
let client;
let clientPromise;
if ("TURBOPACK compile-time truthy", 1) {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    let globalWithMongo = /*TURBOPACK member replacement*/ __turbopack_context__.g;
    if (!globalWithMongo._mongoClientPromise) {
        client = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongodb__$5b$external$5d$__$28$mongodb$2c$__cjs$29$__["MongoClient"](uri, options);
        globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
} else //TURBOPACK unreachable
;
const __TURBOPACK__default__export__ = clientPromise;
async function getDatabase() {
    const client = await clientPromise;
    return client.db(process.env.MONGODB_DB_NAME || "truck-weighing-dashboard");
}
}),
"[project]/lib/db/companyDb.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ensureCompanyCollections",
    ()=>ensureCompanyCollections,
    "getCompaniesCollection",
    ()=>getCompaniesCollection,
    "getCompanyCollection",
    ()=>getCompanyCollection,
    "getCompanyDB",
    ()=>getCompanyDB
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/client.ts [app-route] (ecmascript)");
;
async function getCompanyCollection(companyId, collectionName) {
    if (!companyId || !collectionName) {
        throw new Error("companyId and collectionName are required");
    }
    const db = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDatabase"])();
    const collectionNameWithPrefix = `company_${companyId}_${collectionName}`;
    return db.collection(collectionNameWithPrefix);
}
async function getCompanyDB(companyId) {
    if (!companyId) {
        throw new Error("companyId is required");
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDatabase"])();
}
async function getCompaniesCollection() {
    const db = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDatabase"])();
    return db.collection("companies");
}
async function ensureCompanyCollections(companyId) {
    const collections = [
        "logs",
        "workers",
        "sessions",
        "settings",
        "products",
        "truck_sessions"
    ];
    for (const collectionName of collections){
        const collection = await getCompanyCollection(companyId, collectionName);
        // Create indexes for common queries
        if (collectionName === "logs") {
            await collection.createIndex({
                createdAt: -1
            });
            await collection.createIndex({
                direction: 1
            });
            await collection.createIndex({
                sentToCustoms: 1
            });
            await collection.createIndex({
                plate: 1
            });
        } else if (collectionName === "workers") {
            await collection.createIndex({
                companyId: 1
            });
            await collection.createIndex({
                id: 1
            }, {
                unique: true
            });
        } else if (collectionName === "sessions") {
            await collection.createIndex({
                workerId: 1
            });
            await collection.createIndex({
                createdAt: -1
            });
        } else if (collectionName === "products") {
            await collection.createIndex({
                value: 1
            }, {
                unique: true
            });
            await collection.createIndex({
                isCustom: 1
            });
        } else if (collectionName === "truck_sessions") {
            await collection.createIndex({
                createdAt: -1
            });
            await collection.createIndex({
                direction: 1
            });
            await collection.createIndex({
                plateNumber: 1
            });
            await collection.createIndex({
                inSessionId: 1
            });
            await collection.createIndex({
                companyId: 1
            });
        }
    }
}
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/auth/session.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"000715302b051ea7b5623840b0db766a97d00b9db2":"isAuthenticated","004a34268f0a3cfb6362c218b6e35da0f9f31855cc":"refreshSession","0073376b4ecb99a15d5ff9cefb5c313ab32d6bbb74":"getActiveCompany","007e2a5a7b238b4a0661bf17c85e110a65522633b7":"isCompanyAuthenticated","00d0b42c47ec01bb90079d5ec43c87b2e0447eb268":"getSession","00fbbfe765f52a63405acb369adb3b5da9afdf9aa7":"clearSession","406e17377dbc711b2ee16c771ad21c829f397f3414":"setCompanySession","40ed1b7192bbf11e4c2c8bda28e0f523cad83d148f":"setWorkerInSession","6073ef65211c37ee1746a85099ae8d1a41d91f8c10":"setSession"},"",""] */ __turbopack_context__.s([
    "clearSession",
    ()=>clearSession,
    "getActiveCompany",
    ()=>getActiveCompany,
    "getSession",
    ()=>getSession,
    "isAuthenticated",
    ()=>isAuthenticated,
    "isCompanyAuthenticated",
    ()=>isCompanyAuthenticated,
    "refreshSession",
    ()=>refreshSession,
    "setCompanySession",
    ()=>setCompanySession,
    "setSession",
    ()=>setSession,
    "setWorkerInSession",
    ()=>setWorkerInSession
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-route] (ecmascript)");
;
;
;
const COMPANY_ID_COOKIE = "company-id";
const WORKER_ID_COOKIE = "worker-id";
const SESSION_EXPIRES_COOKIE = "session-expires";
// Session duration: 7 days (in seconds)
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
// Check if cookies should be secure (production or forced)
const isSecure = ("TURBOPACK compile-time value", "development") === "production" || process.env.FORCE_SECURE_COOKIES === "true";
async function getActiveCompany() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    const companyId = cookieStore.get(COMPANY_ID_COOKIE)?.value;
    const expiresAt = cookieStore.get(SESSION_EXPIRES_COOKIE)?.value;
    if (!companyId) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redirect"])("/login");
    }
    // Check expiration
    if (expiresAt) {
        const expires = parseInt(expiresAt, 10);
        if (isNaN(expires) || expires < Date.now()) {
            // Session expired, clear and redirect
            await clearSession();
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redirect"])("/login");
        }
    }
    return companyId;
}
async function getSession() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    const companyId = cookieStore.get(COMPANY_ID_COOKIE)?.value;
    const workerId = cookieStore.get(WORKER_ID_COOKIE)?.value;
    const expiresAt = cookieStore.get(SESSION_EXPIRES_COOKIE)?.value;
    if (!companyId || !workerId) {
        return null;
    }
    // Check expiration
    if (expiresAt) {
        const expires = parseInt(expiresAt, 10);
        if (isNaN(expires) || expires < Date.now()) {
            // Session expired
            await clearSession();
            return null;
        }
    }
    return {
        companyId,
        workerId,
        expiresAt: expiresAt ? parseInt(expiresAt, 10) : Date.now() + SESSION_MAX_AGE * 1000
    };
}
/**
 * Set session expiration timestamp
 */ function setSessionExpiration(cookieStore) {
    const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
    cookieStore.set(SESSION_EXPIRES_COOKIE, expiresAt.toString(), {
        httpOnly: true,
        secure: isSecure,
        sameSite: "lax",
        maxAge: SESSION_MAX_AGE,
        path: "/"
    });
}
async function setSession(companyId, workerId) {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    // Validate inputs
    if (!companyId || !workerId) {
        throw new Error("Company ID and Worker ID are required");
    }
    // Set cookies with httpOnly for security
    cookieStore.set(COMPANY_ID_COOKIE, companyId, {
        httpOnly: true,
        secure: isSecure,
        sameSite: "lax",
        maxAge: SESSION_MAX_AGE,
        path: "/"
    });
    cookieStore.set(WORKER_ID_COOKIE, workerId, {
        httpOnly: true,
        secure: isSecure,
        sameSite: "lax",
        maxAge: SESSION_MAX_AGE,
        path: "/"
    });
    setSessionExpiration(cookieStore);
}
async function setCompanySession(companyId) {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    if (!companyId) {
        throw new Error("Company ID is required");
    }
    cookieStore.set(COMPANY_ID_COOKIE, companyId, {
        httpOnly: true,
        secure: isSecure,
        sameSite: "lax",
        maxAge: SESSION_MAX_AGE,
        path: "/"
    });
    setSessionExpiration(cookieStore);
}
async function setWorkerInSession(workerId) {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    if (!workerId) {
        throw new Error("Worker ID is required");
    }
    // Verify company session exists
    const companyId = cookieStore.get(COMPANY_ID_COOKIE)?.value;
    if (!companyId) {
        throw new Error("Company session not found");
    }
    cookieStore.set(WORKER_ID_COOKIE, workerId, {
        httpOnly: true,
        secure: isSecure,
        sameSite: "lax",
        maxAge: SESSION_MAX_AGE,
        path: "/"
    });
    setSessionExpiration(cookieStore);
}
async function refreshSession() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    const companyId = cookieStore.get(COMPANY_ID_COOKIE)?.value;
    const workerId = cookieStore.get(WORKER_ID_COOKIE)?.value;
    if (companyId && workerId) {
        setSessionExpiration(cookieStore);
    }
}
async function clearSession() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    cookieStore.delete(COMPANY_ID_COOKIE);
    cookieStore.delete(WORKER_ID_COOKIE);
    cookieStore.delete(SESSION_EXPIRES_COOKIE);
}
async function isAuthenticated() {
    const session = await getSession();
    return session !== null;
}
async function isCompanyAuthenticated() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    const companyId = cookieStore.get(COMPANY_ID_COOKIE)?.value;
    const expiresAt = cookieStore.get(SESSION_EXPIRES_COOKIE)?.value;
    if (!companyId) {
        return false;
    }
    // Check expiration
    if (expiresAt) {
        const expires = parseInt(expiresAt, 10);
        if (isNaN(expires) || expires < Date.now()) {
            return false;
        }
    }
    return true;
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getActiveCompany,
    getSession,
    setSession,
    setCompanySession,
    setWorkerInSession,
    refreshSession,
    clearSession,
    isAuthenticated,
    isCompanyAuthenticated
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(getActiveCompany, "0073376b4ecb99a15d5ff9cefb5c313ab32d6bbb74", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(getSession, "00d0b42c47ec01bb90079d5ec43c87b2e0447eb268", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(setSession, "6073ef65211c37ee1746a85099ae8d1a41d91f8c10", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(setCompanySession, "406e17377dbc711b2ee16c771ad21c829f397f3414", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(setWorkerInSession, "40ed1b7192bbf11e4c2c8bda28e0f523cad83d148f", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(refreshSession, "004a34268f0a3cfb6362c218b6e35da0f9f31855cc", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(clearSession, "00fbbfe765f52a63405acb369adb3b5da9afdf9aa7", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(isAuthenticated, "000715302b051ea7b5623840b0db766a97d00b9db2", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(isCompanyAuthenticated, "007e2a5a7b238b4a0661bf17c85e110a65522633b7", null);
}),
"[project]/lib/errors.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Centralized error handling utilities
 * Provides consistent error types and handling across the application
 */ __turbopack_context__.s([
    "AppError",
    ()=>AppError,
    "AuthenticationError",
    ()=>AuthenticationError,
    "AuthorizationError",
    ()=>AuthorizationError,
    "NotFoundError",
    ()=>NotFoundError,
    "RateLimitError",
    ()=>RateLimitError,
    "ValidationError",
    ()=>ValidationError,
    "errorToResponse",
    ()=>errorToResponse,
    "handleError",
    ()=>handleError
]);
class AppError extends Error {
    code;
    statusCode;
    isOperational;
    constructor(message, code, statusCode = 500, isOperational = true){
        super(message), this.code = code, this.statusCode = statusCode, this.isOperational = isOperational;
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}
class ValidationError extends AppError {
    fields;
    constructor(message, fields){
        super(message, 'VALIDATION_ERROR', 400, true), this.fields = fields;
        this.name = 'ValidationError';
    }
}
class AuthenticationError extends AppError {
    constructor(message = 'Authentication required'){
        super(message, 'AUTHENTICATION_ERROR', 401, true);
        this.name = 'AuthenticationError';
    }
}
class AuthorizationError extends AppError {
    constructor(message = 'Insufficient permissions'){
        super(message, 'AUTHORIZATION_ERROR', 403, true);
        this.name = 'AuthorizationError';
    }
}
class NotFoundError extends AppError {
    constructor(message = 'Resource not found'){
        super(message, 'NOT_FOUND', 404, true);
        this.name = 'NotFoundError';
    }
}
class RateLimitError extends AppError {
    retryAfter;
    constructor(message = 'Too many requests', retryAfter){
        super(message, 'RATE_LIMIT_ERROR', 429, true), this.retryAfter = retryAfter;
        this.name = 'RateLimitError';
    }
}
function handleError(error) {
    // Known operational errors
    if (error instanceof AppError) {
        return {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode
        };
    }
    // Validation errors from Zod
    if (error && typeof error === 'object' && 'issues' in error) {
        const zodError = error;
        const messages = zodError.issues.map((issue)=>issue.message).join(', ');
        return {
            message: `Validation failed: ${messages}`,
            code: 'VALIDATION_ERROR',
            statusCode: 400
        };
    }
    // Standard Error objects
    if (error instanceof Error) {
        // Log full error in development, but don't expose to user
        if ("TURBOPACK compile-time truthy", 1) {
            console.error('Error details:', error);
        }
        return {
            message: ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : error.message,
            code: 'INTERNAL_ERROR',
            statusCode: 500
        };
    }
    // Unknown error types
    console.error('Unknown error type:', error);
    return {
        message: ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : String(error),
        code: 'UNKNOWN_ERROR',
        statusCode: 500
    };
}
function errorToResponse(error) {
    const handled = handleError(error);
    return {
        error: handled.message,
        code: handled.code,
        ...("TURBOPACK compile-time value", "development") === 'development' && error instanceof Error ? {
            stack: error.stack
        } : {}
    };
}
}),
"[project]/lib/truckSessions.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"400740acc4b340c676c4aa8036eb239c30bb4bfa4b":"getTruckSession","4036f44439cc527d62723c880cc2b6fa4829d419b3":"saveTruckSession","40aa83eacb2dad8a6ac702bd3bc2186f2ebb5bc585":"getTruckSessions","40f65d32f0debd8f4fe54ad3c7e812a01722ecd870":"deleteTruckSession","40fcdbb621a7a2c8f9e602dd12cbe840f4a4037b3e":"findLatestInSession","606d97980abbe3f144e27f37fab40b96b9a5263584":"updateTruckSession"},"",""] */ __turbopack_context__.s([
    "deleteTruckSession",
    ()=>deleteTruckSession,
    "findLatestInSession",
    ()=>findLatestInSession,
    "getTruckSession",
    ()=>getTruckSession,
    "getTruckSessions",
    ()=>getTruckSessions,
    "saveTruckSession",
    ()=>saveTruckSession,
    "updateTruckSession",
    ()=>updateTruckSession
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/companyDb.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/session.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/errors.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-route] (ecmascript)");
;
;
;
;
;
// Validation schema for truck session
const truckSessionSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    direction: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "IN",
        "OUT"
    ]),
    plateNumber: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "Plate number is required"),
    driverName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    product: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    transporterCompany: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    inSessionId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    grossWeightKg: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().positive("Gross weight must be positive"),
    netWeightKg: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().positive().optional(),
    inTime: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    outTime: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    notes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
});
async function saveTruckSession(sessionData) {
    try {
        // Validate input
        const validation = truckSessionSchema.safeParse(sessionData);
        if (!validation.success) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ValidationError"]("Invalid truck session data", validation.error.issues.reduce((acc, issue)=>{
                const path = issue.path.join(".");
                acc[path] = issue.message;
                return acc;
            }, {}));
        }
        // Get active company from session
        const companyId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getActiveCompany"])();
        // Get company-scoped sessions collection
        const sessionsCollection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCompanyCollection"])(companyId, "truck_sessions");
        // Create session document
        const now = new Date();
        const sessionDoc = {
            ...validation.data,
            id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            companyId,
            createdAt: now,
            updatedAt: now
        };
        // Insert into company's collection
        await sessionsCollection.insertOne(sessionDoc);
        // Serialize MongoDB document to plain object
        const serializedSession = {
            id: sessionDoc.id,
            companyId: sessionDoc.companyId,
            direction: sessionDoc.direction,
            plateNumber: sessionDoc.plateNumber,
            driverName: sessionDoc.driverName,
            product: sessionDoc.product,
            transporterCompany: sessionDoc.transporterCompany,
            inSessionId: sessionDoc.inSessionId,
            grossWeightKg: sessionDoc.grossWeightKg,
            netWeightKg: sessionDoc.netWeightKg,
            inTime: sessionDoc.inTime,
            outTime: sessionDoc.outTime,
            notes: sessionDoc.notes,
            createdAt: sessionDoc.createdAt,
            updatedAt: sessionDoc.updatedAt
        };
        return serializedSession;
    } catch (error) {
        const handled = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleError"])(error);
        throw new Error(handled.message);
    }
}
async function getTruckSessions(options) {
    try {
        const companyId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getActiveCompany"])();
        const sessionsCollection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCompanyCollection"])(companyId, "truck_sessions");
        // Build query filter
        const filter = {};
        if (options?.direction) {
            filter.direction = options.direction;
        }
        if (options?.plateNumber) {
            filter.plateNumber = {
                $regex: options.plateNumber,
                $options: "i"
            };
        }
        // Date range filter
        if (options?.startDate || options?.endDate) {
            filter.createdAt = {};
            if (options.startDate) {
                const start = options.startDate instanceof Date ? options.startDate : new Date(options.startDate);
                filter.createdAt.$gte = start;
            }
            if (options.endDate) {
                const end = options.endDate instanceof Date ? options.endDate : new Date(options.endDate);
                // Set to end of day
                end.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = end;
            }
        }
        // Pagination
        const page = Math.max(1, options?.page || 1);
        const limit = Math.min(100, Math.max(1, options?.limit || 50));
        const skip = (page - 1) * limit;
        // Get total count
        const total = await sessionsCollection.countDocuments(filter);
        // Fetch sessions with pagination, sorted by creation date (newest first)
        const sessions = await sessionsCollection.find(filter).sort({
            createdAt: -1
        }).skip(skip).limit(limit).toArray();
        // Serialize MongoDB documents to plain objects
        const serializedSessions = sessions.map((doc)=>{
            const { _id, ...session } = doc;
            return {
                ...session,
                createdAt: session.createdAt instanceof Date ? session.createdAt : typeof session.createdAt === 'string' ? new Date(session.createdAt) : new Date(session.createdAt),
                updatedAt: session.updatedAt instanceof Date ? session.updatedAt : typeof session.updatedAt === 'string' ? new Date(session.updatedAt) : new Date(session.updatedAt)
            };
        });
        return {
            sessions: serializedSessions,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    } catch (error) {
        const handled = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleError"])(error);
        throw new Error(handled.message);
    }
}
async function getTruckSession(sessionId) {
    try {
        const companyId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getActiveCompany"])();
        const sessionsCollection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCompanyCollection"])(companyId, "truck_sessions");
        const session = await sessionsCollection.findOne({
            id: sessionId
        });
        if (!session) return null;
        // Serialize MongoDB document to plain object
        const { _id, ...sessionData } = session;
        return {
            ...sessionData,
            createdAt: sessionData.createdAt instanceof Date ? sessionData.createdAt : new Date(sessionData.createdAt),
            updatedAt: sessionData.updatedAt instanceof Date ? sessionData.updatedAt : new Date(sessionData.updatedAt)
        };
    } catch (error) {
        const handled = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleError"])(error);
        throw new Error(handled.message);
    }
}
async function findLatestInSession(plateNumber) {
    try {
        const companyId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getActiveCompany"])();
        const sessionsCollection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCompanyCollection"])(companyId, "truck_sessions");
        const inSession = await sessionsCollection.findOne({
            direction: "IN",
            plateNumber: plateNumber.trim().toUpperCase(),
            grossWeightKg: {
                $gt: 0
            }
        }, {
            sort: {
                createdAt: -1
            }
        });
        if (!inSession) return null;
        // Serialize MongoDB document to plain object
        const { _id, ...sessionData } = inSession;
        return {
            ...sessionData,
            createdAt: sessionData.createdAt instanceof Date ? sessionData.createdAt : new Date(sessionData.createdAt),
            updatedAt: sessionData.updatedAt instanceof Date ? sessionData.updatedAt : new Date(sessionData.updatedAt)
        };
    } catch (error) {
        const handled = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleError"])(error);
        throw new Error(handled.message);
    }
}
async function updateTruckSession(sessionId, updates) {
    try {
        const companyId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getActiveCompany"])();
        const sessionsCollection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCompanyCollection"])(companyId, "truck_sessions");
        const existingSession = await sessionsCollection.findOne({
            id: sessionId
        });
        if (!existingSession) {
            return null;
        }
        // Validate updates if provided
        if (Object.keys(updates).length > 0) {
            const validation = truckSessionSchema.partial().safeParse(updates);
            if (!validation.success) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ValidationError"]("Invalid update data", validation.error.issues.reduce((acc, issue)=>{
                    const path = issue.path.join(".");
                    acc[path] = issue.message;
                    return acc;
                }, {}));
            }
        }
        // Update the session
        const updateDoc = {
            ...updates,
            updatedAt: new Date()
        };
        await sessionsCollection.updateOne({
            id: sessionId
        }, {
            $set: updateDoc
        });
        // Fetch updated session
        const updatedSession = await sessionsCollection.findOne({
            id: sessionId
        });
        if (!updatedSession) return null;
        // Serialize MongoDB document to plain object
        const { _id, ...sessionData } = updatedSession;
        return {
            ...sessionData,
            createdAt: sessionData.createdAt instanceof Date ? sessionData.createdAt : new Date(sessionData.createdAt),
            updatedAt: sessionData.updatedAt instanceof Date ? sessionData.updatedAt : new Date(sessionData.updatedAt)
        };
    } catch (error) {
        const handled = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleError"])(error);
        throw new Error(handled.message);
    }
}
async function deleteTruckSession(sessionId) {
    try {
        const companyId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getActiveCompany"])();
        const sessionsCollection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCompanyCollection"])(companyId, "truck_sessions");
        const result = await sessionsCollection.deleteOne({
            id: sessionId
        });
        return result.deletedCount > 0;
    } catch (error) {
        const handled = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleError"])(error);
        throw new Error(handled.message);
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    saveTruckSession,
    getTruckSessions,
    getTruckSession,
    findLatestInSession,
    updateTruckSession,
    deleteTruckSession
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(saveTruckSession, "4036f44439cc527d62723c880cc2b6fa4829d419b3", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(getTruckSessions, "40aa83eacb2dad8a6ac702bd3bc2186f2ebb5bc585", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(getTruckSession, "400740acc4b340c676c4aa8036eb239c30bb4bfa4b", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(findLatestInSession, "40fcdbb621a7a2c8f9e602dd12cbe840f4a4037b3e", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(updateTruckSession, "606d97980abbe3f144e27f37fab40b96b9a5263584", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteTruckSession, "40f65d32f0debd8f4fe54ad3c7e812a01722ecd870", null);
}),
"[project]/app/api/truck-sessions/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$truckSessions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/truckSessions.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/errors.ts [app-route] (ecmascript)");
;
;
;
async function POST(request) {
    try {
        const body = await request.json();
        const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$truckSessions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["saveTruckSession"])({
            direction: body.direction,
            plateNumber: body.plateNumber,
            driverName: body.driverName,
            product: body.product,
            transporterCompany: body.transporterCompany,
            inSessionId: body.inSessionId,
            grossWeightKg: body.grossWeightKg,
            netWeightKg: body.netWeightKg,
            inTime: body.inTime,
            outTime: body.outTime,
            notes: body.notes
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            session
        }, {
            status: 201
        });
    } catch (error) {
        console.error("Error creating truck session:", error);
        const errorResponse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["errorToResponse"])(error);
        const statusCode = error instanceof Error && "statusCode" in error ? error.statusCode : 500;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(errorResponse, {
            status: statusCode
        });
    }
}
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const direction = searchParams.get("direction");
        const plateNumber = searchParams.get("plateNumber");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "50", 10);
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$truckSessions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTruckSessions"])({
            direction: direction || undefined,
            plateNumber: plateNumber || undefined,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            page,
            limit
        });
        // Serialize dates to ISO strings for JSON response
        const serializedResult = {
            ...result,
            sessions: result.sessions.map((session)=>({
                    ...session,
                    createdAt: session.createdAt instanceof Date ? session.createdAt.toISOString() : session.createdAt,
                    updatedAt: session.updatedAt instanceof Date ? session.updatedAt.toISOString() : session.updatedAt
                }))
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(serializedResult, {
            status: 200
        });
    } catch (error) {
        console.error("Error getting truck sessions:", error);
        const errorResponse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["errorToResponse"])(error);
        const statusCode = error instanceof Error && "statusCode" in error ? error.statusCode : 500;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(errorResponse, {
            status: statusCode
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__8dd553e9._.js.map