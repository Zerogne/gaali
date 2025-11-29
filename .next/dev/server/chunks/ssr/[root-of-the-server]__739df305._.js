module.exports = [
"[externals]/mongodb [external] (mongodb, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("mongodb", () => require("mongodb"));

module.exports = mod;
}),
"[project]/lib/db/client.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/lib/db/companyDb.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/client.ts [app-rsc] (ecmascript)");
;
async function getCompanyCollection(companyId, collectionName) {
    if (!companyId || !collectionName) {
        throw new Error("companyId and collectionName are required");
    }
    const db = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDatabase"])();
    const collectionNameWithPrefix = `company_${companyId}_${collectionName}`;
    return db.collection(collectionNameWithPrefix);
}
async function getCompanyDB(companyId) {
    if (!companyId) {
        throw new Error("companyId is required");
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDatabase"])();
}
async function getCompaniesCollection() {
    const db = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDatabase"])();
    return db.collection("companies");
}
async function ensureCompanyCollections(companyId) {
    const collections = [
        "logs",
        "workers",
        "sessions",
        "settings",
        "products"
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
        }
    }
}
}),
"[project]/lib/auth/session.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
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
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
    const companyId = cookieStore.get(COMPANY_ID_COOKIE)?.value;
    const expiresAt = cookieStore.get(SESSION_EXPIRES_COOKIE)?.value;
    if (!companyId) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/login");
    }
    // Check expiration
    if (expiresAt) {
        const expires = parseInt(expiresAt, 10);
        if (isNaN(expires) || expires < Date.now()) {
            // Session expired, clear and redirect
            await clearSession();
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/login");
        }
    }
    return companyId;
}
async function getSession() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
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
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
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
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
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
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
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
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
    const companyId = cookieStore.get(COMPANY_ID_COOKIE)?.value;
    const workerId = cookieStore.get(WORKER_ID_COOKIE)?.value;
    if (companyId && workerId) {
        setSessionExpiration(cookieStore);
    }
}
async function clearSession() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
    cookieStore.delete(COMPANY_ID_COOKIE);
    cookieStore.delete(WORKER_ID_COOKIE);
    cookieStore.delete(SESSION_EXPIRES_COOKIE);
}
async function isAuthenticated() {
    const session = await getSession();
    return session !== null;
}
async function isCompanyAuthenticated() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
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
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
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
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getActiveCompany, "0073376b4ecb99a15d5ff9cefb5c313ab32d6bbb74", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getSession, "00d0b42c47ec01bb90079d5ec43c87b2e0447eb268", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(setSession, "6073ef65211c37ee1746a85099ae8d1a41d91f8c10", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(setCompanySession, "406e17377dbc711b2ee16c771ad21c829f397f3414", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(setWorkerInSession, "40ed1b7192bbf11e4c2c8bda28e0f523cad83d148f", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(refreshSession, "004a34268f0a3cfb6362c218b6e35da0f9f31855cc", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(clearSession, "00fbbfe765f52a63405acb369adb3b5da9afdf9aa7", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(isAuthenticated, "000715302b051ea7b5623840b0db766a97d00b9db2", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(isCompanyAuthenticated, "007e2a5a7b238b4a0661bf17c85e110a65522633b7", null);
}),
"[project]/lib/api.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"003823d3910066eeba55100ec7665dcabbb8bf509e":"getTruckLogs","40a2ead62e15f1c40ce6d586420a2c191a6a5596a9":"sendTruckLogToCustoms","40d4e21626266eb13b2afb47fa55c2fcffae3980c2":"saveTruckLog","40e435e9820837cca454ab0e5b488a759d66783155":"getTruckLog"},"",""] */ __turbopack_context__.s([
    "getTruckLog",
    ()=>getTruckLog,
    "getTruckLogs",
    ()=>getTruckLogs,
    "saveTruckLog",
    ()=>saveTruckLog,
    "sendTruckLogToCustoms",
    ()=>sendTruckLogToCustoms
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/companyDb.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/session.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
async function saveTruckLog(log) {
    // Get active company from session
    const companyId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getActiveCompany"])();
    // Get company-scoped logs collection
    const logsCollection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCompanyCollection"])(companyId, "logs");
    // Create log document
    const logDoc = {
        ...log,
        id: `truck-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        sentToCustoms: false
    };
    // Insert into company's collection
    await logsCollection.insertOne(logDoc);
    return logDoc;
}
async function sendTruckLogToCustoms(logId) {
    try {
        // Get active company from session
        const companyId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getActiveCompany"])();
        // Get company-scoped logs collection
        const logsCollection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCompanyCollection"])(companyId, "logs");
        // Find the log in company's collection
        const log = await logsCollection.findOne({
            id: logId
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
            id: logId
        }, {
            $set: {
                sentToCustoms: true
            }
        });
        return {
            success: true
        };
    } catch (error) {
        console.error("Error sending to customs:", error);
        return {
            success: false,
            error: "Failed to send to customs"
        };
    }
}
async function getTruckLogs() {
    const companyId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getActiveCompany"])();
    const logsCollection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCompanyCollection"])(companyId, "logs");
    // Fetch all logs, sorted by creation date (newest first)
    const logs = await logsCollection.find({}).sort({
        createdAt: -1
    }).toArray();
    // Serialize MongoDB documents to plain objects
    return logs.map((doc)=>{
        const { _id, createdAt, ...log } = doc;
        return {
            ...log,
            createdAt: typeof createdAt === 'string' ? createdAt : createdAt instanceof Date ? createdAt.toISOString() : new Date(createdAt).toISOString()
        };
    });
}
async function getTruckLog(logId) {
    const companyId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getActiveCompany"])();
    const logsCollection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCompanyCollection"])(companyId, "logs");
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
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    saveTruckLog,
    sendTruckLogToCustoms,
    getTruckLogs,
    getTruckLog
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(saveTruckLog, "40d4e21626266eb13b2afb47fa55c2fcffae3980c2", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(sendTruckLogToCustoms, "40a2ead62e15f1c40ce6d586420a2c191a6a5596a9", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getTruckLogs, "003823d3910066eeba55100ec7665dcabbb8bf509e", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getTruckLog, "40e435e9820837cca454ab0e5b488a759d66783155", null);
}),
"[project]/lib/auth/authServer.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"00db69d86cc3b8562947f5f5012a7dc7936b0621ed":"logout","600171263a30e7f65dafe2a32d7b3a8fdc60ea9bd5":"selectWorker","60e48f651e5ebbd9864e4b8a06cf8fa97d8e2239ad":"loginCompany","706eaece57029aad276a30b25bf6e85547c101354f":"loginWorker"},"",""] */ __turbopack_context__.s([
    "loginCompany",
    ()=>loginCompany,
    "loginWorker",
    ()=>loginWorker,
    "logout",
    ()=>logout,
    "selectWorker",
    ()=>selectWorker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/companyDb.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/session.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
;
async function loginCompany(companyId, password) {
    try {
        // Get company from shared companies collection
        const companiesCollection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCompaniesCollection"])();
        const company = await companiesCollection.findOne({
            companyId
        });
        // Verify company exists
        if (!company) {
            return {
                success: false,
                error: "Company not found"
            };
        }
        // Verify password
        // In production, passwords should be hashed (e.g., using bcrypt)
        const correctPassword = company.password;
        if (!correctPassword || correctPassword !== password) {
            return {
                success: false,
                error: "Incorrect password"
            };
        }
        // Set session with companyId only (partial session)
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setCompanySession"])(companyId);
        return {
            success: true
        };
    } catch (error) {
        console.error("Company login error:", error);
        return {
            success: false,
            error: "An error occurred during login"
        };
    }
}
async function selectWorker(companyId, workerId) {
    try {
        // Get company-scoped workers collection
        const workersCollection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCompanyCollection"])(companyId, "workers");
        // Find the worker in the company's collection
        const worker = await workersCollection.findOne({
            id: workerId
        });
        // Verify worker exists and belongs to the company
        if (!worker) {
            return {
                success: false,
                error: "Worker not found"
            };
        }
        if (worker.companyId !== companyId) {
            return {
                success: false,
                error: "Worker does not belong to this company"
            };
        }
        // Set workerId in existing company session
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setWorkerInSession"])(workerId);
        // Record login session in company's sessions collection
        const sessionsCollection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCompanyCollection"])(companyId, "sessions");
        await sessionsCollection.insertOne({
            workerId,
            companyId,
            loginAt: new Date(),
            createdAt: new Date()
        });
        // Redirect to dashboard (this will throw, which is expected in Next.js)
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/");
    } catch (error) {
        // If it's a redirect error, let it propagate
        if (error && typeof error === "object" && "digest" in error) {
            throw error;
        }
        console.error("Worker selection error:", error);
        return {
            success: false,
            error: "An error occurred during worker selection"
        };
    }
}
async function loginWorker(companyId, workerId, password) {
    try {
        // Get company-scoped workers collection
        const workersCollection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCompanyCollection"])(companyId, "workers");
        // Find the worker in the company's collection
        const worker = await workersCollection.findOne({
            id: workerId
        });
        // Verify worker exists and belongs to the company
        if (!worker) {
            return {
                success: false,
                error: "Worker not found"
            };
        }
        if (worker.companyId !== companyId) {
            return {
                success: false,
                error: "Worker does not belong to this company"
            };
        }
        // Verify password
        // In production, passwords should be hashed (e.g., using bcrypt)
        const correctPassword = worker.password;
        if (!correctPassword || correctPassword !== password) {
            return {
                success: false,
                error: "Incorrect password"
            };
        }
        // Set session with companyId and workerId
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setSession"])(companyId, workerId);
        // Record login session in company's sessions collection
        const sessionsCollection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCompanyCollection"])(companyId, "sessions");
        await sessionsCollection.insertOne({
            workerId,
            companyId,
            loginAt: new Date(),
            createdAt: new Date()
        });
        // Redirect to dashboard (this will throw, which is expected in Next.js)
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/");
    } catch (error) {
        // If it's a redirect error, let it propagate
        if (error && typeof error === "object" && "digest" in error) {
            throw error;
        }
        console.error("Login error:", error);
        return {
            success: false,
            error: "An error occurred during login"
        };
    }
}
async function logout() {
    const { clearSession } = await __turbopack_context__.A("[project]/lib/auth/session.ts [app-rsc] (ecmascript, async loader)");
    // Clear session cookies
    await clearSession();
    // In a real app, you would also:
    // 1. Invalidate session in database
    // 2. Log logout event
    // Redirect to login page
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/login");
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    loginCompany,
    selectWorker,
    loginWorker,
    logout
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(loginCompany, "60e48f651e5ebbd9864e4b8a06cf8fa97d8e2239ad", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(selectWorker, "600171263a30e7f65dafe2a32d7b3a8fdc60ea9bd5", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(loginWorker, "706eaece57029aad276a30b25bf6e85547c101354f", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(logout, "00db69d86cc3b8562947f5f5012a7dc7936b0621ed", null);
}),
"[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => \"[project]/lib/api.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/lib/auth/authServer.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$authServer$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/authServer.ts [app-rsc] (ecmascript)");
;
;
;
;
}),
"[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => \"[project]/lib/api.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/lib/auth/authServer.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "003823d3910066eeba55100ec7665dcabbb8bf509e",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getTruckLogs"],
    "00db69d86cc3b8562947f5f5012a7dc7936b0621ed",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$authServer$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["logout"],
    "40a2ead62e15f1c40ce6d586420a2c191a6a5596a9",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sendTruckLogToCustoms"],
    "40d4e21626266eb13b2afb47fa55c2fcffae3980c2",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["saveTruckLog"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$lib$2f$auth$2f$authServer$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => "[project]/lib/api.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/lib/auth/authServer.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$authServer$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/authServer.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__739df305._.js.map