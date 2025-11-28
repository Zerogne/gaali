module.exports = [
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
    return companies.map((company)=>{
        const { _id, ...companyData } = company;
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
    const { _id, ...companyData } = company;
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
];

//# sourceMappingURL=lib_companies_metadata_ts_096c6597._.js.map