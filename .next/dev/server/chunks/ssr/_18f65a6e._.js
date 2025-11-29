module.exports = [
"[project]/components/ui/card.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Card",
    ()=>Card,
    "CardAction",
    ()=>CardAction,
    "CardContent",
    ()=>CardContent,
    "CardDescription",
    ()=>CardDescription,
    "CardFooter",
    ()=>CardFooter,
    "CardHeader",
    ()=>CardHeader,
    "CardTitle",
    ()=>CardTitle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-ssr] (ecmascript)");
;
;
function Card({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
function CardHeader({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-header",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
function CardTitle({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-title",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('leading-none font-semibold', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
function CardDescription({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-description",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('text-muted-foreground text-sm', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 43,
        columnNumber: 5
    }, this);
}
function CardAction({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-action",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
}
function CardContent({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-content",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('px-6', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 66,
        columnNumber: 5
    }, this);
}
function CardFooter({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-footer",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('flex items-center px-6 [.border-t]:pt-6', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 76,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/components/ui/input.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Input",
    ()=>Input
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-ssr] (ecmascript)");
;
;
function Input({ className, type, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        type: type,
        "data-slot": "input",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm', 'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]', 'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/input.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/components/ui/label.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Label",
    ()=>Label
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-label/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
function Label({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "label",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/label.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/lib/auth/data:fa0fac [app-ssr] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"60e48f651e5ebbd9864e4b8a06cf8fa97d8e2239ad":"loginCompany"},"lib/auth/authServer.ts",""] */ __turbopack_context__.s([
    "loginCompany",
    ()=>loginCompany
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-ssr] (ecmascript)");
"use turbopack no side effects";
;
var loginCompany = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createServerReference"])("60e48f651e5ebbd9864e4b8a06cf8fa97d8e2239ad", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findSourceMapURL"], "loginCompany"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYXV0aFNlcnZlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzZXJ2ZXJcIlxuXG5pbXBvcnQgeyByZWRpcmVjdCB9IGZyb20gXCJuZXh0L25hdmlnYXRpb25cIlxuaW1wb3J0IHsgaGVhZGVycyB9IGZyb20gXCJuZXh0L2hlYWRlcnNcIlxuaW1wb3J0IGJjcnlwdCBmcm9tIFwiYmNyeXB0anNcIlxuaW1wb3J0IHsgZ2V0Q29tcGFueUNvbGxlY3Rpb24gfSBmcm9tIFwiQC9saWIvZGIvY29tcGFueURiXCJcbmltcG9ydCB7IGdldENvbXBhbmllc0NvbGxlY3Rpb24gfSBmcm9tIFwiQC9saWIvZGIvY29tcGFueURiXCJcbmltcG9ydCB7IHNldFNlc3Npb24sIHNldENvbXBhbnlTZXNzaW9uLCBzZXRXb3JrZXJJblNlc3Npb24sIGdldEFjdGl2ZUNvbXBhbnkgfSBmcm9tIFwiLi9zZXNzaW9uXCJcbmltcG9ydCB7IGxvZ2luQ29tcGFueVNjaGVtYSwgc2VsZWN0V29ya2VyU2NoZW1hLCBsb2dpbldvcmtlclNjaGVtYSB9IGZyb20gXCJAL2xpYi92YWxpZGF0aW9uXCJcbmltcG9ydCB7IHJhdGVMaW1pdCB9IGZyb20gXCJAL2xpYi9yYXRlTGltaXRcIlxuaW1wb3J0IHsgaGFuZGxlRXJyb3IgfSBmcm9tIFwiQC9saWIvZXJyb3JzXCJcblxuaW50ZXJmYWNlIFdvcmtlcldpdGhQYXNzd29yZCB7XG4gIGlkOiBzdHJpbmdcbiAgbmFtZTogc3RyaW5nXG4gIHJvbGU6IHN0cmluZ1xuICBhdmF0YXJDb2xvcjogc3RyaW5nXG4gIGNvbXBhbnlJZDogc3RyaW5nXG4gIHBhc3N3b3JkPzogc3RyaW5nXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTG9naW5SZXN1bHQge1xuICBzdWNjZXNzOiBib29sZWFuXG4gIGVycm9yPzogc3RyaW5nXG4gIHJlZGlyZWN0Pzogc3RyaW5nXG59XG5cbi8qKlxuICogTG9naW4gY29tcGFueSAtIHZlcmlmaWVzIGNvbXBhbnkgcGFzc3dvcmQgd2l0aCBiY3J5cHRcbiAqIFNldHMgc2Vzc2lvbiB3aXRoIGNvbXBhbnlJZCBvbmx5ICh3b3JrZXIgbm90IHNlbGVjdGVkIHlldClcbiAqIEluY2x1ZGVzIHJhdGUgbGltaXRpbmcgYW5kIGlucHV0IHZhbGlkYXRpb25cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvZ2luQ29tcGFueShcbiAgY29tcGFueUlkOiBzdHJpbmcsXG4gIHBhc3N3b3JkOiBzdHJpbmdcbik6IFByb21pc2U8TG9naW5SZXN1bHQ+IHtcbiAgdHJ5IHtcbiAgICAvLyBWYWxpZGF0ZSBpbnB1dCB3aXRoIFpvZFxuICAgIGNvbnN0IHZhbGlkYXRpb24gPSBsb2dpbkNvbXBhbnlTY2hlbWEuc2FmZVBhcnNlKHsgY29tcGFueUlkLCBwYXNzd29yZCB9KVxuICAgIGlmICghdmFsaWRhdGlvbi5zdWNjZXNzKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6IFwiSW52YWxpZCBpbnB1dC4gUGxlYXNlIGNoZWNrIHlvdXIgY3JlZGVudGlhbHMuXCIsXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmF0ZSBsaW1pdGluZyAtIGdldCBJUCBmcm9tIGhlYWRlcnNcbiAgICBjb25zdCBoZWFkZXJzTGlzdCA9IGF3YWl0IGhlYWRlcnMoKVxuICAgIGNvbnN0IGZvcndhcmRlZEZvciA9IGhlYWRlcnNMaXN0LmdldCgneC1mb3J3YXJkZWQtZm9yJylcbiAgICBjb25zdCByZWFsSVAgPSBoZWFkZXJzTGlzdC5nZXQoJ3gtcmVhbC1pcCcpXG4gICAgY29uc3QgY2xpZW50SVAgPSBmb3J3YXJkZWRGb3I/LnNwbGl0KCcsJylbMF0/LnRyaW0oKSB8fCByZWFsSVAgfHwgJ3Vua25vd24nXG4gICAgY29uc3QgcmF0ZUxpbWl0SWQgPSBgbG9naW46Y29tcGFueToke2NvbXBhbnlJZH06JHtjbGllbnRJUH1gXG4gICAgY29uc3QgcmF0ZUxpbWl0UmVzdWx0ID0gYXdhaXQgcmF0ZUxpbWl0KHJhdGVMaW1pdElkLCA1LCAxNSAqIDYwICogMTAwMCkgLy8gNSBhdHRlbXB0cyBwZXIgMTUgbWludXRlc1xuXG4gICAgaWYgKCFyYXRlTGltaXRSZXN1bHQuc3VjY2Vzcykge1xuICAgICAgY29uc3QgcmV0cnlBZnRlciA9IE1hdGguY2VpbCgocmF0ZUxpbWl0UmVzdWx0LnJlc2V0QXQgLSBEYXRlLm5vdygpKSAvIDEwMDApXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6IGBUb28gbWFueSBsb2dpbiBhdHRlbXB0cy4gUGxlYXNlIHRyeSBhZ2FpbiBpbiAke3JldHJ5QWZ0ZXJ9IHNlY29uZHMuYCxcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBHZXQgY29tcGFueSBmcm9tIHNoYXJlZCBjb21wYW5pZXMgY29sbGVjdGlvblxuICAgIGNvbnN0IGNvbXBhbmllc0NvbGxlY3Rpb24gPSBhd2FpdCBnZXRDb21wYW5pZXNDb2xsZWN0aW9uKClcbiAgICBjb25zdCBjb21wYW55ID0gYXdhaXQgY29tcGFuaWVzQ29sbGVjdGlvbi5maW5kT25lKHsgY29tcGFueUlkIH0pXG5cbiAgICAvLyBVc2UgZ2VuZXJpYyBlcnJvciBtZXNzYWdlIHRvIHByZXZlbnQgZW51bWVyYXRpb25cbiAgICBpZiAoIWNvbXBhbnkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYENvbXBhbnkgbm90IGZvdW5kOiAke2NvbXBhbnlJZH1gKVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIGVycm9yOiBcIkludmFsaWQgY3JlZGVudGlhbHNcIixcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWNvbXBhbnkucGFzc3dvcmQpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYENvbXBhbnkgZm91bmQgYnV0IG5vIHBhc3N3b3JkIHNldDogJHtjb21wYW55SWR9YClcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBlcnJvcjogXCJJbnZhbGlkIGNyZWRlbnRpYWxzXCIsXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVmVyaWZ5IHBhc3N3b3JkIHdpdGggYmNyeXB0XG4gICAgY29uc3QgaXNWYWxpZCA9IGF3YWl0IGJjcnlwdC5jb21wYXJlKHBhc3N3b3JkLCBjb21wYW55LnBhc3N3b3JkKVxuICAgIGlmICghaXNWYWxpZCkge1xuICAgICAgY29uc29sZS5lcnJvcihgUGFzc3dvcmQgbWlzbWF0Y2ggZm9yIGNvbXBhbnk6ICR7Y29tcGFueUlkfWApXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6IFwiSW52YWxpZCBjcmVkZW50aWFsc1wiLFxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNldCBzZXNzaW9uIHdpdGggY29tcGFueUlkIG9ubHkgKHBhcnRpYWwgc2Vzc2lvbilcbiAgICBhd2FpdCBzZXRDb21wYW55U2Vzc2lvbihjb21wYW55SWQpXG5cbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc3QgaGFuZGxlZCA9IGhhbmRsZUVycm9yKGVycm9yKVxuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgIGVycm9yOiBoYW5kbGVkLm1lc3NhZ2UsXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogU2VsZWN0IHdvcmtlciAtIHNldHMgd29ya2VySWQgaW4gZXhpc3RpbmcgY29tcGFueSBzZXNzaW9uXG4gKiBObyBwYXNzd29yZCByZXF1aXJlZCAoY29tcGFueSBhbHJlYWR5IGF1dGhlbnRpY2F0ZWQpXG4gKiBTRUNVUklUWTogY29tcGFueUlkIGlzIHJldHJpZXZlZCBmcm9tIHNlc3Npb24sIE5PVCBmcm9tIGNsaWVudFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VsZWN0V29ya2VyKFxuICB3b3JrZXJJZDogc3RyaW5nXG4pOiBQcm9taXNlPExvZ2luUmVzdWx0PiB7XG4gIHRyeSB7XG4gICAgLy8gVmFsaWRhdGUgaW5wdXRcbiAgICBjb25zdCB2YWxpZGF0aW9uID0gc2VsZWN0V29ya2VyU2NoZW1hLnNhZmVQYXJzZSh7IHdvcmtlcklkIH0pXG4gICAgaWYgKCF2YWxpZGF0aW9uLnN1Y2Nlc3MpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBlcnJvcjogXCJJbnZhbGlkIHdvcmtlciBJRFwiLFxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIENSSVRJQ0FMOiBHZXQgY29tcGFueUlkIGZyb20gc2Vzc2lvbiwgbm90IGZyb20gY2xpZW50XG4gICAgY29uc3Qgc2Vzc2lvbkNvbXBhbnlJZCA9IGF3YWl0IGdldEFjdGl2ZUNvbXBhbnkoKVxuXG4gICAgLy8gR2V0IGNvbXBhbnktc2NvcGVkIHdvcmtlcnMgY29sbGVjdGlvbiB1c2luZyBzZXNzaW9uIGNvbXBhbnlJZFxuICAgIGNvbnN0IHdvcmtlcnNDb2xsZWN0aW9uID0gYXdhaXQgZ2V0Q29tcGFueUNvbGxlY3Rpb248V29ya2VyV2l0aFBhc3N3b3JkPihcbiAgICAgIHNlc3Npb25Db21wYW55SWQsXG4gICAgICBcIndvcmtlcnNcIlxuICAgIClcblxuICAgIC8vIEZpbmQgdGhlIHdvcmtlciBpbiB0aGUgY29tcGFueSdzIGNvbGxlY3Rpb25cbiAgICBjb25zdCB3b3JrZXIgPSBhd2FpdCB3b3JrZXJzQ29sbGVjdGlvbi5maW5kT25lKHsgaWQ6IHdvcmtlcklkIH0pXG5cbiAgICAvLyBWZXJpZnkgd29ya2VyIGV4aXN0cyBhbmQgYmVsb25ncyB0byB0aGUgc2Vzc2lvbiBjb21wYW55XG4gICAgaWYgKCF3b3JrZXIgfHwgd29ya2VyLmNvbXBhbnlJZCAhPT0gc2Vzc2lvbkNvbXBhbnlJZCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIGVycm9yOiBcIldvcmtlciBub3QgZm91bmRcIixcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTZXQgd29ya2VySWQgaW4gZXhpc3RpbmcgY29tcGFueSBzZXNzaW9uXG4gICAgYXdhaXQgc2V0V29ya2VySW5TZXNzaW9uKHdvcmtlcklkKVxuXG4gICAgLy8gUmVjb3JkIGxvZ2luIHNlc3Npb24gaW4gY29tcGFueSdzIHNlc3Npb25zIGNvbGxlY3Rpb25cbiAgICBjb25zdCBzZXNzaW9uc0NvbGxlY3Rpb24gPSBhd2FpdCBnZXRDb21wYW55Q29sbGVjdGlvbihzZXNzaW9uQ29tcGFueUlkLCBcInNlc3Npb25zXCIpXG4gICAgYXdhaXQgc2Vzc2lvbnNDb2xsZWN0aW9uLmluc2VydE9uZSh7XG4gICAgICB3b3JrZXJJZCxcbiAgICAgIGNvbXBhbnlJZDogc2Vzc2lvbkNvbXBhbnlJZCxcbiAgICAgIGxvZ2luQXQ6IG5ldyBEYXRlKCksXG4gICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCksXG4gICAgfSlcblxuICAgIC8vIFJlZGlyZWN0IHRvIGRhc2hib2FyZCAodGhpcyB3aWxsIHRocm93LCB3aGljaCBpcyBleHBlY3RlZCBpbiBOZXh0LmpzKVxuICAgIHJlZGlyZWN0KFwiL1wiKVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIC8vIElmIGl0J3MgYSByZWRpcmVjdCBlcnJvciwgbGV0IGl0IHByb3BhZ2F0ZVxuICAgIGlmIChlcnJvciAmJiB0eXBlb2YgZXJyb3IgPT09IFwib2JqZWN0XCIgJiYgXCJkaWdlc3RcIiBpbiBlcnJvcikge1xuICAgICAgdGhyb3cgZXJyb3JcbiAgICB9XG5cbiAgICBjb25zdCBoYW5kbGVkID0gaGFuZGxlRXJyb3IoZXJyb3IpXG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgZXJyb3I6IGhhbmRsZWQubWVzc2FnZSxcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBMZWdhY3k6IExvZ2luIHdvcmtlciAtIHZlcmlmaWVzIGNyZWRlbnRpYWxzIGFnYWluc3QgY29tcGFueS1zY29wZWQgd29ya2VyIGNvbGxlY3Rpb25cbiAqIFNldHMgc2Vzc2lvbiB3aXRoIGNvbXBhbnlJZCBhbmQgd29ya2VySWQgb24gc3VjY2Vzc1xuICogQGRlcHJlY2F0ZWQgVXNlIGxvZ2luQ29tcGFueSArIHNlbGVjdFdvcmtlciBpbnN0ZWFkXG4gKiBJbmNsdWRlcyByYXRlIGxpbWl0aW5nIGFuZCBiY3J5cHQgcGFzc3dvcmQgdmVyaWZpY2F0aW9uXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2dpbldvcmtlcihcbiAgY29tcGFueUlkOiBzdHJpbmcsXG4gIHdvcmtlcklkOiBzdHJpbmcsXG4gIHBhc3N3b3JkOiBzdHJpbmdcbik6IFByb21pc2U8TG9naW5SZXN1bHQ+IHtcbiAgdHJ5IHtcbiAgICAvLyBWYWxpZGF0ZSBpbnB1dFxuICAgIGNvbnN0IHZhbGlkYXRpb24gPSBsb2dpbldvcmtlclNjaGVtYS5zYWZlUGFyc2UoeyBjb21wYW55SWQsIHdvcmtlcklkLCBwYXNzd29yZCB9KVxuICAgIGlmICghdmFsaWRhdGlvbi5zdWNjZXNzKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6IFwiSW52YWxpZCBpbnB1dC4gUGxlYXNlIGNoZWNrIHlvdXIgY3JlZGVudGlhbHMuXCIsXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmF0ZSBsaW1pdGluZyAtIGdldCBJUCBmcm9tIGhlYWRlcnNcbiAgICBjb25zdCBoZWFkZXJzTGlzdCA9IGF3YWl0IGhlYWRlcnMoKVxuICAgIGNvbnN0IGZvcndhcmRlZEZvciA9IGhlYWRlcnNMaXN0LmdldCgneC1mb3J3YXJkZWQtZm9yJylcbiAgICBjb25zdCByZWFsSVAgPSBoZWFkZXJzTGlzdC5nZXQoJ3gtcmVhbC1pcCcpXG4gICAgY29uc3QgY2xpZW50SVAgPSBmb3J3YXJkZWRGb3I/LnNwbGl0KCcsJylbMF0/LnRyaW0oKSB8fCByZWFsSVAgfHwgJ3Vua25vd24nXG4gICAgY29uc3QgcmF0ZUxpbWl0SWQgPSBgbG9naW46d29ya2VyOiR7Y29tcGFueUlkfToke3dvcmtlcklkfToke2NsaWVudElQfWBcbiAgICBjb25zdCByYXRlTGltaXRSZXN1bHQgPSBhd2FpdCByYXRlTGltaXQocmF0ZUxpbWl0SWQsIDUsIDE1ICogNjAgKiAxMDAwKVxuXG4gICAgaWYgKCFyYXRlTGltaXRSZXN1bHQuc3VjY2Vzcykge1xuICAgICAgY29uc3QgcmV0cnlBZnRlciA9IE1hdGguY2VpbCgocmF0ZUxpbWl0UmVzdWx0LnJlc2V0QXQgLSBEYXRlLm5vdygpKSAvIDEwMDApXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6IGBUb28gbWFueSBsb2dpbiBhdHRlbXB0cy4gUGxlYXNlIHRyeSBhZ2FpbiBpbiAke3JldHJ5QWZ0ZXJ9IHNlY29uZHMuYCxcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBHZXQgY29tcGFueS1zY29wZWQgd29ya2VycyBjb2xsZWN0aW9uXG4gICAgY29uc3Qgd29ya2Vyc0NvbGxlY3Rpb24gPSBhd2FpdCBnZXRDb21wYW55Q29sbGVjdGlvbjxXb3JrZXJXaXRoUGFzc3dvcmQ+KFxuICAgICAgY29tcGFueUlkLFxuICAgICAgXCJ3b3JrZXJzXCJcbiAgICApXG5cbiAgICAvLyBGaW5kIHRoZSB3b3JrZXIgaW4gdGhlIGNvbXBhbnkncyBjb2xsZWN0aW9uXG4gICAgY29uc3Qgd29ya2VyID0gYXdhaXQgd29ya2Vyc0NvbGxlY3Rpb24uZmluZE9uZSh7IGlkOiB3b3JrZXJJZCB9KVxuXG4gICAgLy8gVXNlIGdlbmVyaWMgZXJyb3IgbWVzc2FnZVxuICAgIGlmICghd29ya2VyIHx8IHdvcmtlci5jb21wYW55SWQgIT09IGNvbXBhbnlJZCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIGVycm9yOiBcIkludmFsaWQgY3JlZGVudGlhbHNcIixcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBWZXJpZnkgcGFzc3dvcmQgd2l0aCBiY3J5cHRcbiAgICBpZiAoIXdvcmtlci5wYXNzd29yZCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIGVycm9yOiBcIkludmFsaWQgY3JlZGVudGlhbHNcIixcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBpc1ZhbGlkID0gYXdhaXQgYmNyeXB0LmNvbXBhcmUocGFzc3dvcmQsIHdvcmtlci5wYXNzd29yZClcbiAgICBpZiAoIWlzVmFsaWQpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBlcnJvcjogXCJJbnZhbGlkIGNyZWRlbnRpYWxzXCIsXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gU2V0IHNlc3Npb24gd2l0aCBjb21wYW55SWQgYW5kIHdvcmtlcklkXG4gICAgYXdhaXQgc2V0U2Vzc2lvbihjb21wYW55SWQsIHdvcmtlcklkKVxuXG4gICAgLy8gUmVjb3JkIGxvZ2luIHNlc3Npb24gaW4gY29tcGFueSdzIHNlc3Npb25zIGNvbGxlY3Rpb25cbiAgICBjb25zdCBzZXNzaW9uc0NvbGxlY3Rpb24gPSBhd2FpdCBnZXRDb21wYW55Q29sbGVjdGlvbihjb21wYW55SWQsIFwic2Vzc2lvbnNcIilcbiAgICBhd2FpdCBzZXNzaW9uc0NvbGxlY3Rpb24uaW5zZXJ0T25lKHtcbiAgICAgIHdvcmtlcklkLFxuICAgICAgY29tcGFueUlkLFxuICAgICAgbG9naW5BdDogbmV3IERhdGUoKSxcbiAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKSxcbiAgICB9KVxuXG4gICAgLy8gUmVkaXJlY3QgdG8gZGFzaGJvYXJkICh0aGlzIHdpbGwgdGhyb3csIHdoaWNoIGlzIGV4cGVjdGVkIGluIE5leHQuanMpXG4gICAgcmVkaXJlY3QoXCIvXCIpXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8gSWYgaXQncyBhIHJlZGlyZWN0IGVycm9yLCBsZXQgaXQgcHJvcGFnYXRlXG4gICAgaWYgKGVycm9yICYmIHR5cGVvZiBlcnJvciA9PT0gXCJvYmplY3RcIiAmJiBcImRpZ2VzdFwiIGluIGVycm9yKSB7XG4gICAgICB0aHJvdyBlcnJvclxuICAgIH1cblxuICAgIGNvbnN0IGhhbmRsZWQgPSBoYW5kbGVFcnJvcihlcnJvcilcbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICBlcnJvcjogaGFuZGxlZC5tZXNzYWdlLFxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9nb3V0KCk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCB7IGNsZWFyU2Vzc2lvbiB9ID0gYXdhaXQgaW1wb3J0KFwiLi9zZXNzaW9uXCIpXG4gIFxuICB0cnkge1xuICAgIC8vIENsZWFyIHNlc3Npb24gY29va2llc1xuICAgIGF3YWl0IGNsZWFyU2Vzc2lvbigpXG4gICAgXG4gICAgLy8gSW4gYSByZWFsIGFwcCwgeW91IHdvdWxkIGFsc286XG4gICAgLy8gMS4gSW52YWxpZGF0ZSBzZXNzaW9uIGluIGRhdGFiYXNlXG4gICAgLy8gMi4gTG9nIGxvZ291dCBldmVudFxuICAgIFxuICAgIC8vIFJlZGlyZWN0IHRvIGxvZ2luIHBhZ2VcbiAgICByZWRpcmVjdChcIi9sb2dpblwiKVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIC8vIEV2ZW4gaWYgY2xlYXJpbmcgc2Vzc2lvbiBmYWlscywgdHJ5IHRvIHJlZGlyZWN0XG4gICAgcmVkaXJlY3QoXCIvbG9naW5cIilcbiAgfVxufVxuXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjRSQWdDc0IifQ==
}),
"[project]/lib/auth/data:b18de8 [app-ssr] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"400171263a30e7f65dafe2a32d7b3a8fdc60ea9bd5":"selectWorker"},"lib/auth/authServer.ts",""] */ __turbopack_context__.s([
    "selectWorker",
    ()=>selectWorker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-ssr] (ecmascript)");
"use turbopack no side effects";
;
var selectWorker = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createServerReference"])("400171263a30e7f65dafe2a32d7b3a8fdc60ea9bd5", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findSourceMapURL"], "selectWorker"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYXV0aFNlcnZlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzZXJ2ZXJcIlxuXG5pbXBvcnQgeyByZWRpcmVjdCB9IGZyb20gXCJuZXh0L25hdmlnYXRpb25cIlxuaW1wb3J0IHsgaGVhZGVycyB9IGZyb20gXCJuZXh0L2hlYWRlcnNcIlxuaW1wb3J0IGJjcnlwdCBmcm9tIFwiYmNyeXB0anNcIlxuaW1wb3J0IHsgZ2V0Q29tcGFueUNvbGxlY3Rpb24gfSBmcm9tIFwiQC9saWIvZGIvY29tcGFueURiXCJcbmltcG9ydCB7IGdldENvbXBhbmllc0NvbGxlY3Rpb24gfSBmcm9tIFwiQC9saWIvZGIvY29tcGFueURiXCJcbmltcG9ydCB7IHNldFNlc3Npb24sIHNldENvbXBhbnlTZXNzaW9uLCBzZXRXb3JrZXJJblNlc3Npb24sIGdldEFjdGl2ZUNvbXBhbnkgfSBmcm9tIFwiLi9zZXNzaW9uXCJcbmltcG9ydCB7IGxvZ2luQ29tcGFueVNjaGVtYSwgc2VsZWN0V29ya2VyU2NoZW1hLCBsb2dpbldvcmtlclNjaGVtYSB9IGZyb20gXCJAL2xpYi92YWxpZGF0aW9uXCJcbmltcG9ydCB7IHJhdGVMaW1pdCB9IGZyb20gXCJAL2xpYi9yYXRlTGltaXRcIlxuaW1wb3J0IHsgaGFuZGxlRXJyb3IgfSBmcm9tIFwiQC9saWIvZXJyb3JzXCJcblxuaW50ZXJmYWNlIFdvcmtlcldpdGhQYXNzd29yZCB7XG4gIGlkOiBzdHJpbmdcbiAgbmFtZTogc3RyaW5nXG4gIHJvbGU6IHN0cmluZ1xuICBhdmF0YXJDb2xvcjogc3RyaW5nXG4gIGNvbXBhbnlJZDogc3RyaW5nXG4gIHBhc3N3b3JkPzogc3RyaW5nXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTG9naW5SZXN1bHQge1xuICBzdWNjZXNzOiBib29sZWFuXG4gIGVycm9yPzogc3RyaW5nXG4gIHJlZGlyZWN0Pzogc3RyaW5nXG59XG5cbi8qKlxuICogTG9naW4gY29tcGFueSAtIHZlcmlmaWVzIGNvbXBhbnkgcGFzc3dvcmQgd2l0aCBiY3J5cHRcbiAqIFNldHMgc2Vzc2lvbiB3aXRoIGNvbXBhbnlJZCBvbmx5ICh3b3JrZXIgbm90IHNlbGVjdGVkIHlldClcbiAqIEluY2x1ZGVzIHJhdGUgbGltaXRpbmcgYW5kIGlucHV0IHZhbGlkYXRpb25cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvZ2luQ29tcGFueShcbiAgY29tcGFueUlkOiBzdHJpbmcsXG4gIHBhc3N3b3JkOiBzdHJpbmdcbik6IFByb21pc2U8TG9naW5SZXN1bHQ+IHtcbiAgdHJ5IHtcbiAgICAvLyBWYWxpZGF0ZSBpbnB1dCB3aXRoIFpvZFxuICAgIGNvbnN0IHZhbGlkYXRpb24gPSBsb2dpbkNvbXBhbnlTY2hlbWEuc2FmZVBhcnNlKHsgY29tcGFueUlkLCBwYXNzd29yZCB9KVxuICAgIGlmICghdmFsaWRhdGlvbi5zdWNjZXNzKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6IFwiSW52YWxpZCBpbnB1dC4gUGxlYXNlIGNoZWNrIHlvdXIgY3JlZGVudGlhbHMuXCIsXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmF0ZSBsaW1pdGluZyAtIGdldCBJUCBmcm9tIGhlYWRlcnNcbiAgICBjb25zdCBoZWFkZXJzTGlzdCA9IGF3YWl0IGhlYWRlcnMoKVxuICAgIGNvbnN0IGZvcndhcmRlZEZvciA9IGhlYWRlcnNMaXN0LmdldCgneC1mb3J3YXJkZWQtZm9yJylcbiAgICBjb25zdCByZWFsSVAgPSBoZWFkZXJzTGlzdC5nZXQoJ3gtcmVhbC1pcCcpXG4gICAgY29uc3QgY2xpZW50SVAgPSBmb3J3YXJkZWRGb3I/LnNwbGl0KCcsJylbMF0/LnRyaW0oKSB8fCByZWFsSVAgfHwgJ3Vua25vd24nXG4gICAgY29uc3QgcmF0ZUxpbWl0SWQgPSBgbG9naW46Y29tcGFueToke2NvbXBhbnlJZH06JHtjbGllbnRJUH1gXG4gICAgY29uc3QgcmF0ZUxpbWl0UmVzdWx0ID0gYXdhaXQgcmF0ZUxpbWl0KHJhdGVMaW1pdElkLCA1LCAxNSAqIDYwICogMTAwMCkgLy8gNSBhdHRlbXB0cyBwZXIgMTUgbWludXRlc1xuXG4gICAgaWYgKCFyYXRlTGltaXRSZXN1bHQuc3VjY2Vzcykge1xuICAgICAgY29uc3QgcmV0cnlBZnRlciA9IE1hdGguY2VpbCgocmF0ZUxpbWl0UmVzdWx0LnJlc2V0QXQgLSBEYXRlLm5vdygpKSAvIDEwMDApXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6IGBUb28gbWFueSBsb2dpbiBhdHRlbXB0cy4gUGxlYXNlIHRyeSBhZ2FpbiBpbiAke3JldHJ5QWZ0ZXJ9IHNlY29uZHMuYCxcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBHZXQgY29tcGFueSBmcm9tIHNoYXJlZCBjb21wYW5pZXMgY29sbGVjdGlvblxuICAgIGNvbnN0IGNvbXBhbmllc0NvbGxlY3Rpb24gPSBhd2FpdCBnZXRDb21wYW5pZXNDb2xsZWN0aW9uKClcbiAgICBjb25zdCBjb21wYW55ID0gYXdhaXQgY29tcGFuaWVzQ29sbGVjdGlvbi5maW5kT25lKHsgY29tcGFueUlkIH0pXG5cbiAgICAvLyBVc2UgZ2VuZXJpYyBlcnJvciBtZXNzYWdlIHRvIHByZXZlbnQgZW51bWVyYXRpb25cbiAgICBpZiAoIWNvbXBhbnkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYENvbXBhbnkgbm90IGZvdW5kOiAke2NvbXBhbnlJZH1gKVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIGVycm9yOiBcIkludmFsaWQgY3JlZGVudGlhbHNcIixcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWNvbXBhbnkucGFzc3dvcmQpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYENvbXBhbnkgZm91bmQgYnV0IG5vIHBhc3N3b3JkIHNldDogJHtjb21wYW55SWR9YClcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBlcnJvcjogXCJJbnZhbGlkIGNyZWRlbnRpYWxzXCIsXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVmVyaWZ5IHBhc3N3b3JkIHdpdGggYmNyeXB0XG4gICAgY29uc3QgaXNWYWxpZCA9IGF3YWl0IGJjcnlwdC5jb21wYXJlKHBhc3N3b3JkLCBjb21wYW55LnBhc3N3b3JkKVxuICAgIGlmICghaXNWYWxpZCkge1xuICAgICAgY29uc29sZS5lcnJvcihgUGFzc3dvcmQgbWlzbWF0Y2ggZm9yIGNvbXBhbnk6ICR7Y29tcGFueUlkfWApXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6IFwiSW52YWxpZCBjcmVkZW50aWFsc1wiLFxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNldCBzZXNzaW9uIHdpdGggY29tcGFueUlkIG9ubHkgKHBhcnRpYWwgc2Vzc2lvbilcbiAgICBhd2FpdCBzZXRDb21wYW55U2Vzc2lvbihjb21wYW55SWQpXG5cbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc3QgaGFuZGxlZCA9IGhhbmRsZUVycm9yKGVycm9yKVxuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgIGVycm9yOiBoYW5kbGVkLm1lc3NhZ2UsXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogU2VsZWN0IHdvcmtlciAtIHNldHMgd29ya2VySWQgaW4gZXhpc3RpbmcgY29tcGFueSBzZXNzaW9uXG4gKiBObyBwYXNzd29yZCByZXF1aXJlZCAoY29tcGFueSBhbHJlYWR5IGF1dGhlbnRpY2F0ZWQpXG4gKiBTRUNVUklUWTogY29tcGFueUlkIGlzIHJldHJpZXZlZCBmcm9tIHNlc3Npb24sIE5PVCBmcm9tIGNsaWVudFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VsZWN0V29ya2VyKFxuICB3b3JrZXJJZDogc3RyaW5nXG4pOiBQcm9taXNlPExvZ2luUmVzdWx0PiB7XG4gIHRyeSB7XG4gICAgLy8gVmFsaWRhdGUgaW5wdXRcbiAgICBjb25zdCB2YWxpZGF0aW9uID0gc2VsZWN0V29ya2VyU2NoZW1hLnNhZmVQYXJzZSh7IHdvcmtlcklkIH0pXG4gICAgaWYgKCF2YWxpZGF0aW9uLnN1Y2Nlc3MpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBlcnJvcjogXCJJbnZhbGlkIHdvcmtlciBJRFwiLFxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIENSSVRJQ0FMOiBHZXQgY29tcGFueUlkIGZyb20gc2Vzc2lvbiwgbm90IGZyb20gY2xpZW50XG4gICAgY29uc3Qgc2Vzc2lvbkNvbXBhbnlJZCA9IGF3YWl0IGdldEFjdGl2ZUNvbXBhbnkoKVxuXG4gICAgLy8gR2V0IGNvbXBhbnktc2NvcGVkIHdvcmtlcnMgY29sbGVjdGlvbiB1c2luZyBzZXNzaW9uIGNvbXBhbnlJZFxuICAgIGNvbnN0IHdvcmtlcnNDb2xsZWN0aW9uID0gYXdhaXQgZ2V0Q29tcGFueUNvbGxlY3Rpb248V29ya2VyV2l0aFBhc3N3b3JkPihcbiAgICAgIHNlc3Npb25Db21wYW55SWQsXG4gICAgICBcIndvcmtlcnNcIlxuICAgIClcblxuICAgIC8vIEZpbmQgdGhlIHdvcmtlciBpbiB0aGUgY29tcGFueSdzIGNvbGxlY3Rpb25cbiAgICBjb25zdCB3b3JrZXIgPSBhd2FpdCB3b3JrZXJzQ29sbGVjdGlvbi5maW5kT25lKHsgaWQ6IHdvcmtlcklkIH0pXG5cbiAgICAvLyBWZXJpZnkgd29ya2VyIGV4aXN0cyBhbmQgYmVsb25ncyB0byB0aGUgc2Vzc2lvbiBjb21wYW55XG4gICAgaWYgKCF3b3JrZXIgfHwgd29ya2VyLmNvbXBhbnlJZCAhPT0gc2Vzc2lvbkNvbXBhbnlJZCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIGVycm9yOiBcIldvcmtlciBub3QgZm91bmRcIixcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTZXQgd29ya2VySWQgaW4gZXhpc3RpbmcgY29tcGFueSBzZXNzaW9uXG4gICAgYXdhaXQgc2V0V29ya2VySW5TZXNzaW9uKHdvcmtlcklkKVxuXG4gICAgLy8gUmVjb3JkIGxvZ2luIHNlc3Npb24gaW4gY29tcGFueSdzIHNlc3Npb25zIGNvbGxlY3Rpb25cbiAgICBjb25zdCBzZXNzaW9uc0NvbGxlY3Rpb24gPSBhd2FpdCBnZXRDb21wYW55Q29sbGVjdGlvbihzZXNzaW9uQ29tcGFueUlkLCBcInNlc3Npb25zXCIpXG4gICAgYXdhaXQgc2Vzc2lvbnNDb2xsZWN0aW9uLmluc2VydE9uZSh7XG4gICAgICB3b3JrZXJJZCxcbiAgICAgIGNvbXBhbnlJZDogc2Vzc2lvbkNvbXBhbnlJZCxcbiAgICAgIGxvZ2luQXQ6IG5ldyBEYXRlKCksXG4gICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCksXG4gICAgfSlcblxuICAgIC8vIFJlZGlyZWN0IHRvIGRhc2hib2FyZCAodGhpcyB3aWxsIHRocm93LCB3aGljaCBpcyBleHBlY3RlZCBpbiBOZXh0LmpzKVxuICAgIHJlZGlyZWN0KFwiL1wiKVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIC8vIElmIGl0J3MgYSByZWRpcmVjdCBlcnJvciwgbGV0IGl0IHByb3BhZ2F0ZVxuICAgIGlmIChlcnJvciAmJiB0eXBlb2YgZXJyb3IgPT09IFwib2JqZWN0XCIgJiYgXCJkaWdlc3RcIiBpbiBlcnJvcikge1xuICAgICAgdGhyb3cgZXJyb3JcbiAgICB9XG5cbiAgICBjb25zdCBoYW5kbGVkID0gaGFuZGxlRXJyb3IoZXJyb3IpXG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgZXJyb3I6IGhhbmRsZWQubWVzc2FnZSxcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBMZWdhY3k6IExvZ2luIHdvcmtlciAtIHZlcmlmaWVzIGNyZWRlbnRpYWxzIGFnYWluc3QgY29tcGFueS1zY29wZWQgd29ya2VyIGNvbGxlY3Rpb25cbiAqIFNldHMgc2Vzc2lvbiB3aXRoIGNvbXBhbnlJZCBhbmQgd29ya2VySWQgb24gc3VjY2Vzc1xuICogQGRlcHJlY2F0ZWQgVXNlIGxvZ2luQ29tcGFueSArIHNlbGVjdFdvcmtlciBpbnN0ZWFkXG4gKiBJbmNsdWRlcyByYXRlIGxpbWl0aW5nIGFuZCBiY3J5cHQgcGFzc3dvcmQgdmVyaWZpY2F0aW9uXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2dpbldvcmtlcihcbiAgY29tcGFueUlkOiBzdHJpbmcsXG4gIHdvcmtlcklkOiBzdHJpbmcsXG4gIHBhc3N3b3JkOiBzdHJpbmdcbik6IFByb21pc2U8TG9naW5SZXN1bHQ+IHtcbiAgdHJ5IHtcbiAgICAvLyBWYWxpZGF0ZSBpbnB1dFxuICAgIGNvbnN0IHZhbGlkYXRpb24gPSBsb2dpbldvcmtlclNjaGVtYS5zYWZlUGFyc2UoeyBjb21wYW55SWQsIHdvcmtlcklkLCBwYXNzd29yZCB9KVxuICAgIGlmICghdmFsaWRhdGlvbi5zdWNjZXNzKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6IFwiSW52YWxpZCBpbnB1dC4gUGxlYXNlIGNoZWNrIHlvdXIgY3JlZGVudGlhbHMuXCIsXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmF0ZSBsaW1pdGluZyAtIGdldCBJUCBmcm9tIGhlYWRlcnNcbiAgICBjb25zdCBoZWFkZXJzTGlzdCA9IGF3YWl0IGhlYWRlcnMoKVxuICAgIGNvbnN0IGZvcndhcmRlZEZvciA9IGhlYWRlcnNMaXN0LmdldCgneC1mb3J3YXJkZWQtZm9yJylcbiAgICBjb25zdCByZWFsSVAgPSBoZWFkZXJzTGlzdC5nZXQoJ3gtcmVhbC1pcCcpXG4gICAgY29uc3QgY2xpZW50SVAgPSBmb3J3YXJkZWRGb3I/LnNwbGl0KCcsJylbMF0/LnRyaW0oKSB8fCByZWFsSVAgfHwgJ3Vua25vd24nXG4gICAgY29uc3QgcmF0ZUxpbWl0SWQgPSBgbG9naW46d29ya2VyOiR7Y29tcGFueUlkfToke3dvcmtlcklkfToke2NsaWVudElQfWBcbiAgICBjb25zdCByYXRlTGltaXRSZXN1bHQgPSBhd2FpdCByYXRlTGltaXQocmF0ZUxpbWl0SWQsIDUsIDE1ICogNjAgKiAxMDAwKVxuXG4gICAgaWYgKCFyYXRlTGltaXRSZXN1bHQuc3VjY2Vzcykge1xuICAgICAgY29uc3QgcmV0cnlBZnRlciA9IE1hdGguY2VpbCgocmF0ZUxpbWl0UmVzdWx0LnJlc2V0QXQgLSBEYXRlLm5vdygpKSAvIDEwMDApXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6IGBUb28gbWFueSBsb2dpbiBhdHRlbXB0cy4gUGxlYXNlIHRyeSBhZ2FpbiBpbiAke3JldHJ5QWZ0ZXJ9IHNlY29uZHMuYCxcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBHZXQgY29tcGFueS1zY29wZWQgd29ya2VycyBjb2xsZWN0aW9uXG4gICAgY29uc3Qgd29ya2Vyc0NvbGxlY3Rpb24gPSBhd2FpdCBnZXRDb21wYW55Q29sbGVjdGlvbjxXb3JrZXJXaXRoUGFzc3dvcmQ+KFxuICAgICAgY29tcGFueUlkLFxuICAgICAgXCJ3b3JrZXJzXCJcbiAgICApXG5cbiAgICAvLyBGaW5kIHRoZSB3b3JrZXIgaW4gdGhlIGNvbXBhbnkncyBjb2xsZWN0aW9uXG4gICAgY29uc3Qgd29ya2VyID0gYXdhaXQgd29ya2Vyc0NvbGxlY3Rpb24uZmluZE9uZSh7IGlkOiB3b3JrZXJJZCB9KVxuXG4gICAgLy8gVXNlIGdlbmVyaWMgZXJyb3IgbWVzc2FnZVxuICAgIGlmICghd29ya2VyIHx8IHdvcmtlci5jb21wYW55SWQgIT09IGNvbXBhbnlJZCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIGVycm9yOiBcIkludmFsaWQgY3JlZGVudGlhbHNcIixcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBWZXJpZnkgcGFzc3dvcmQgd2l0aCBiY3J5cHRcbiAgICBpZiAoIXdvcmtlci5wYXNzd29yZCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIGVycm9yOiBcIkludmFsaWQgY3JlZGVudGlhbHNcIixcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBpc1ZhbGlkID0gYXdhaXQgYmNyeXB0LmNvbXBhcmUocGFzc3dvcmQsIHdvcmtlci5wYXNzd29yZClcbiAgICBpZiAoIWlzVmFsaWQpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBlcnJvcjogXCJJbnZhbGlkIGNyZWRlbnRpYWxzXCIsXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gU2V0IHNlc3Npb24gd2l0aCBjb21wYW55SWQgYW5kIHdvcmtlcklkXG4gICAgYXdhaXQgc2V0U2Vzc2lvbihjb21wYW55SWQsIHdvcmtlcklkKVxuXG4gICAgLy8gUmVjb3JkIGxvZ2luIHNlc3Npb24gaW4gY29tcGFueSdzIHNlc3Npb25zIGNvbGxlY3Rpb25cbiAgICBjb25zdCBzZXNzaW9uc0NvbGxlY3Rpb24gPSBhd2FpdCBnZXRDb21wYW55Q29sbGVjdGlvbihjb21wYW55SWQsIFwic2Vzc2lvbnNcIilcbiAgICBhd2FpdCBzZXNzaW9uc0NvbGxlY3Rpb24uaW5zZXJ0T25lKHtcbiAgICAgIHdvcmtlcklkLFxuICAgICAgY29tcGFueUlkLFxuICAgICAgbG9naW5BdDogbmV3IERhdGUoKSxcbiAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKSxcbiAgICB9KVxuXG4gICAgLy8gUmVkaXJlY3QgdG8gZGFzaGJvYXJkICh0aGlzIHdpbGwgdGhyb3csIHdoaWNoIGlzIGV4cGVjdGVkIGluIE5leHQuanMpXG4gICAgcmVkaXJlY3QoXCIvXCIpXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8gSWYgaXQncyBhIHJlZGlyZWN0IGVycm9yLCBsZXQgaXQgcHJvcGFnYXRlXG4gICAgaWYgKGVycm9yICYmIHR5cGVvZiBlcnJvciA9PT0gXCJvYmplY3RcIiAmJiBcImRpZ2VzdFwiIGluIGVycm9yKSB7XG4gICAgICB0aHJvdyBlcnJvclxuICAgIH1cblxuICAgIGNvbnN0IGhhbmRsZWQgPSBoYW5kbGVFcnJvcihlcnJvcilcbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICBlcnJvcjogaGFuZGxlZC5tZXNzYWdlLFxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9nb3V0KCk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCB7IGNsZWFyU2Vzc2lvbiB9ID0gYXdhaXQgaW1wb3J0KFwiLi9zZXNzaW9uXCIpXG4gIFxuICB0cnkge1xuICAgIC8vIENsZWFyIHNlc3Npb24gY29va2llc1xuICAgIGF3YWl0IGNsZWFyU2Vzc2lvbigpXG4gICAgXG4gICAgLy8gSW4gYSByZWFsIGFwcCwgeW91IHdvdWxkIGFsc286XG4gICAgLy8gMS4gSW52YWxpZGF0ZSBzZXNzaW9uIGluIGRhdGFiYXNlXG4gICAgLy8gMi4gTG9nIGxvZ291dCBldmVudFxuICAgIFxuICAgIC8vIFJlZGlyZWN0IHRvIGxvZ2luIHBhZ2VcbiAgICByZWRpcmVjdChcIi9sb2dpblwiKVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIC8vIEV2ZW4gaWYgY2xlYXJpbmcgc2Vzc2lvbiBmYWlscywgdHJ5IHRvIHJlZGlyZWN0XG4gICAgcmVkaXJlY3QoXCIvbG9naW5cIilcbiAgfVxufVxuXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjRSQWlIc0IifQ==
}),
"[project]/lib/auth/data:4954d9 [app-ssr] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"706eaece57029aad276a30b25bf6e85547c101354f":"loginWorker"},"lib/auth/authServer.ts",""] */ __turbopack_context__.s([
    "loginWorker",
    ()=>loginWorker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-ssr] (ecmascript)");
