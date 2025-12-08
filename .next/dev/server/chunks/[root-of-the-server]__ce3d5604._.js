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
"[project]/lib/validation.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Zod validation schemas for all API inputs
 * Ensures type safety and prevents injection attacks
 */ __turbopack_context__.s([
    "addProductSchema",
    ()=>addProductSchema,
    "deleteProductSchema",
    ()=>deleteProductSchema,
    "loginCompanySchema",
    ()=>loginCompanySchema,
    "loginWorkerSchema",
    ()=>loginWorkerSchema,
    "paginationSchema",
    ()=>paginationSchema,
    "selectWorkerSchema",
    ()=>selectWorkerSchema,
    "truckLogSchema",
    ()=>truckLogSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
;
const loginCompanySchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    companyId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, 'Company ID is required').max(100, 'Company ID is too long').regex(/^[a-z0-9-]+$/, 'Company ID contains invalid characters'),
    password: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, 'Password is required').max(200, 'Password is too long')
});
const selectWorkerSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    workerId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, 'Worker ID is required').max(100, 'Worker ID is too long').regex(/^[a-z0-9-]+$/, 'Worker ID contains invalid characters')
});
const loginWorkerSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    companyId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, 'Company ID is required').max(100, 'Company ID is too long').regex(/^[a-z0-9-]+$/, 'Company ID contains invalid characters'),
    workerId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, 'Worker ID is required').max(100, 'Worker ID is too long').regex(/^[a-z0-9-]+$/, 'Worker ID contains invalid characters'),
    password: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, 'Password is required').max(200, 'Password is too long')
});
const truckLogSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    direction: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        'IN',
        'OUT'
    ], {
        errorMap: ()=>({
                message: 'Direction must be IN or OUT'
            })
    }),
    plate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, 'Plate number is required').max(20, 'Plate number is too long').regex(/^[А-ЯЁA-Z0-9\s-]+$/i, 'Plate number contains invalid characters'),
    driverId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(100).optional(),
    driverName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, 'Driver name is required').max(200, 'Driver name is too long'),
    cargoType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, 'Cargo type is required').max(100, 'Cargo type is too long'),
    weightKg: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().positive('Weight must be positive').max(1000000, 'Weight is too large').optional(),
    netWeightKg: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().positive('Net weight must be positive').max(1000000, 'Net weight is too large').optional(),
    comments: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(1000, 'Comments are too long').optional(),
    vehicleRegistrationNumber: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(50).optional(),
    vehicleRegistrationYear: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(4).optional(),
    origin: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(200).optional(),
    destination: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(200).optional(),
    senderOrganizationId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(100).optional(),
    senderOrganization: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(200).optional(),
    receiverOrganizationId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(100).optional(),
    receiverOrganization: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(200).optional(),
    transportCompanyId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(100).optional(),
    transportType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        'truck',
        'container',
        'tanker',
        'flatbed',
        'refrigerated',
        'other'
    ]).optional(),
    sealNumber: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(100).optional(),
    hasTrailer: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
    trailerPlate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(20).optional()
});
const addProductSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    label: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, 'Product label is required').max(200, 'Product label is too long').trim()
});
const paginationSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    page: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.number().int().positive().default(1),
    limit: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.number().int().positive().max(100).default(50)
});
const deleteProductSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, 'Product ID is required').max(100, 'Product ID is too long')
});
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
"[project]/lib/api.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"40a2ead62e15f1c40ce6d586420a2c191a6a5596a9":"sendTruckLogToCustoms","40d4e21626266eb13b2afb47fa55c2fcffae3980c2":"saveTruckLog","40e435e9820837cca454ab0e5b488a759d66783155":"getTruckLog","603823d3910066eeba55100ec7665dcabbb8bf509e":"getTruckLogs","6099e8327fe8d2110923a5345f2beb63fba0b3022b":"updateTruckLog"},"",""] */ __turbopack_context__.s([
    "getTruckLog",
    ()=>getTruckLog,
    "getTruckLogs",
    ()=>getTruckLogs,
    "saveTruckLog",
    ()=>saveTruckLog,
    "sendTruckLogToCustoms",
    ()=>sendTruckLogToCustoms,
    "updateTruckLog",
    ()=>updateTruckLog
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/companyDb.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/session.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/validation.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/errors.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-route] (ecmascript)");
;
;
;
;
;
async function saveTruckLog(log) {
    try {
        // Validate input
        const validation = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["truckLogSchema"].safeParse(log);
        if (!validation.success) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ValidationError"]("Invalid truck log data", validation.error.issues.reduce((acc, issue)=>{
                const path = issue.path.join(".");
                acc[path] = issue.message;
                return acc;
            }, {}));
        }
        // Get active company from session
        const companyId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getActiveCompany"])();
        // Get company-scoped logs collection
        const logsCollection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCompanyCollection"])(companyId, "logs");
        // Create log document
        const logDoc = {
            ...validation.data,
            id: `truck-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            sentToCustoms: false
        };
        // Insert into company's collection
        await logsCollection.insertOne(logDoc);
        // Serialize MongoDB document to plain object (remove _id, ensure all values are serializable)
        // Create a clean copy to avoid any MongoDB-specific properties
        const serializedLog = {
            id: logDoc.id,
            direction: logDoc.direction,
            plate: logDoc.plate,
            driverId: logDoc.driverId,
            driverName: logDoc.driverName,
            cargoType: logDoc.cargoType,
            weightKg: logDoc.weightKg,
            netWeightKg: logDoc.netWeightKg,
            comments: logDoc.comments,
            origin: logDoc.origin,
            destination: logDoc.destination,
            senderOrganizationId: logDoc.senderOrganizationId,
            senderOrganization: logDoc.senderOrganization,
            receiverOrganizationId: logDoc.receiverOrganizationId,
            receiverOrganization: logDoc.receiverOrganization,
            transportCompanyId: logDoc.transportCompanyId,
            transportType: logDoc.transportType,
            sealNumber: logDoc.sealNumber,
            hasTrailer: logDoc.hasTrailer,
            trailerPlate: logDoc.trailerPlate,
            createdAt: logDoc.createdAt,
            sentToCustoms: logDoc.sentToCustoms
        };
        return serializedLog;
    } catch (error) {
        const handled = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleError"])(error);
        throw new Error(handled.message);
    }
}
async function sendTruckLogToCustoms(logId) {
    try {
        // Validate logId
        if (!logId || typeof logId !== 'string' || logId.trim().length === 0) {
            return {
                success: false,
                error: "Invalid log ID"
            };
        }
        // Get active company from session
        const companyId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getActiveCompany"])();
        // Get company-scoped logs collection
        const logsCollection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCompanyCollection"])(companyId, "logs");
        // Find the log in company's collection
        const log = await logsCollection.findOne({
            id: logId.trim()
        });
        if (!log) {
            return {
                success: false,
                error: "Log not found"
            };
        }
        // Simulate network delay
        await new Promise((resolve)=>setTimeout(resolve, 1000));
        // Simulate occasional network errors (10% chance)
        if (Math.random() < 0.1) {
            return {
                success: false,
                error: "Network error: Unable to connect to customs system"
            };
        }
        // Update log status in company's collection
        await logsCollection.updateOne({
            id: logId.trim()
        }, {
            $set: {
                sentToCustoms: true
            }
        });
        return {
            success: true
        };
    } catch (error) {
        const handled = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleError"])(error);
        return {
            success: false,
            error: handled.message
        };
    }
}
async function getTruckLogs(page = 1, limit = 50) {
    try {
        const companyId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getActiveCompany"])();
        const logsCollection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCompanyCollection"])(companyId, "logs");
        // Validate pagination params
        const validPage = Math.max(1, Math.floor(page));
        const validLimit = Math.min(100, Math.max(1, Math.floor(limit)));
        const skip = (validPage - 1) * validLimit;
        // Get total count
        const total = await logsCollection.countDocuments({});
        // Fetch logs with pagination, sorted by creation date (newest first)
        const logs = await logsCollection.find({}).sort({
            createdAt: -1
        }).skip(skip).limit(validLimit).toArray();
        // Serialize MongoDB documents to plain objects
        const serializedLogs = logs.map((doc)=>{
            const { _id, createdAt, ...log } = doc;
            return {
                ...log,
                createdAt: typeof createdAt === 'string' ? createdAt : createdAt instanceof Date ? createdAt.toISOString() : new Date(createdAt).toISOString()
            };
        });
        return {
            logs: serializedLogs,
            total,
            page: validPage,
            limit: validLimit,
            totalPages: Math.ceil(total / validLimit)
        };
    } catch (error) {
        const handled = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleError"])(error);
        throw new Error(handled.message);
    }
}
async function getTruckLog(logId) {
    const companyId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getActiveCompany"])();
    const logsCollection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCompanyCollection"])(companyId, "logs");
    const log = await logsCollection.findOne({
        id: logId
    });
    if (!log) return null;
    // Serialize MongoDB document to plain object
    const { _id, createdAt, ...logData } = log;
    return {
        ...logData,
        createdAt: typeof createdAt === 'string' ? createdAt : createdAt instanceof Date ? createdAt.toISOString() : new Date(createdAt).toISOString()
    };
}
async function updateTruckLog(logId, updates) {
    try {
        // Get active company from session
        const companyId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getActiveCompany"])();
        // Get company-scoped logs collection
        const logsCollection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCompanyCollection"])(companyId, "logs");
        // Find the log
        const existingLog = await logsCollection.findOne({
            id: logId
        });
        if (!existingLog) {
            return {
                success: false,
                error: "Log not found"
            };
        }
        // Allow editing logs even if sent to customs (re-edit feature)
        // Validate updates if provided
        if (Object.keys(updates).length > 0) {
            const validation = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["truckLogSchema"].partial().safeParse(updates);
            if (!validation.success) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ValidationError"]("Invalid update data", validation.error.issues.reduce((acc, issue)=>{
                    const path = issue.path.join(".");
                    acc[path] = issue.message;
                    return acc;
                }, {}));
            }
        }
        // Update the log (preserve id, createdAt, sentToCustoms)
        const updatedLog = {
            ...existingLog,
            ...updates,
            id: existingLog.id,
            createdAt: existingLog.createdAt,
            sentToCustoms: existingLog.sentToCustoms,
            updatedAt: new Date().toISOString()
        };
        await logsCollection.updateOne({
            id: logId
        }, {
            $set: updatedLog
        });
        // Fetch the updated document to ensure we have the latest version
        const updatedDoc = await logsCollection.findOne({
            id: logId
        });
        if (!updatedDoc) {
            return {
                success: false,
                error: "Failed to retrieve updated log"
            };
        }
        // Serialize MongoDB document to plain object (remove _id, convert Date objects)
        // Create a plain object copy to avoid any MongoDB-specific properties
        const doc = updatedDoc;
        const serializedLog = {
            id: doc.id,
            direction: doc.direction,
            plate: doc.plate,
            driverName: doc.driverName,
            cargoType: doc.cargoType,
            weightKg: doc.weightKg,
            comments: doc.comments,
            origin: doc.origin,
            destination: doc.destination,
            senderOrganization: doc.senderOrganization,
            receiverOrganization: doc.receiverOrganization,
            sentToCustoms: doc.sentToCustoms,
            createdAt: typeof doc.createdAt === 'string' ? doc.createdAt : doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString()
        };
        return {
            success: true,
            log: serializedLog
        };
    } catch (error) {
        const handled = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleError"])(error);
        return {
            success: false,
            error: handled.message
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    saveTruckLog,
    sendTruckLogToCustoms,
    getTruckLogs,
    getTruckLog,
    updateTruckLog
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(saveTruckLog, "40d4e21626266eb13b2afb47fa55c2fcffae3980c2", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(sendTruckLogToCustoms, "40a2ead62e15f1c40ce6d586420a2c191a6a5596a9", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(getTruckLogs, "603823d3910066eeba55100ec7665dcabbb8bf509e", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(getTruckLog, "40e435e9820837cca454ab0e5b488a759d66783155", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(updateTruckLog, "6099e8327fe8d2110923a5345f2beb63fba0b3022b", null);
}),
"[project]/app/api/logs/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/errors.ts [app-route] (ecmascript)");
;
;
;
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "50", 10);
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTruckLogs"])(page, limit);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(result, {
            status: 200
        });
    } catch (error) {
        console.error("Error getting truck logs:", error);
        const errorResponse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["errorToResponse"])(error);
        const statusCode = error instanceof Error && 'statusCode' in error ? error.statusCode : 500;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(errorResponse, {
            status: statusCode
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ce3d5604._.js.map