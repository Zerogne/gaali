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
"[project]/lib/auth/mockData.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "companies",
    ()=>companies,
    "companyPasswords",
    ()=>companyPasswords,
    "workerPasswords",
    ()=>workerPasswords,
    "workers",
    ()=>workers
]);
const companies = [
    {
        id: "altan-logistics",
        name: "Altan Logistics LLC",
        description: "Border checkpoint #3",
        logoInitials: "AL"
    },
    {
        id: "steppe-mining",
        name: "Steppe Mining Co.",
        description: "Mining operations hub",
        logoInitials: "SM"
    },
    {
        id: "blueroad-transport",
        name: "BlueRoad Transport",
        description: "Main transport terminal",
        logoInitials: "BR"
    },
    {
        id: "frontier-customs",
        name: "Frontier Customs Partner",
        description: "Customs processing center",
        logoInitials: "FC"
    }
];
const workers = [
    // Altan Logistics workers
    {
        id: "worker-altan-1",
        name: "Баярмаа Ганбат",
        role: "Gate Operator",
        avatarColor: "bg-blue-500",
        companyId: "altan-logistics"
    },
    {
        id: "worker-altan-2",
        name: "Энхбат Дорж",
        role: "Supervisor",
        avatarColor: "bg-green-500",
        companyId: "altan-logistics"
    },
    {
        id: "worker-altan-3",
        name: "Цэцэгмаа Бат",
        role: "Data Entry",
        avatarColor: "bg-purple-500",
        companyId: "altan-logistics"
    },
    // Steppe Mining workers
    {
        id: "worker-steppe-1",
        name: "Батбаяр Мөнх",
        role: "Gate Operator",
        avatarColor: "bg-orange-500",
        companyId: "steppe-mining"
    },
    {
        id: "worker-steppe-2",
        name: "Сараа Очир",
        role: "Supervisor",
        avatarColor: "bg-red-500",
        companyId: "steppe-mining"
    },
    {
        id: "worker-steppe-3",
        name: "Ганбат Наран",
        role: "Security Officer",
        avatarColor: "bg-indigo-500",
        companyId: "steppe-mining"
    },
    // BlueRoad Transport workers
    {
        id: "worker-blueroad-1",
        name: "Дорж Бат",
        role: "Gate Operator",
        avatarColor: "bg-teal-500",
        companyId: "blueroad-transport"
    },
    {
        id: "worker-blueroad-2",
        name: "Мөнхбат Цогт",
        role: "Supervisor",
        avatarColor: "bg-cyan-500",
        companyId: "blueroad-transport"
    },
    {
        id: "worker-blueroad-3",
        name: "Оюунбат Ган",
        role: "Data Entry",
        avatarColor: "bg-pink-500",
        companyId: "blueroad-transport"
    },
    // Frontier Customs workers
    {
        id: "worker-frontier-1",
        name: "Батбаяр Энх",
        role: "Gate Operator",
        avatarColor: "bg-yellow-500",
        companyId: "frontier-customs"
    },
    {
        id: "worker-frontier-2",
        name: "Цэцэг Очир",
        role: "Supervisor",
        avatarColor: "bg-amber-500",
        companyId: "frontier-customs"
    },
    {
        id: "worker-frontier-3",
        name: "Ганбат Мөнх",
        role: "Customs Officer",
        avatarColor: "bg-lime-500",
        companyId: "frontier-customs"
    }
];
const companyPasswords = {
    "altan-logistics": "password123",
    "steppe-mining": "password123",
    "blueroad-transport": "password123",
    "frontier-customs": "password123"
};
const workerPasswords = {
    "worker-altan-1": "password123",
    "worker-altan-2": "password123",
    "worker-altan-3": "password123",
    "worker-steppe-1": "password123",
    "worker-steppe-2": "password123",
    "worker-steppe-3": "password123",
    "worker-blueroad-1": "password123",
    "worker-blueroad-2": "password123",
    "worker-blueroad-3": "password123",
    "worker-frontier-1": "password123",
    "worker-frontier-2": "password123",
    "worker-frontier-3": "password123"
};
}),
"[project]/lib/companies/seed.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"0033a42f56946bd05c3f86f7e41bfacdbdca1ca29a":"seedAll","003e2f4f06258e4aa4b6f09ff947a5153270f564f5":"seedCompanies","00d9e85fb3ae8016ec48ff69b328021448e3ea7d28":"seedTruckLogs","00ebbd60643491e3d3e6dd50354b46bd2ef70112a5":"seedWorkers"},"",""] */ __turbopack_context__.s([
    "seedAll",
    ()=>seedAll,
    "seedCompanies",
    ()=>seedCompanies,
    "seedTruckLogs",
    ()=>seedTruckLogs,
    "seedWorkers",
    ()=>seedWorkers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db/companyDb.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$mockData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/mockData.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-route] (ecmascript)");