"use turbopack no side effects";
;
var loginWorker = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createServerReference"])("706eaece57029aad276a30b25bf6e85547c101354f", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findSourceMapURL"], "loginWorker"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYXV0aFNlcnZlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzZXJ2ZXJcIlxuXG5pbXBvcnQgeyByZWRpcmVjdCB9IGZyb20gXCJuZXh0L25hdmlnYXRpb25cIlxuaW1wb3J0IHsgaGVhZGVycyB9IGZyb20gXCJuZXh0L2hlYWRlcnNcIlxuaW1wb3J0IGJjcnlwdCBmcm9tIFwiYmNyeXB0anNcIlxuaW1wb3J0IHsgZ2V0Q29tcGFueUNvbGxlY3Rpb24gfSBmcm9tIFwiQC9saWIvZGIvY29tcGFueURiXCJcbmltcG9ydCB7IGdldENvbXBhbmllc0NvbGxlY3Rpb24gfSBmcm9tIFwiQC9saWIvZGIvY29tcGFueURiXCJcbmltcG9ydCB7IHNldFNlc3Npb24sIHNldENvbXBhbnlTZXNzaW9uLCBzZXRXb3JrZXJJblNlc3Npb24sIGdldEFjdGl2ZUNvbXBhbnkgfSBmcm9tIFwiLi9zZXNzaW9uXCJcbmltcG9ydCB7IGxvZ2luQ29tcGFueVNjaGVtYSwgc2VsZWN0V29ya2VyU2NoZW1hLCBsb2dpbldvcmtlclNjaGVtYSB9IGZyb20gXCJAL2xpYi92YWxpZGF0aW9uXCJcbmltcG9ydCB7IHJhdGVMaW1pdCB9IGZyb20gXCJAL2xpYi9yYXRlTGltaXRcIlxuaW1wb3J0IHsgaGFuZGxlRXJyb3IgfSBmcm9tIFwiQC9saWIvZXJyb3JzXCJcblxuaW50ZXJmYWNlIFdvcmtlcldpdGhQYXNzd29yZCB7XG4gIGlkOiBzdHJpbmdcbiAgbmFtZTogc3RyaW5nXG4gIHJvbGU6IHN0cmluZ1xuICBhdmF0YXJDb2xvcjogc3RyaW5nXG4gIGNvbXBhbnlJZDogc3RyaW5nXG4gIHBhc3N3b3JkPzogc3RyaW5nXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTG9naW5SZXN1bHQge1xuICBzdWNjZXNzOiBib29sZWFuXG4gIGVycm9yPzogc3RyaW5nXG4gIHJlZGlyZWN0Pzogc3RyaW5nXG59XG5cbi8qKlxuICogTG9naW4gY29tcGFueSAtIHZlcmlmaWVzIGNvbXBhbnkgcGFzc3dvcmQgd2l0aCBiY3J5cHRcbiAqIFNldHMgc2Vzc2lvbiB3aXRoIGNvbXBhbnlJZCBvbmx5ICh3b3JrZXIgbm90IHNlbGVjdGVkIHlldClcbiAqIEluY2x1ZGVzIHJhdGUgbGltaXRpbmcgYW5kIGlucHV0IHZhbGlkYXRpb25cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvZ2luQ29tcGFueShcbiAgY29tcGFueUlkOiBzdHJpbmcsXG4gIHBhc3N3b3JkOiBzdHJpbmdcbik6IFByb21pc2U8TG9naW5SZXN1bHQ+IHtcbiAgdHJ5IHtcbiAgICAvLyBWYWxpZGF0ZSBpbnB1dCB3aXRoIFpvZFxuICAgIGNvbnN0IHZhbGlkYXRpb24gPSBsb2dpbkNvbXBhbnlTY2hlbWEuc2FmZVBhcnNlKHsgY29tcGFueUlkLCBwYXNzd29yZCB9KVxuICAgIGlmICghdmFsaWRhdGlvbi5zdWNjZXNzKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6IFwiSW52YWxpZCBpbnB1dC4gUGxlYXNlIGNoZWNrIHlvdXIgY3JlZGVudGlhbHMuXCIsXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmF0ZSBsaW1pdGluZyAtIGdldCBJUCBmcm9tIGhlYWRlcnNcbiAgICBjb25zdCBoZWFkZXJzTGlzdCA9IGF3YWl0IGhlYWRlcnMoKVxuICAgIGNvbnN0IGZvcndhcmRlZEZvciA9IGhlYWRlcnNMaXN0LmdldCgneC1mb3J3YXJkZWQtZm9yJylcbiAgICBjb25zdCByZWFsSVAgPSBoZWFkZXJzTGlzdC5nZXQoJ3gtcmVhbC1pcCcpXG4gICAgY29uc3QgY2xpZW50SVAgPSBmb3J3YXJkZWRGb3I/LnNwbGl0KCcsJylbMF0/LnRyaW0oKSB8fCByZWFsSVAgfHwgJ3Vua25vd24nXG4gICAgY29uc3QgcmF0ZUxpbWl0SWQgPSBgbG9naW46Y29tcGFueToke2NvbXBhbnlJZH06JHtjbGllbnRJUH1gXG4gICAgY29uc3QgcmF0ZUxpbWl0UmVzdWx0ID0gYXdhaXQgcmF0ZUxpbWl0KHJhdGVMaW1pdElkLCA1LCAxNSAqIDYwICogMTAwMCkgLy8gNSBhdHRlbXB0cyBwZXIgMTUgbWludXRlc1xuXG4gICAgaWYgKCFyYXRlTGltaXRSZXN1bHQuc3VjY2Vzcykge1xuICAgICAgY29uc3QgcmV0cnlBZnRlciA9IE1hdGguY2VpbCgocmF0ZUxpbWl0UmVzdWx0LnJlc2V0QXQgLSBEYXRlLm5vdygpKSAvIDEwMDApXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6IGBUb28gbWFueSBsb2dpbiBhdHRlbXB0cy4gUGxlYXNlIHRyeSBhZ2FpbiBpbiAke3JldHJ5QWZ0ZXJ9IHNlY29uZHMuYCxcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBHZXQgY29tcGFueSBmcm9tIHNoYXJlZCBjb21wYW5pZXMgY29sbGVjdGlvblxuICAgIGNvbnN0IGNvbXBhbmllc0NvbGxlY3Rpb24gPSBhd2FpdCBnZXRDb21wYW5pZXNDb2xsZWN0aW9uKClcbiAgICBjb25zdCBjb21wYW55ID0gYXdhaXQgY29tcGFuaWVzQ29sbGVjdGlvbi5maW5kT25lKHsgY29tcGFueUlkIH0pXG5cbiAgICAvLyBVc2UgZ2VuZXJpYyBlcnJvciBtZXNzYWdlIHRvIHByZXZlbnQgZW51bWVyYXRpb25cbiAgICBpZiAoIWNvbXBhbnkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYENvbXBhbnkgbm90IGZvdW5kOiAke2NvbXBhbnlJZH1gKVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIGVycm9yOiBcIkludmFsaWQgY3JlZGVudGlhbHNcIixcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWNvbXBhbnkucGFzc3dvcmQpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYENvbXBhbnkgZm91bmQgYnV0IG5vIHBhc3N3b3JkIHNldDogJHtjb21wYW55SWR9YClcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBlcnJvcjogXCJJbnZhbGlkIGNyZWRlbnRpYWxzXCIsXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVmVyaWZ5IHBhc3N3b3JkIHdpdGggYmNyeXB0XG4gICAgY29uc3QgaXNWYWxpZCA9IGF3YWl0IGJjcnlwdC5jb21wYXJlKHBhc3N3b3JkLCBjb21wYW55LnBhc3N3b3JkKVxuICAgIGlmICghaXNWYWxpZCkge1xuICAgICAgY29uc29sZS5lcnJvcihgUGFzc3dvcmQgbWlzbWF0Y2ggZm9yIGNvbXBhbnk6ICR7Y29tcGFueUlkfWApXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6IFwiSW52YWxpZCBjcmVkZW50aWFsc1wiLFxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNldCBzZXNzaW9uIHdpdGggY29tcGFueUlkIG9ubHkgKHBhcnRpYWwgc2Vzc2lvbilcbiAgICBhd2FpdCBzZXRDb21wYW55U2Vzc2lvbihjb21wYW55SWQpXG5cbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc3QgaGFuZGxlZCA9IGhhbmRsZUVycm9yKGVycm9yKVxuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgIGVycm9yOiBoYW5kbGVkLm1lc3NhZ2UsXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogU2VsZWN0IHdvcmtlciAtIHNldHMgd29ya2VySWQgaW4gZXhpc3RpbmcgY29tcGFueSBzZXNzaW9uXG4gKiBObyBwYXNzd29yZCByZXF1aXJlZCAoY29tcGFueSBhbHJlYWR5IGF1dGhlbnRpY2F0ZWQpXG4gKiBTRUNVUklUWTogY29tcGFueUlkIGlzIHJldHJpZXZlZCBmcm9tIHNlc3Npb24sIE5PVCBmcm9tIGNsaWVudFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VsZWN0V29ya2VyKFxuICB3b3JrZXJJZDogc3RyaW5nXG4pOiBQcm9taXNlPExvZ2luUmVzdWx0PiB7XG4gIHRyeSB7XG4gICAgLy8gVmFsaWRhdGUgaW5wdXRcbiAgICBjb25zdCB2YWxpZGF0aW9uID0gc2VsZWN0V29ya2VyU2NoZW1hLnNhZmVQYXJzZSh7IHdvcmtlcklkIH0pXG4gICAgaWYgKCF2YWxpZGF0aW9uLnN1Y2Nlc3MpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBlcnJvcjogXCJJbnZhbGlkIHdvcmtlciBJRFwiLFxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIENSSVRJQ0FMOiBHZXQgY29tcGFueUlkIGZyb20gc2Vzc2lvbiwgbm90IGZyb20gY2xpZW50XG4gICAgY29uc3Qgc2Vzc2lvbkNvbXBhbnlJZCA9IGF3YWl0IGdldEFjdGl2ZUNvbXBhbnkoKVxuXG4gICAgLy8gR2V0IGNvbXBhbnktc2NvcGVkIHdvcmtlcnMgY29sbGVjdGlvbiB1c2luZyBzZXNzaW9uIGNvbXBhbnlJZFxuICAgIGNvbnN0IHdvcmtlcnNDb2xsZWN0aW9uID0gYXdhaXQgZ2V0Q29tcGFueUNvbGxlY3Rpb248V29ya2VyV2l0aFBhc3N3b3JkPihcbiAgICAgIHNlc3Npb25Db21wYW55SWQsXG4gICAgICBcIndvcmtlcnNcIlxuICAgIClcblxuICAgIC8vIEZpbmQgdGhlIHdvcmtlciBpbiB0aGUgY29tcGFueSdzIGNvbGxlY3Rpb25cbiAgICBjb25zdCB3b3JrZXIgPSBhd2FpdCB3b3JrZXJzQ29sbGVjdGlvbi5maW5kT25lKHsgaWQ6IHdvcmtlcklkIH0pXG5cbiAgICAvLyBWZXJpZnkgd29ya2VyIGV4aXN0cyBhbmQgYmVsb25ncyB0byB0aGUgc2Vzc2lvbiBjb21wYW55XG4gICAgaWYgKCF3b3JrZXIgfHwgd29ya2VyLmNvbXBhbnlJZCAhPT0gc2Vzc2lvbkNvbXBhbnlJZCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIGVycm9yOiBcIldvcmtlciBub3QgZm91bmRcIixcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTZXQgd29ya2VySWQgaW4gZXhpc3RpbmcgY29tcGFueSBzZXNzaW9uXG4gICAgYXdhaXQgc2V0V29ya2VySW5TZXNzaW9uKHdvcmtlcklkKVxuXG4gICAgLy8gUmVjb3JkIGxvZ2luIHNlc3Npb24gaW4gY29tcGFueSdzIHNlc3Npb25zIGNvbGxlY3Rpb25cbiAgICBjb25zdCBzZXNzaW9uc0NvbGxlY3Rpb24gPSBhd2FpdCBnZXRDb21wYW55Q29sbGVjdGlvbihzZXNzaW9uQ29tcGFueUlkLCBcInNlc3Npb25zXCIpXG4gICAgYXdhaXQgc2Vzc2lvbnNDb2xsZWN0aW9uLmluc2VydE9uZSh7XG4gICAgICB3b3JrZXJJZCxcbiAgICAgIGNvbXBhbnlJZDogc2Vzc2lvbkNvbXBhbnlJZCxcbiAgICAgIGxvZ2luQXQ6IG5ldyBEYXRlKCksXG4gICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCksXG4gICAgfSlcblxuICAgIC8vIFJlZGlyZWN0IHRvIGRhc2hib2FyZCAodGhpcyB3aWxsIHRocm93LCB3aGljaCBpcyBleHBlY3RlZCBpbiBOZXh0LmpzKVxuICAgIHJlZGlyZWN0KFwiL1wiKVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIC8vIElmIGl0J3MgYSByZWRpcmVjdCBlcnJvciwgbGV0IGl0IHByb3BhZ2F0ZVxuICAgIGlmIChlcnJvciAmJiB0eXBlb2YgZXJyb3IgPT09IFwib2JqZWN0XCIgJiYgXCJkaWdlc3RcIiBpbiBlcnJvcikge1xuICAgICAgdGhyb3cgZXJyb3JcbiAgICB9XG5cbiAgICBjb25zdCBoYW5kbGVkID0gaGFuZGxlRXJyb3IoZXJyb3IpXG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgZXJyb3I6IGhhbmRsZWQubWVzc2FnZSxcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBMZWdhY3k6IExvZ2luIHdvcmtlciAtIHZlcmlmaWVzIGNyZWRlbnRpYWxzIGFnYWluc3QgY29tcGFueS1zY29wZWQgd29ya2VyIGNvbGxlY3Rpb25cbiAqIFNldHMgc2Vzc2lvbiB3aXRoIGNvbXBhbnlJZCBhbmQgd29ya2VySWQgb24gc3VjY2Vzc1xuICogQGRlcHJlY2F0ZWQgVXNlIGxvZ2luQ29tcGFueSArIHNlbGVjdFdvcmtlciBpbnN0ZWFkXG4gKiBJbmNsdWRlcyByYXRlIGxpbWl0aW5nIGFuZCBiY3J5cHQgcGFzc3dvcmQgdmVyaWZpY2F0aW9uXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2dpbldvcmtlcihcbiAgY29tcGFueUlkOiBzdHJpbmcsXG4gIHdvcmtlcklkOiBzdHJpbmcsXG4gIHBhc3N3b3JkOiBzdHJpbmdcbik6IFByb21pc2U8TG9naW5SZXN1bHQ+IHtcbiAgdHJ5IHtcbiAgICAvLyBWYWxpZGF0ZSBpbnB1dFxuICAgIGNvbnN0IHZhbGlkYXRpb24gPSBsb2dpbldvcmtlclNjaGVtYS5zYWZlUGFyc2UoeyBjb21wYW55SWQsIHdvcmtlcklkLCBwYXNzd29yZCB9KVxuICAgIGlmICghdmFsaWRhdGlvbi5zdWNjZXNzKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6IFwiSW52YWxpZCBpbnB1dC4gUGxlYXNlIGNoZWNrIHlvdXIgY3JlZGVudGlhbHMuXCIsXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmF0ZSBsaW1pdGluZyAtIGdldCBJUCBmcm9tIGhlYWRlcnNcbiAgICBjb25zdCBoZWFkZXJzTGlzdCA9IGF3YWl0IGhlYWRlcnMoKVxuICAgIGNvbnN0IGZvcndhcmRlZEZvciA9IGhlYWRlcnNMaXN0LmdldCgneC1mb3J3YXJkZWQtZm9yJylcbiAgICBjb25zdCByZWFsSVAgPSBoZWFkZXJzTGlzdC5nZXQoJ3gtcmVhbC1pcCcpXG4gICAgY29uc3QgY2xpZW50SVAgPSBmb3J3YXJkZWRGb3I/LnNwbGl0KCcsJylbMF0/LnRyaW0oKSB8fCByZWFsSVAgfHwgJ3Vua25vd24nXG4gICAgY29uc3QgcmF0ZUxpbWl0SWQgPSBgbG9naW46d29ya2VyOiR7Y29tcGFueUlkfToke3dvcmtlcklkfToke2NsaWVudElQfWBcbiAgICBjb25zdCByYXRlTGltaXRSZXN1bHQgPSBhd2FpdCByYXRlTGltaXQocmF0ZUxpbWl0SWQsIDUsIDE1ICogNjAgKiAxMDAwKVxuXG4gICAgaWYgKCFyYXRlTGltaXRSZXN1bHQuc3VjY2Vzcykge1xuICAgICAgY29uc3QgcmV0cnlBZnRlciA9IE1hdGguY2VpbCgocmF0ZUxpbWl0UmVzdWx0LnJlc2V0QXQgLSBEYXRlLm5vdygpKSAvIDEwMDApXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6IGBUb28gbWFueSBsb2dpbiBhdHRlbXB0cy4gUGxlYXNlIHRyeSBhZ2FpbiBpbiAke3JldHJ5QWZ0ZXJ9IHNlY29uZHMuYCxcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBHZXQgY29tcGFueS1zY29wZWQgd29ya2VycyBjb2xsZWN0aW9uXG4gICAgY29uc3Qgd29ya2Vyc0NvbGxlY3Rpb24gPSBhd2FpdCBnZXRDb21wYW55Q29sbGVjdGlvbjxXb3JrZXJXaXRoUGFzc3dvcmQ+KFxuICAgICAgY29tcGFueUlkLFxuICAgICAgXCJ3b3JrZXJzXCJcbiAgICApXG5cbiAgICAvLyBGaW5kIHRoZSB3b3JrZXIgaW4gdGhlIGNvbXBhbnkncyBjb2xsZWN0aW9uXG4gICAgY29uc3Qgd29ya2VyID0gYXdhaXQgd29ya2Vyc0NvbGxlY3Rpb24uZmluZE9uZSh7IGlkOiB3b3JrZXJJZCB9KVxuXG4gICAgLy8gVXNlIGdlbmVyaWMgZXJyb3IgbWVzc2FnZVxuICAgIGlmICghd29ya2VyIHx8IHdvcmtlci5jb21wYW55SWQgIT09IGNvbXBhbnlJZCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIGVycm9yOiBcIkludmFsaWQgY3JlZGVudGlhbHNcIixcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBWZXJpZnkgcGFzc3dvcmQgd2l0aCBiY3J5cHRcbiAgICBpZiAoIXdvcmtlci5wYXNzd29yZCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIGVycm9yOiBcIkludmFsaWQgY3JlZGVudGlhbHNcIixcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBpc1ZhbGlkID0gYXdhaXQgYmNyeXB0LmNvbXBhcmUocGFzc3dvcmQsIHdvcmtlci5wYXNzd29yZClcbiAgICBpZiAoIWlzVmFsaWQpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBlcnJvcjogXCJJbnZhbGlkIGNyZWRlbnRpYWxzXCIsXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gU2V0IHNlc3Npb24gd2l0aCBjb21wYW55SWQgYW5kIHdvcmtlcklkXG4gICAgYXdhaXQgc2V0U2Vzc2lvbihjb21wYW55SWQsIHdvcmtlcklkKVxuXG4gICAgLy8gUmVjb3JkIGxvZ2luIHNlc3Npb24gaW4gY29tcGFueSdzIHNlc3Npb25zIGNvbGxlY3Rpb25cbiAgICBjb25zdCBzZXNzaW9uc0NvbGxlY3Rpb24gPSBhd2FpdCBnZXRDb21wYW55Q29sbGVjdGlvbihjb21wYW55SWQsIFwic2Vzc2lvbnNcIilcbiAgICBhd2FpdCBzZXNzaW9uc0NvbGxlY3Rpb24uaW5zZXJ0T25lKHtcbiAgICAgIHdvcmtlcklkLFxuICAgICAgY29tcGFueUlkLFxuICAgICAgbG9naW5BdDogbmV3IERhdGUoKSxcbiAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKSxcbiAgICB9KVxuXG4gICAgLy8gUmVkaXJlY3QgdG8gZGFzaGJvYXJkICh0aGlzIHdpbGwgdGhyb3csIHdoaWNoIGlzIGV4cGVjdGVkIGluIE5leHQuanMpXG4gICAgcmVkaXJlY3QoXCIvXCIpXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8gSWYgaXQncyBhIHJlZGlyZWN0IGVycm9yLCBsZXQgaXQgcHJvcGFnYXRlXG4gICAgaWYgKGVycm9yICYmIHR5cGVvZiBlcnJvciA9PT0gXCJvYmplY3RcIiAmJiBcImRpZ2VzdFwiIGluIGVycm9yKSB7XG4gICAgICB0aHJvdyBlcnJvclxuICAgIH1cblxuICAgIGNvbnN0IGhhbmRsZWQgPSBoYW5kbGVFcnJvcihlcnJvcilcbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICBlcnJvcjogaGFuZGxlZC5tZXNzYWdlLFxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9nb3V0KCk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCB7IGNsZWFyU2Vzc2lvbiB9ID0gYXdhaXQgaW1wb3J0KFwiLi9zZXNzaW9uXCIpXG4gIFxuICB0cnkge1xuICAgIC8vIENsZWFyIHNlc3Npb24gY29va2llc1xuICAgIGF3YWl0IGNsZWFyU2Vzc2lvbigpXG4gICAgXG4gICAgLy8gSW4gYSByZWFsIGFwcCwgeW91IHdvdWxkIGFsc286XG4gICAgLy8gMS4gSW52YWxpZGF0ZSBzZXNzaW9uIGluIGRhdGFiYXNlXG4gICAgLy8gMi4gTG9nIGxvZ291dCBldmVudFxuICAgIFxuICAgIC8vIFJlZGlyZWN0IHRvIGxvZ2luIHBhZ2VcbiAgICByZWRpcmVjdChcIi9sb2dpblwiKVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIC8vIEV2ZW4gaWYgY2xlYXJpbmcgc2Vzc2lvbiBmYWlscywgdHJ5IHRvIHJlZGlyZWN0XG4gICAgcmVkaXJlY3QoXCIvbG9naW5cIilcbiAgfVxufVxuXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjJSQW9Mc0IifQ==
}),
"[project]/lib/auth/authClient.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "handleCompanyLogin",
    ()=>handleCompanyLogin,
    "handleLogin",
    ()=>handleLogin,
    "handleWorkerSelect",
    ()=>handleWorkerSelect
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$data$3a$fa0fac__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/lib/auth/data:fa0fac [app-ssr] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$data$3a$b18de8__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/lib/auth/data:b18de8 [app-ssr] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$data$3a$4954d9__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/lib/auth/data:4954d9 [app-ssr] (ecmascript) <text/javascript>");
"use client";
;
async function handleCompanyLogin(params) {
    try {
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$data$3a$fa0fac__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["loginCompany"])(params.companyId, params.password);
        return result;
    } catch (error) {
        // Handle actual errors
        if (error instanceof Error) {
            return {
                success: false,
                error: error.message || "Login failed"
            };
        }
        return {
            success: false,
            error: "An unexpected error occurred"
        };
    }
}
async function handleWorkerSelect(params) {
    try {
        // Only send workerId - server gets companyId from session
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$data$3a$b18de8__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["selectWorker"])(params.workerId);
        // If redirect is returned, handle it client-side
        if (result.redirect) {
            // Use window.location for client-side redirect
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            return {
                success: true
            };
        }
        return result;
    } catch (error) {
        // Handle redirect errors (Next.js redirect throws)
        if (error && typeof error === "object" && "digest" in error) {
            // This is a Next.js redirect, which means success
            // Trigger client-side redirect
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            return {
                success: true
            };
        }
        // Handle actual errors
        if (error instanceof Error) {
            return {
                success: false,
                error: error.message || "Failed to select worker"
            };
        }
        return {
            success: false,
            error: "An unexpected error occurred"
        };
    }
}
async function handleLogin(params) {
    try {
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$data$3a$4954d9__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["loginWorker"])(params.companyId, params.workerId, params.password);
        // If redirect is returned, handle it client-side
        if (result.redirect) {
            // Use window.location for client-side redirect
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            return {
                success: true
            };
        }
        return result;
    } catch (error) {
        // Handle redirect errors (Next.js redirect throws)
        if (error && typeof error === "object" && "digest" in error) {
            // This is a Next.js redirect, which means success
            // Trigger client-side redirect
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            return {
                success: true
            };
        }
        // Handle actual errors
        if (error instanceof Error) {
            return {
                success: false,
                error: error.message || "Login failed"
            };
        }
        return {
            success: false,
            error: "An unexpected error occurred"
        };
    }
}
}),
"[project]/components/auth/CompanyLoginForm.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CompanyLoginForm",
    ()=>CompanyLoginForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/input.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/label.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$authClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/authClient.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
