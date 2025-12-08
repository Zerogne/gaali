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
"[project]/lib/companies/metadata.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"00d65cab2d2c6acbedd229aabb27df4af89284b766":"getAllCompanies","40bfd9caf442fc170c33a0ec758e7503bd156b3023":"upsertCompany","40e735cdb8f0809d60be19d5fab9536667ced4803f":"getCompany"},"",""] */ __turbopack_context__.s([
    "getAllCompanies",
    ()=>getAllCompanies,
    "getCompany",
    ()=>getCompany,
    "upsertCompany",
    ()=>upsertCompany
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/companyDb.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-route] (ecmascript)");
;
;
async function getAllCompanies() {
    const companiesCollection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCompaniesCollection"])();
    const companies = await companiesCollection.find({}).sort({
        name: 1
    }).toArray();
    // Serialize MongoDB documents to plain objects
    // Note: password is NOT included in serialized output for security
    return companies.map((company)=>{
        const { _id, password, ...companyData } = company;
        return {
            companyId: companyData.companyId,
            name: companyData.name,
            description: companyData.description,
            logoUrl: companyData.logoUrl,
            logoInitials: companyData.logoInitials,
            createdAt: companyData.createdAt instanceof Date ? companyData.createdAt.toISOString() : typeof companyData.createdAt === 'string' ? companyData.createdAt : new Date(companyData.createdAt).toISOString(),
            updatedAt: companyData.updatedAt instanceof Date ? companyData.updatedAt.toISOString() : typeof companyData.updatedAt === 'string' ? companyData.updatedAt : new Date(companyData.updatedAt).toISOString()
        };
    });
}
async function getCompany(companyId) {
    const companiesCollection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCompaniesCollection"])();
    const company = await companiesCollection.findOne({
        companyId
    });
    if (!company) return null;
    // Serialize MongoDB document to plain object
    // Note: password is NOT included in serialized output for security
    const { _id, password, ...companyData } = company;
    return {
        companyId: companyData.companyId,
        name: companyData.name,
        description: companyData.description,
        logoUrl: companyData.logoUrl,
        logoInitials: companyData.logoInitials,
        createdAt: companyData.createdAt instanceof Date ? companyData.createdAt.toISOString() : typeof companyData.createdAt === 'string' ? companyData.createdAt : new Date(companyData.createdAt).toISOString(),
        updatedAt: companyData.updatedAt instanceof Date ? companyData.updatedAt.toISOString() : typeof companyData.updatedAt === 'string' ? companyData.updatedAt : new Date(companyData.updatedAt).toISOString()
    };
}
async function upsertCompany(company) {
    const companiesCollection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCompaniesCollection"])();
    await companiesCollection.updateOne({
        companyId: company.companyId
    }, {
        $set: {
            ...company,
            updatedAt: new Date()
        },
        $setOnInsert: {
            createdAt: new Date()
        }
    }, {
        upsert: true
    });
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getAllCompanies,
    getCompany,
    upsertCompany
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(getAllCompanies, "00d65cab2d2c6acbedd229aabb27df4af89284b766", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(getCompany, "40e735cdb8f0809d60be19d5fab9536667ced4803f", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(upsertCompany, "40bfd9caf442fc170c33a0ec758e7503bd156b3023", null);
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
"[project]/app/api/companies/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$companies$2f$metadata$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/companies/metadata.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/errors.ts [app-route] (ecmascript)");
;
;
;
async function GET() {
    try {
        const companies = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$companies$2f$metadata$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAllCompanies"])();
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(companies, {
            status: 200
        });
    } catch (error) {
        const errorResponse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["errorToResponse"])(error);
        const statusCode = error instanceof Error && 'statusCode' in error ? error.statusCode : 500;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(errorResponse, {
            status: statusCode
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__72cb678f._.js.map