;
;
;
;
;
async function seedCompanies() {
    const companiesCollection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCompaniesCollection"])();
    for (const company of __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$mockData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["companies"]){
        const companyMetadata = {
            companyId: company.id,
            name: company.name,
            description: company.description,
            logoInitials: company.logoInitials,
            password: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$mockData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["companyPasswords"][company.id] || "password123",
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await companiesCollection.updateOne({
            companyId: company.id
        }, {
            $set: companyMetadata
        }, {
            upsert: true
        });
    }
    console.log("✅ Companies metadata seeded");
}
async function seedWorkers() {
    // Group workers by company
    const workersByCompany = new Map();
    for (const worker of __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$mockData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workers"]){
        if (!workersByCompany.has(worker.companyId)) {
            workersByCompany.set(worker.companyId, []);
        }
        workersByCompany.get(worker.companyId).push(worker);
    }
    // Seed each company's workers collection
    for (const [companyId, companyWorkers] of workersByCompany){
        const workersCollection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCompanyCollection"])(companyId, "workers");
        for (const worker of companyWorkers){
            const workerWithPassword = {
                ...worker,
                password: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$mockData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["workerPasswords"][worker.id] || "password123"
            };
            await workersCollection.updateOne({
                id: worker.id
            }, {
                $set: workerWithPassword
            }, {
                upsert: true
            });
        }
        console.log(`✅ Workers seeded for company: ${companyId}`);
    }
}
async function seedTruckLogs() {
    const companyA = "altan-logistics";
    const companyB = "steppe-mining";
    // Sample logs for Company A
    const logsA = [
        {
            id: `log-${companyA}-1`,
            direction: "IN",
            plate: "Б1234АВ",
            driverName: "Баярмаа Ганбат",
            cargoType: "industrial",
            weightKg: 24500,
            origin: "Улаанбаатар",
            destination: "Замын-Үүд",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            sentToCustoms: true
        },
        {
            id: `log-${companyA}-2`,
            direction: "OUT",
            plate: "Б5678ЦЦ",
            driverName: "Энхбат Дорж",
            cargoType: "food",
            weightKg: 12000,
            origin: "Замын-Үүд",
            destination: "Улаанбаатар",
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            sentToCustoms: false
        }
    ];
    // Sample logs for Company B
    const logsB = [
        {
            id: `log-${companyB}-1`,
            direction: "IN",
            plate: "Б9999ЗЗ",
            driverName: "Батбаяр Мөнх",
            cargoType: "construction",
            weightKg: 30000,
            origin: "Дархан",
            destination: "Эрдэнэт",
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            sentToCustoms: true
        },
        {
            id: `log-${companyB}-2`,
            direction: "OUT",
            plate: "Б1111АА",
            driverName: "Сараа Очир",
            cargoType: "machinery",
            weightKg: 18000,
            origin: "Эрдэнэт",
            destination: "Дархан",
            createdAt: new Date(Date.now() - 1800000).toISOString(),
            sentToCustoms: false
        }
    ];
    // Insert logs into company A's collection
    const logsCollectionA = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCompanyCollection"])(companyA, "logs");
    for (const log of logsA){
        await logsCollectionA.updateOne({
            id: log.id
        }, {
            $set: log
        }, {
            upsert: true
        });
    }
    // Insert logs into company B's collection
    const logsCollectionB = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCompanyCollection"])(companyB, "logs");
    for (const log of logsB){
        await logsCollectionB.updateOne({
            id: log.id
        }, {
            $set: log
        }, {
            upsert: true
        });
    }
    console.log("✅ Sample truck logs seeded");
}
async function seedAll() {
    console.log("🌱 Starting database seeding...");
    // Ensure collections exist for all companies
    for (const company of __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$mockData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["companies"]){
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2f$companyDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureCompanyCollections"])(company.id);
    }
    // Seed companies metadata
    await seedCompanies();
    // Seed workers
    await seedWorkers();
    // Seed sample logs
    await seedTruckLogs();
    console.log("✅ Database seeding completed!");
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    seedCompanies,
    seedWorkers,
    seedTruckLogs,
    seedAll
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(seedCompanies, "003e2f4f06258e4aa4b6f09ff947a5153270f564f5", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(seedWorkers, "00ebbd60643491e3d3e6dd50354b46bd2ef70112a5", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(seedTruckLogs, "00d9e85fb3ae8016ec48ff69b328021448e3ea7d28", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(seedAll, "0033a42f56946bd05c3f86f7e41bfacdbdca1ca29a", null);
}),
"[project]/app/api/seed/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$companies$2f$seed$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/companies/seed.ts [app-route] (ecmascript)");
;
;
async function POST() {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$companies$2f$seed$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["seedAll"])();
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: "Database seeded successfully"
        });
    } catch (error) {
        console.error("Seeding error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: "Failed to seed database"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__21e1fd73._.js.map