function CompanyLoginForm({ companies, onSuccess }) {
    const [companyInput, setCompanyInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [password, setPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoggingIn, setIsLoggingIn] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleSubmit = async (e)=>{
        e.preventDefault();
        if (!companyInput.trim() || !password.trim()) {
            setError("Please enter company name and password");
            return;
        }
        // Find company by name or companyId (case-insensitive)
        const company = companies.find((c)=>c.name.toLowerCase() === companyInput.trim().toLowerCase() || c.companyId.toLowerCase() === companyInput.trim().toLowerCase());
        if (!company) {
            setError("Company not found. Please check the company name.");
            setPassword(""); // Clear password on error
            return;
        }
        setError(null);
        setIsLoggingIn(true);
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$authClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleCompanyLogin"])({
                companyId: company.companyId,
                password: password.trim()
            });
            if (!result.success) {
                setError(result.error || "Login failed");
                setPassword(""); // Clear password on error
            } else {
                // Success - call onSuccess with companyId
                onSuccess(company.companyId);
            }
        } catch (err) {
            setError("An unexpected error occurred");
            setPassword("");
        } finally{
            setIsLoggingIn(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center space-y-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-2xl font-bold text-gray-900",
                        children: "Company Login"
                    }, void 0, false, {
                        fileName: "[project]/components/auth/CompanyLoginForm.tsx",
                        lineNumber: 73,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-gray-600",
                        children: "Enter your company name and password to continue."
                    }, void 0, false, {
                        fileName: "[project]/components/auth/CompanyLoginForm.tsx",
                        lineNumber: 76,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/auth/CompanyLoginForm.tsx",
                lineNumber: 72,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: handleSubmit,
                className: "space-y-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Label"], {
                                htmlFor: "company",
                                className: "text-sm font-medium text-gray-700",
                                children: "Company Name"
                            }, void 0, false, {
                                fileName: "[project]/components/auth/CompanyLoginForm.tsx",
                                lineNumber: 83,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                                id: "company",
                                type: "text",
                                value: companyInput,
                                onChange: (e)=>{
                                    setCompanyInput(e.target.value);
                                    setError(null); // Clear error when typing
                                },
                                disabled: isLoggingIn,
                                className: "mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                                placeholder: "Enter company name",
                                autoFocus: true
                            }, void 0, false, {
                                fileName: "[project]/components/auth/CompanyLoginForm.tsx",
                                lineNumber: 86,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/auth/CompanyLoginForm.tsx",
                        lineNumber: 82,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Label"], {
                                htmlFor: "password",
                                className: "text-sm font-medium text-gray-700",
                                children: "Company Password"
                            }, void 0, false, {
                                fileName: "[project]/components/auth/CompanyLoginForm.tsx",
                                lineNumber: 102,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                                id: "password",
                                type: "password",
                                value: password,
                                onChange: (e)=>{
                                    setPassword(e.target.value);
                                    setError(null); // Clear error when typing
                                },
                                disabled: isLoggingIn,
                                className: "mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                                placeholder: "Enter company password"
                            }, void 0, false, {
                                fileName: "[project]/components/auth/CompanyLoginForm.tsx",
                                lineNumber: 105,
                                columnNumber: 11
                            }, this),
                            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-2 text-sm text-red-600",
                                children: error
                            }, void 0, false, {
                                fileName: "[project]/components/auth/CompanyLoginForm.tsx",
                                lineNumber: 118,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/auth/CompanyLoginForm.tsx",
                        lineNumber: 101,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                type: "submit",
                                disabled: !companyInput.trim() || !password.trim() || isLoggingIn,
                                className: "w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed",
                                children: isLoggingIn ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                            className: "w-4 h-4 mr-2 animate-spin"
                                        }, void 0, false, {
                                            fileName: "[project]/components/auth/CompanyLoginForm.tsx",
                                            lineNumber: 130,
                                            columnNumber: 17
                                        }, this),
                                        "Logging in..."
                                    ]
                                }, void 0, true) : "Continue"
                            }, void 0, false, {
                                fileName: "[project]/components/auth/CompanyLoginForm.tsx",
                                lineNumber: 123,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "text-sm text-gray-500 hover:text-gray-700 transition-colors",
                                children: "Forgot password?"
                            }, void 0, false, {
                                fileName: "[project]/components/auth/CompanyLoginForm.tsx",
                                lineNumber: 137,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/auth/CompanyLoginForm.tsx",
                        lineNumber: 122,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/auth/CompanyLoginForm.tsx",
                lineNumber: 81,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/auth/CompanyLoginForm.tsx",
        lineNumber: 71,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/auth/WorkerSelector.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WorkerSelector",
    ()=>WorkerSelector
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/label.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$authClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/authClient.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
function WorkerSelector({ companyName, workers, selectedWorkerId, onSelect, onBack, isLoading: isLoadingWorkers = false }) {
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isSelecting, setIsSelecting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const selectedWorker = workers.find((w)=>w.id === selectedWorkerId);
    const handleWorkerClick = async (workerId)=>{
        // Immediately select the worker visually
        onSelect(workerId);
        setError(null);
        // Auto-submit after selection
        setIsSelecting(true);
        try {
            // SECURITY: Only send workerId - server gets companyId from session
            // This prevents client-side manipulation of companyId
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$authClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleWorkerSelect"])({
                workerId
            });
            if (!result.success) {
                setError(result.error || "Failed to select worker");
            // Don't deselect on error - keep the visual selection
            }
        // If success, redirect happens in authServer
        } catch (err) {
            setError("An unexpected error occurred");
        // Don't deselect on error - keep the visual selection
        } finally{
            setIsSelecting(false);
        }
    };
    const getInitials = (name)=>{
        return name.split(" ").map((n)=>n[0]).join("").toUpperCase().slice(0, 2);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onBack,
                className: "flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: "w-4 h-4",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeWidth: 2,
                            d: "M15 19l-7-7 7-7"
                        }, void 0, false, {
                            fileName: "[project]/components/auth/WorkerSelector.tsx",
                            lineNumber: 82,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/auth/WorkerSelector.tsx",
                        lineNumber: 76,
                        columnNumber: 9
                    }, this),
                    "Back to company password"
                ]
            }, void 0, true, {
                fileName: "[project]/components/auth/WorkerSelector.tsx",
                lineNumber: 72,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center space-y-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-2xl font-bold text-gray-900",
                        children: "Select Worker Account"
                    }, void 0, false, {
                        fileName: "[project]/components/auth/WorkerSelector.tsx",
                        lineNumber: 93,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-gray-600",
                        children: "Choose your worker profile to continue."
                    }, void 0, false, {
                        fileName: "[project]/components/auth/WorkerSelector.tsx",
                        lineNumber: 96,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/auth/WorkerSelector.tsx",
                lineNumber: 92,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Label"], {
                                className: "text-sm font-medium text-gray-700 mb-3 block",
                                children: "Available Workers"
                            }, void 0, false, {
                                fileName: "[project]/components/auth/WorkerSelector.tsx",
                                lineNumber: 104,
                                columnNumber: 11
                            }, this),
                            isLoadingWorkers ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center py-8 text-gray-500",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                        className: "w-6 h-6 animate-spin mx-auto mb-2"
                                    }, void 0, false, {
                                        fileName: "[project]/components/auth/WorkerSelector.tsx",
                                        lineNumber: 109,
                                        columnNumber: 15
                                    }, this),
                                    "Loading workers..."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/auth/WorkerSelector.tsx",
                                lineNumber: 108,
                                columnNumber: 13
                            }, this) : workers.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center py-8 text-gray-500",
                                children: "No workers found for this company"
                            }, void 0, false, {
                                fileName: "[project]/components/auth/WorkerSelector.tsx",
                                lineNumber: 113,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3",
                                children: workers.map((worker)=>{
                                    const isSelected = selectedWorkerId === worker.id;
                                    const isProcessing = isSelected && isSelecting;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                                        onClick: ()=>!isSelecting && handleWorkerClick(worker.id),
                                        className: `
                      p-4 cursor-pointer transition-all duration-200
                      ${isSelected ? "border-2 border-blue-600 bg-blue-50 shadow-md" : "border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"}
                      ${isSelecting ? "opacity-50 cursor-wait" : ""}
                    `,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `
                          w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm
                          ${worker.avatarColor}
                        `,
                                                    children: getInitials(worker.name)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/auth/WorkerSelector.tsx",
                                                    lineNumber: 135,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1 min-w-0",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "font-medium text-gray-900 truncate",
                                                            children: worker.name
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/auth/WorkerSelector.tsx",
                                                            lineNumber: 144,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs text-gray-600",
                                                            children: worker.role
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/auth/WorkerSelector.tsx",
                                                            lineNumber: 147,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/auth/WorkerSelector.tsx",
                                                    lineNumber: 143,
                                                    columnNumber: 23
                                                }, this),
                                                isSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-2 flex-shrink-0",
                                                    children: isProcessing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                        className: "w-4 h-4 animate-spin text-blue-600"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/auth/WorkerSelector.tsx",
                                                        lineNumber: 152,
                                                        columnNumber: 29
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                            className: "w-3 h-3 text-white",
                                                            fill: "none",
                                                            stroke: "currentColor",
                                                            viewBox: "0 0 24 24",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                strokeLinecap: "round",
                                                                strokeLinejoin: "round",
                                                                strokeWidth: 2,
                                                                d: "M5 13l4 4L19 7"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/auth/WorkerSelector.tsx",
                                                                lineNumber: 161,
                                                                columnNumber: 33
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/auth/WorkerSelector.tsx",
                                                            lineNumber: 155,
                                                            columnNumber: 31
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/auth/WorkerSelector.tsx",
                                                        lineNumber: 154,
                                                        columnNumber: 29
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/auth/WorkerSelector.tsx",
                                                    lineNumber: 150,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/auth/WorkerSelector.tsx",
                                            lineNumber: 134,
                                            columnNumber: 21
                                        }, this)
                                    }, worker.id, false, {
                                        fileName: "[project]/components/auth/WorkerSelector.tsx",
                                        lineNumber: 122,
                                        columnNumber: 19
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/components/auth/WorkerSelector.tsx",
                                lineNumber: 117,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/auth/WorkerSelector.tsx",
                        lineNumber: 103,
                        columnNumber: 9
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-3 bg-red-50 border border-red-200 rounded-lg",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-red-600",
                            children: error
                        }, void 0, false, {
                            fileName: "[project]/components/auth/WorkerSelector.tsx",
                            lineNumber: 182,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/auth/WorkerSelector.tsx",
                        lineNumber: 181,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/auth/WorkerSelector.tsx",
                lineNumber: 101,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/auth/WorkerSelector.tsx",
        lineNumber: 71,
        columnNumber: 5
    }, this);
}
}),
"[project]/lib/companies/data:e797ca [app-ssr] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"40a0f5fbdc65e39265f0539e0044af3d7c60b4fca8":"getCompanyWorkers"},"lib/companies/workers.ts",""] */ __turbopack_context__.s([
    "getCompanyWorkers",
    ()=>getCompanyWorkers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-ssr] (ecmascript)");
