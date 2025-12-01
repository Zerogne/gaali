module.exports = [
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
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
"[project]/lib/validation.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/external.js [app-rsc] (ecmascript) <export * as z>");
;
const loginCompanySchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    companyId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, 'Company ID is required').max(100, 'Company ID is too long').regex(/^[a-z0-9-]+$/, 'Company ID contains invalid characters'),
    password: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, 'Password is required').max(200, 'Password is too long')
});
const selectWorkerSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    workerId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, 'Worker ID is required').max(100, 'Worker ID is too long').regex(/^[a-z0-9-]+$/, 'Worker ID contains invalid characters')
});
const loginWorkerSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    companyId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, 'Company ID is required').max(100, 'Company ID is too long').regex(/^[a-z0-9-]+$/, 'Company ID contains invalid characters'),
    workerId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, 'Worker ID is required').max(100, 'Worker ID is too long').regex(/^[a-z0-9-]+$/, 'Worker ID contains invalid characters'),
    password: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, 'Password is required').max(200, 'Password is too long')
});
const truckLogSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    direction: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        'IN',
        'OUT'
    ], {
        errorMap: ()=>({
                message: 'Direction must be IN or OUT'
            })
    }),
    plate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, 'Plate number is required').max(20, 'Plate number is too long').regex(/^[А-ЯЁA-Z0-9\s-]+$/i, 'Plate number contains invalid characters'),
    driverId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(100).optional(),
    driverName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, 'Driver name is required').max(200, 'Driver name is too long'),
    cargoType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, 'Cargo type is required').max(100, 'Cargo type is too long'),
    weightKg: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().positive('Weight must be positive').max(1000000, 'Weight is too large').optional(),
    netWeightKg: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().positive('Net weight must be positive').max(1000000, 'Net weight is too large').optional(),
    comments: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(1000, 'Comments are too long').optional(),
    vehicleRegistrationNumber: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(50).optional(),
    vehicleRegistrationYear: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(4).optional(),
    origin: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(200).optional(),
    destination: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(200).optional(),
    senderOrganizationId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(100).optional(),
    senderOrganization: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(200).optional(),
    receiverOrganizationId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(100).optional(),
    receiverOrganization: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(200).optional(),
    transportCompanyId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(100).optional(),
    transportType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        'truck',
        'container',
        'tanker',
        'flatbed',
        'refrigerated',
        'other'
    ]).optional(),
    sealNumber: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(100).optional(),
    hasTrailer: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
    trailerPlate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(20).optional()
});
const addProductSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    label: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, 'Product label is required').max(200, 'Product label is too long').trim()
});
const paginationSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    page: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.number().int().positive().default(1),
    limit: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.number().int().positive().max(100).default(50)
});
const deleteProductSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, 'Product ID is required').max(100, 'Product ID is too long')
});
}),
"[project]/lib/rateLimit.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * In-memory rate limiting for login endpoints
 * For production, consider upgrading to Redis-based solution (Upstash)
 */ __turbopack_context__.s([
    "getClientIP",
    ()=>getClientIP,
    "rateLimit",
    ()=>rateLimit
]);
// In-memory store (clears on server restart)
// In production, use Redis or similar
const rateLimitStore = new Map();
// Cleanup old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(()=>{
        const now = Date.now();
        for (const [key, entry] of rateLimitStore.entries()){
            if (entry.resetAt < now) {
                rateLimitStore.delete(key);
            }
        }
    }, 5 * 60 * 1000);
}
async function rateLimit(identifier, maxAttempts = 5, windowMs = 15 * 60 * 1000 // 15 minutes
) {
    const now = Date.now();
    const entry = rateLimitStore.get(identifier);
    // No entry or expired
    if (!entry || entry.resetAt < now) {
        const newEntry = {
            count: 1,
            resetAt: now + windowMs
        };
        rateLimitStore.set(identifier, newEntry);
        return {
            success: true,
            limit: maxAttempts,
            remaining: maxAttempts - 1,
            resetAt: newEntry.resetAt
        };
    }
    // Entry exists and not expired
    if (entry.count >= maxAttempts) {
        return {
            success: false,
            limit: maxAttempts,
            remaining: 0,
            resetAt: entry.resetAt
        };
    }
    // Increment count
    entry.count++;
    rateLimitStore.set(identifier, entry);
    return {
        success: true,
        limit: maxAttempts,
        remaining: maxAttempts - entry.count,
        resetAt: entry.resetAt
    };
}
function getClientIP(request) {
    if (!request) return 'unknown';
    // Check various headers (in order of preference)
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
        return realIP;
    }
    return 'unknown';
}
}),
"[project]/lib/errors.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/lib/auth/authServer.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"00db69d86cc3b8562947f5f5012a7dc7936b0621ed":"logout","400171263a30e7f65dafe2a32d7b3a8fdc60ea9bd5":"selectWorker","60e48f651e5ebbd9864e4b8a06cf8fa97d8e2239ad":"loginCompany","706eaece57029aad276a30b25bf6e85547c101354f":"loginWorker"},"",""] */ __turbopack_context__.s([
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/companyDb.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/session.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$validation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/validation.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rateLimit$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/rateLimit.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/errors.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
async function loginCompany(companyId, password) {
    try {
        // Validate input with Zod
        const validation = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$validation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["loginCompanySchema"].safeParse({
            companyId,
            password
        });
        if (!validation.success) {
            return {
                success: false,
                error: "Invalid input. Please check your credentials."
            };
        }
        // Rate limiting - get IP from headers
        const headersList = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["headers"])();
        const forwardedFor = headersList.get('x-forwarded-for');
        const realIP = headersList.get('x-real-ip');
        const clientIP = forwardedFor?.split(',')[0]?.trim() || realIP || 'unknown';
        const rateLimitId = `login:company:${companyId}:${clientIP}`;
        const rateLimitResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rateLimit$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rateLimit"])(rateLimitId, 5, 15 * 60 * 1000) // 5 attempts per 15 minutes
        ;
        if (!rateLimitResult.success) {
            const retryAfter = Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000);
            return {
                success: false,
                error: `Too many login attempts. Please try again in ${retryAfter} seconds.`
            };
        }
        // Get company from shared companies collection
        const companiesCollection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCompaniesCollection"])();
        const company = await companiesCollection.findOne({
            companyId
        });
        // Use generic error message to prevent enumeration
        if (!company) {
            console.error(`Company not found: ${companyId}`);
            return {
                success: false,
                error: "Invalid credentials"
            };
        }
        if (!company.password) {
            console.error(`Company found but no password set: ${companyId}`);
            return {
                success: false,
                error: "Invalid credentials"
            };
        }
        // Verify password with bcrypt
        const isValid = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].compare(password, company.password);
        if (!isValid) {
            console.error(`Password mismatch for company: ${companyId}`);
            return {
                success: false,
                error: "Invalid credentials"
            };
        }
        // Set session with companyId only (partial session)
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setCompanySession"])(companyId);
        return {
            success: true
        };
    } catch (error) {
        const handled = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["handleError"])(error);
        return {
            success: false,
            error: handled.message
        };
    }
}
async function selectWorker(workerId) {
    try {
        // Validate input
        const validation = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$validation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["selectWorkerSchema"].safeParse({
            workerId
        });
        if (!validation.success) {
            return {
                success: false,
                error: "Invalid worker ID"
            };
        }
        // CRITICAL: Get companyId from session, not from client
        const sessionCompanyId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getActiveCompany"])();
        // Get company-scoped workers collection using session companyId
        const workersCollection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCompanyCollection"])(sessionCompanyId, "workers");
        // Find the worker in the company's collection
        const worker = await workersCollection.findOne({
            id: workerId
        });
        // Verify worker exists and belongs to the session company
        if (!worker || worker.companyId !== sessionCompanyId) {
            return {
                success: false,
                error: "Worker not found"
            };
        }
        // Set workerId in existing company session
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setWorkerInSession"])(workerId);
        // Record login session in company's sessions collection
        const sessionsCollection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCompanyCollection"])(sessionCompanyId, "sessions");
        await sessionsCollection.insertOne({
            workerId,
            companyId: sessionCompanyId,
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
        const handled = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["handleError"])(error);
        return {
            success: false,
            error: handled.message
        };
    }
}
async function loginWorker(companyId, workerId, password) {
    try {
        // Validate input
        const validation = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$validation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["loginWorkerSchema"].safeParse({
            companyId,
            workerId,
            password
        });
        if (!validation.success) {
            return {
                success: false,
                error: "Invalid input. Please check your credentials."
            };
        }
        // Rate limiting - get IP from headers
        const headersList = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["headers"])();
        const forwardedFor = headersList.get('x-forwarded-for');
        const realIP = headersList.get('x-real-ip');
        const clientIP = forwardedFor?.split(',')[0]?.trim() || realIP || 'unknown';
        const rateLimitId = `login:worker:${companyId}:${workerId}:${clientIP}`;
        const rateLimitResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rateLimit$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rateLimit"])(rateLimitId, 5, 15 * 60 * 1000);
        if (!rateLimitResult.success) {
            const retryAfter = Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000);
            return {
                success: false,
                error: `Too many login attempts. Please try again in ${retryAfter} seconds.`
            };
        }
        // Get company-scoped workers collection
        const workersCollection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCompanyCollection"])(companyId, "workers");
        // Find the worker in the company's collection
        const worker = await workersCollection.findOne({
            id: workerId
        });
        // Use generic error message
        if (!worker || worker.companyId !== companyId) {
            return {
                success: false,
                error: "Invalid credentials"
            };
        }
        // Verify password with bcrypt
        if (!worker.password) {
            return {
                success: false,
                error: "Invalid credentials"
            };
        }
        const isValid = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].compare(password, worker.password);
        if (!isValid) {
            return {
                success: false,
                error: "Invalid credentials"
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
        const handled = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["handleError"])(error);
        return {
            success: false,
            error: handled.message
        };
    }
}
async function logout() {
    const { clearSession } = await __turbopack_context__.A("[project]/lib/auth/session.ts [app-rsc] (ecmascript, async loader)");
    try {
        // Clear session cookies
        await clearSession();
        // In a real app, you would also:
        // 1. Invalidate session in database
        // 2. Log logout event
        // Redirect to login page
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/login");
    } catch (error) {
        // Even if clearing session fails, try to redirect
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/login");
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    loginCompany,
    selectWorker,
    loginWorker,
    logout
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(loginCompany, "60e48f651e5ebbd9864e4b8a06cf8fa97d8e2239ad", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(selectWorker, "400171263a30e7f65dafe2a32d7b3a8fdc60ea9bd5", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(loginWorker, "706eaece57029aad276a30b25bf6e85547c101354f", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(logout, "00db69d86cc3b8562947f5f5012a7dc7936b0621ed", null);
}),
"[project]/.next-internal/server/app/drivers/page/actions.js { ACTIONS_MODULE0 => \"[project]/lib/auth/authServer.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$authServer$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/authServer.ts [app-rsc] (ecmascript)");
;
}),
"[project]/.next-internal/server/app/drivers/page/actions.js { ACTIONS_MODULE0 => \"[project]/lib/auth/authServer.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "00db69d86cc3b8562947f5f5012a7dc7936b0621ed",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$authServer$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["logout"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$drivers$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$lib$2f$auth$2f$authServer$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/drivers/page/actions.js { ACTIONS_MODULE0 => "[project]/lib/auth/authServer.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$authServer$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/authServer.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__7c3dd462._.js.map