"use turbopack no side effects";
;
var getCompanyWorkers = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createServerReference"])("40a0f5fbdc65e39265f0539e0044af3d7c60b4fca8", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findSourceMapURL"], "getCompanyWorkers"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vd29ya2Vycy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzZXJ2ZXJcIlxuXG5pbXBvcnQgeyBnZXRDb21wYW55Q29sbGVjdGlvbiB9IGZyb20gXCJAL2xpYi9kYi9jb21wYW55RGJcIlxuaW1wb3J0IHR5cGUgeyBXb3JrZXIgfSBmcm9tIFwiQC9saWIvYXV0aC9tb2NrRGF0YVwiXG5cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2VyV2l0aFBhc3N3b3JkIGV4dGVuZHMgV29ya2VyIHtcbiAgcGFzc3dvcmQ/OiBzdHJpbmdcbn1cblxuLyoqXG4gKiBHZXQgYWxsIHdvcmtlcnMgZm9yIGEgc3BlY2lmaWMgY29tcGFueVxuICogUmVhZHMgZnJvbSBjb21wYW55LXNjb3BlZCB3b3JrZXJzIGNvbGxlY3Rpb25cbiAqIFNlcmlhbGl6ZXMgTW9uZ29EQiBkb2N1bWVudHMgdG8gcGxhaW4gb2JqZWN0cyBmb3IgQ2xpZW50IENvbXBvbmVudHNcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldENvbXBhbnlXb3JrZXJzKGNvbXBhbnlJZDogc3RyaW5nKTogUHJvbWlzZTxXb3JrZXJbXT4ge1xuICBjb25zdCB3b3JrZXJzQ29sbGVjdGlvbiA9IGF3YWl0IGdldENvbXBhbnlDb2xsZWN0aW9uPFdvcmtlcldpdGhQYXNzd29yZD4oXG4gICAgY29tcGFueUlkLFxuICAgIFwid29ya2Vyc1wiXG4gIClcblxuICBjb25zdCB3b3JrZXJzID0gYXdhaXQgd29ya2Vyc0NvbGxlY3Rpb24uZmluZCh7fSkudG9BcnJheSgpXG5cbiAgLy8gU2VyaWFsaXplIE1vbmdvREIgZG9jdW1lbnRzIGFuZCByZW1vdmUgcGFzc3dvcmQgZnJvbSByZXNwb25zZVxuICByZXR1cm4gd29ya2Vycy5tYXAoKHdvcmtlcjogYW55KSA9PiB7XG4gICAgY29uc3QgeyBwYXNzd29yZCwgX2lkLCAuLi53b3JrZXJEYXRhIH0gPSB3b3JrZXJcbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IHdvcmtlckRhdGEuaWQsXG4gICAgICBuYW1lOiB3b3JrZXJEYXRhLm5hbWUsXG4gICAgICByb2xlOiB3b3JrZXJEYXRhLnJvbGUsXG4gICAgICBhdmF0YXJDb2xvcjogd29ya2VyRGF0YS5hdmF0YXJDb2xvcixcbiAgICAgIGNvbXBhbnlJZDogd29ya2VyRGF0YS5jb21wYW55SWQsXG4gICAgfVxuICB9KVxufVxuXG4vKipcbiAqIEdldCBhIHNpbmdsZSB3b3JrZXIgYnkgSUQgKGNvbXBhbnktc2NvcGVkKVxuICogU2VyaWFsaXplcyBNb25nb0RCIGRvY3VtZW50IHRvIHBsYWluIG9iamVjdFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0Q29tcGFueVdvcmtlcihcbiAgY29tcGFueUlkOiBzdHJpbmcsXG4gIHdvcmtlcklkOiBzdHJpbmdcbik6IFByb21pc2U8V29ya2VyV2l0aFBhc3N3b3JkIHwgbnVsbD4ge1xuICBjb25zdCB3b3JrZXJzQ29sbGVjdGlvbiA9IGF3YWl0IGdldENvbXBhbnlDb2xsZWN0aW9uPFdvcmtlcldpdGhQYXNzd29yZD4oXG4gICAgY29tcGFueUlkLFxuICAgIFwid29ya2Vyc1wiXG4gIClcblxuICBjb25zdCB3b3JrZXIgPSBhd2FpdCB3b3JrZXJzQ29sbGVjdGlvbi5maW5kT25lKHsgaWQ6IHdvcmtlcklkIH0pXG4gIFxuICBpZiAoIXdvcmtlcikgcmV0dXJuIG51bGxcblxuICAvLyBTZXJpYWxpemUgTW9uZ29EQiBkb2N1bWVudCB0byBwbGFpbiBvYmplY3RcbiAgY29uc3QgeyBfaWQsIC4uLndvcmtlckRhdGEgfSA9IHdvcmtlclxuICByZXR1cm4gd29ya2VyRGF0YVxufVxuXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Im1TQWNzQiJ9
}),
"[project]/app/(auth)/login/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LoginPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$auth$2f$CompanyLoginForm$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/auth/CompanyLoginForm.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$auth$2f$WorkerSelector$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/auth/WorkerSelector.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$companies$2f$data$3a$e797ca__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/lib/companies/data:e797ca [app-ssr] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/truck.js [app-ssr] (ecmascript) <export default as Truck>");
"use client";
;
;
;
;
;
;
;
function LoginPage() {
    const [step, setStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("company");
    const [selectedCompanyId, setSelectedCompanyId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedWorkerId, setSelectedWorkerId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [companies, setCompanies] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [companyWorkers, setCompanyWorkers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isLoadingWorkers, setIsLoadingWorkers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isLoadingCompanies, setIsLoadingCompanies] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const selectedCompany = companies.find((c)=>c.companyId === selectedCompanyId);
    // Load companies on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        async function loadCompanies() {
            setIsLoadingCompanies(true);
            try {
                // Use API route instead of direct server action for better production compatibility
                const response = await fetch("/api/companies");
                if (response.ok) {
                    const data = await response.json();
                    setCompanies(data);
                } else {
                    console.error("Failed to load companies:", response.statusText);
                }
            } catch (error) {
                console.error("Error loading companies:", error);
            } finally{
                setIsLoadingCompanies(false);
            }
        }
        loadCompanies();
    }, []);
    // Load workers when company is authenticated
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        async function loadWorkers() {
            if (!selectedCompanyId || step !== "worker") {
                setCompanyWorkers([]);
                return;
            }
            setIsLoadingWorkers(true);
            try {
                const workers = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$companies$2f$data$3a$e797ca__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["getCompanyWorkers"])(selectedCompanyId);
                setCompanyWorkers(workers);
            } catch (error) {
                console.error("Error loading workers:", error);
                setCompanyWorkers([]);
            } finally{
                setIsLoadingWorkers(false);
            }
        }
        loadWorkers();
    }, [
        selectedCompanyId,
        step
    ]);
    const handleCompanyLoginSuccess = (companyId)=>{
        // After company login is successful, move to worker selection
        setSelectedCompanyId(companyId);
        setStep("worker");
        setSelectedWorkerId(null); // Reset worker selection
    };
    const handleBackToCompany = ()=>{
        setStep("company");
        setSelectedWorkerId(null); // Reset worker selection when going back
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gray-50 flex items-center justify-center p-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full max-w-4xl",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center mb-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-center gap-3 mb-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__["Truck"], {
                                        className: "w-7 h-7 text-white"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(auth)/login/page.tsx",
                                        lineNumber: 89,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/(auth)/login/page.tsx",
                                    lineNumber: 88,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-2xl font-bold text-gray-900",
                                    children: "XP Agency"
                                }, void 0, false, {
                                    fileName: "[project]/app/(auth)/login/page.tsx",
                                    lineNumber: 91,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(auth)/login/page.tsx",
                            lineNumber: 87,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-gray-600",
                            children: "Logistics Platform"
                        }, void 0, false, {
                            fileName: "[project]/app/(auth)/login/page.tsx",
                            lineNumber: 93,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/(auth)/login/page.tsx",
                    lineNumber: 86,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-center gap-4 mb-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${step === "company" ? "bg-blue-600 text-white" : "bg-green-500 text-white"}
              `,
                                    children: step === "company" ? "1" : "✓"
                                }, void 0, false, {
                                    fileName: "[project]/app/(auth)/login/page.tsx",
                                    lineNumber: 99,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `text-sm font-medium ${step === "company" ? "text-gray-900" : "text-gray-500"}`,
                                    children: "Step 1: Company Login"
                                }, void 0, false, {
                                    fileName: "[project]/app/(auth)/login/page.tsx",
                                    lineNumber: 110,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(auth)/login/page.tsx",
                            lineNumber: 98,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-12 h-0.5 bg-gray-300"
                        }, void 0, false, {
                            fileName: "[project]/app/(auth)/login/page.tsx",
                            lineNumber: 118,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${step === "worker" ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"}
              `,
                                    children: "2"
                                }, void 0, false, {
                                    fileName: "[project]/app/(auth)/login/page.tsx",
                                    lineNumber: 120,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `text-sm font-medium ${step === "worker" ? "text-gray-900" : "text-gray-500"}`,
                                    children: "Step 2: Select Worker"
                                }, void 0, false, {
                                    fileName: "[project]/app/(auth)/login/page.tsx",
                                    lineNumber: 131,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(auth)/login/page.tsx",
                            lineNumber: 119,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/(auth)/login/page.tsx",
                    lineNumber: 97,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                    className: "p-6 md:p-8 bg-white border-gray-200 shadow-lg",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `
              transition-opacity duration-300
              ${step === "company" ? "opacity-100" : "hidden"}
            `,
                            children: isLoadingCompanies ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center py-8",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-gray-500",
                                    children: "Loading companies..."
                                }, void 0, false, {
                                    fileName: "[project]/app/(auth)/login/page.tsx",
                                    lineNumber: 151,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/(auth)/login/page.tsx",
                                lineNumber: 150,
                                columnNumber: 15
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$auth$2f$CompanyLoginForm$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CompanyLoginForm"], {
                                companies: companies,
                                onSuccess: handleCompanyLoginSuccess
                            }, void 0, false, {
                                fileName: "[project]/app/(auth)/login/page.tsx",
                                lineNumber: 154,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/(auth)/login/page.tsx",
                            lineNumber: 143,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `
              transition-opacity duration-300
              ${step === "worker" ? "opacity-100" : "hidden"}
            `,
                            children: selectedCompany && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$auth$2f$WorkerSelector$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WorkerSelector"], {
                                companyName: selectedCompany.name,
                                workers: companyWorkers,
                                selectedWorkerId: selectedWorkerId,
                                onSelect: setSelectedWorkerId,
                                onBack: handleBackToCompany,
                                isLoading: isLoadingWorkers
                            }, void 0, false, {
                                fileName: "[project]/app/(auth)/login/page.tsx",
                                lineNumber: 168,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/(auth)/login/page.tsx",
                            lineNumber: 161,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/(auth)/login/page.tsx",
                    lineNumber: 142,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/(auth)/login/page.tsx",
            lineNumber: 84,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/(auth)/login/page.tsx",
        lineNumber: 83,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=_18f65a6e._.js.map