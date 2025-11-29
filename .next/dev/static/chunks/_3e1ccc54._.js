(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/ui/card.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
function Card({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
_c = Card;
function CardHeader({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-header",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
_c1 = CardHeader;
function CardTitle({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-title",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('leading-none font-semibold', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
_c2 = CardTitle;
function CardDescription({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-description",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('text-muted-foreground text-sm', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 43,
        columnNumber: 5
    }, this);
}
_c3 = CardDescription;
function CardAction({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-action",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
}
_c4 = CardAction;
function CardContent({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-content",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('px-6', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 66,
        columnNumber: 5
    }, this);
}
_c5 = CardContent;
function CardFooter({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-footer",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center px-6 [.border-t]:pt-6', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 76,
        columnNumber: 5
    }, this);
}
_c6 = CardFooter;
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6;
__turbopack_context__.k.register(_c, "Card");
__turbopack_context__.k.register(_c1, "CardHeader");
__turbopack_context__.k.register(_c2, "CardTitle");
__turbopack_context__.k.register(_c3, "CardDescription");
__turbopack_context__.k.register(_c4, "CardAction");
__turbopack_context__.k.register(_c5, "CardContent");
__turbopack_context__.k.register(_c6, "CardFooter");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button,
    "buttonVariants",
    ()=>buttonVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", {
    variants: {
        variant: {
            default: 'bg-primary text-primary-foreground hover:bg-primary/90',
            destructive: 'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
            outline: 'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
            secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
            link: 'text-primary underline-offset-4 hover:underline'
        },
        size: {
            default: 'h-9 px-4 py-2 has-[>svg]:px-3',
            sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
            lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
            icon: 'size-9',
            'icon-sm': 'size-8',
            'icon-lg': 'size-10'
        }
    },
    defaultVariants: {
        variant: 'default',
        size: 'default'
    }
});
function Button({ className, variant, size, asChild = false, ...props }) {
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slot"] : 'button';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        "data-slot": "button",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/button.tsx",
        lineNumber: 52,
        columnNumber: 5
    }, this);
}
_c = Button;
;
var _c;
__turbopack_context__.k.register(_c, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/auth/CompanySelector.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CompanySelector",
    ()=>CompanySelector
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
"use client";
;
;
;
function CompanySelector({ companies, selectedCompanyId, onSelect, onContinue }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center space-y-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-2xl font-bold text-gray-900",
                        children: "Select Company Account"
                    }, void 0, false, {
                        fileName: "[project]/components/auth/CompanySelector.tsx",
                        lineNumber: 23,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-gray-600",
                        children: "Choose the logistics company you're working under."
                    }, void 0, false, {
                        fileName: "[project]/components/auth/CompanySelector.tsx",
                        lineNumber: 24,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/auth/CompanySelector.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                children: companies.map((company)=>{
                    const isSelected = selectedCompanyId === company.id;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                        onClick: ()=>onSelect(company.id),
                        className: `
                p-5 cursor-pointer transition-all duration-200
                ${isSelected ? "border-2 border-blue-600 bg-blue-50 shadow-md" : "border border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg hover:scale-[1.02]"}
              `,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-start gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `
                    w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg
                    ${isSelected ? "bg-blue-600" : "bg-gray-400"}
                  `,
                                    children: company.logoInitials
                                }, void 0, false, {
                                    fileName: "[project]/components/auth/CompanySelector.tsx",
                                    lineNumber: 45,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "font-semibold text-gray-900 mb-1",
                                            children: company.name
                                        }, void 0, false, {
                                            fileName: "[project]/components/auth/CompanySelector.tsx",
                                            lineNumber: 54,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-gray-600",
                                            children: company.description
                                        }, void 0, false, {
                                            fileName: "[project]/components/auth/CompanySelector.tsx",
                                            lineNumber: 55,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/auth/CompanySelector.tsx",
                                    lineNumber: 53,
                                    columnNumber: 17
                                }, this),
                                isSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "w-3 h-3 text-white",
                                        fill: "none",
                                        stroke: "currentColor",
                                        viewBox: "0 0 24 24",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            strokeWidth: 2,
                                            d: "M5 13l4 4L19 7"
                                        }, void 0, false, {
                                            fileName: "[project]/components/auth/CompanySelector.tsx",
                                            lineNumber: 65,
                                            columnNumber: 23
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/auth/CompanySelector.tsx",
                                        lineNumber: 59,
                                        columnNumber: 21
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/auth/CompanySelector.tsx",
                                    lineNumber: 58,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/auth/CompanySelector.tsx",
                            lineNumber: 44,
                            columnNumber: 15
                        }, this)
                    }, company.id, false, {
                        fileName: "[project]/components/auth/CompanySelector.tsx",
                        lineNumber: 33,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/components/auth/CompanySelector.tsx",
                lineNumber: 29,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col sm:flex-row items-center justify-between gap-4 pt-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        onClick: onContinue,
                        disabled: !selectedCompanyId,
                        className: "w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed",
                        children: "Continue"
                    }, void 0, false, {
                        fileName: "[project]/components/auth/CompanySelector.tsx",
                        lineNumber: 81,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "text-sm text-gray-500 hover:text-gray-700 transition-colors",
                        children: "Switch environment"
                    }, void 0, false, {
                        fileName: "[project]/components/auth/CompanySelector.tsx",
                        lineNumber: 88,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/auth/CompanySelector.tsx",
                lineNumber: 80,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/auth/CompanySelector.tsx",
        lineNumber: 21,
        columnNumber: 5
    }, this);
}
_c = CompanySelector;
var _c;
__turbopack_context__.k.register(_c, "CompanySelector");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/input.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Input",
    ()=>Input
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
function Input({ className, type, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        type: type,
        "data-slot": "input",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm', 'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]', 'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/input.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
_c = Input;
;
var _c;
__turbopack_context__.k.register(_c, "Input");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/label.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Label",
    ()=>Label
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-label/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
'use client';
;
;
;
function Label({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "label",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/label.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
_c = Label;
;
var _c;
__turbopack_context__.k.register(_c, "Label");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/auth/data:e161a6 [app-client] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"60e48f651e5ebbd9864e4b8a06cf8fa97d8e2239ad":"loginCompany"},"lib/auth/authServer.ts",""] */ __turbopack_context__.s([
    "loginCompany",
    ()=>loginCompany
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
"use turbopack no side effects";
;
var loginCompany = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("60e48f651e5ebbd9864e4b8a06cf8fa97d8e2239ad", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "loginCompany"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYXV0aFNlcnZlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzZXJ2ZXJcIlxuXG5pbXBvcnQgeyByZWRpcmVjdCB9IGZyb20gXCJuZXh0L25hdmlnYXRpb25cIlxuaW1wb3J0IHsgZ2V0Q29tcGFueUNvbGxlY3Rpb24gfSBmcm9tIFwiQC9saWIvZGIvY29tcGFueURiXCJcbmltcG9ydCB7IGdldENvbXBhbmllc0NvbGxlY3Rpb24gfSBmcm9tIFwiQC9saWIvZGIvY29tcGFueURiXCJcbmltcG9ydCB7IHNldFNlc3Npb24sIHNldENvbXBhbnlTZXNzaW9uLCBzZXRXb3JrZXJJblNlc3Npb24gfSBmcm9tIFwiLi9zZXNzaW9uXCJcblxuaW50ZXJmYWNlIFdvcmtlcldpdGhQYXNzd29yZCB7XG4gIGlkOiBzdHJpbmdcbiAgbmFtZTogc3RyaW5nXG4gIHJvbGU6IHN0cmluZ1xuICBhdmF0YXJDb2xvcjogc3RyaW5nXG4gIGNvbXBhbnlJZDogc3RyaW5nXG4gIHBhc3N3b3JkPzogc3RyaW5nXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTG9naW5SZXN1bHQge1xuICBzdWNjZXNzOiBib29sZWFuXG4gIGVycm9yPzogc3RyaW5nXG4gIHJlZGlyZWN0Pzogc3RyaW5nXG59XG5cbi8qKlxuICogTG9naW4gY29tcGFueSAtIHZlcmlmaWVzIGNvbXBhbnkgcGFzc3dvcmRcbiAqIFNldHMgc2Vzc2lvbiB3aXRoIGNvbXBhbnlJZCBvbmx5ICh3b3JrZXIgbm90IHNlbGVjdGVkIHlldClcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvZ2luQ29tcGFueShcbiAgY29tcGFueUlkOiBzdHJpbmcsXG4gIHBhc3N3b3JkOiBzdHJpbmdcbik6IFByb21pc2U8TG9naW5SZXN1bHQ+IHtcbiAgdHJ5IHtcbiAgICAvLyBHZXQgY29tcGFueSBmcm9tIHNoYXJlZCBjb21wYW5pZXMgY29sbGVjdGlvblxuICAgIGNvbnN0IGNvbXBhbmllc0NvbGxlY3Rpb24gPSBhd2FpdCBnZXRDb21wYW5pZXNDb2xsZWN0aW9uKClcbiAgICBjb25zdCBjb21wYW55ID0gYXdhaXQgY29tcGFuaWVzQ29sbGVjdGlvbi5maW5kT25lKHsgY29tcGFueUlkIH0pXG5cbiAgICAvLyBWZXJpZnkgY29tcGFueSBleGlzdHNcbiAgICBpZiAoIWNvbXBhbnkpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBlcnJvcjogXCJDb21wYW55IG5vdCBmb3VuZFwiLFxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFZlcmlmeSBwYXNzd29yZFxuICAgIC8vIEluIHByb2R1Y3Rpb24sIHBhc3N3b3JkcyBzaG91bGQgYmUgaGFzaGVkIChlLmcuLCB1c2luZyBiY3J5cHQpXG4gICAgY29uc3QgY29ycmVjdFBhc3N3b3JkID0gKGNvbXBhbnkgYXMgYW55KS5wYXNzd29yZFxuXG4gICAgaWYgKCFjb3JyZWN0UGFzc3dvcmQgfHwgY29ycmVjdFBhc3N3b3JkICE9PSBwYXNzd29yZCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIGVycm9yOiBcIkluY29ycmVjdCBwYXNzd29yZFwiLFxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNldCBzZXNzaW9uIHdpdGggY29tcGFueUlkIG9ubHkgKHBhcnRpYWwgc2Vzc2lvbilcbiAgICBhd2FpdCBzZXRDb21wYW55U2Vzc2lvbihjb21wYW55SWQpXG5cbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkNvbXBhbnkgbG9naW4gZXJyb3I6XCIsIGVycm9yKVxuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgIGVycm9yOiBcIkFuIGVycm9yIG9jY3VycmVkIGR1cmluZyBsb2dpblwiLFxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFNlbGVjdCB3b3JrZXIgLSBzZXRzIHdvcmtlcklkIGluIGV4aXN0aW5nIGNvbXBhbnkgc2Vzc2lvblxuICogTm8gcGFzc3dvcmQgcmVxdWlyZWQgKGNvbXBhbnkgYWxyZWFkeSBhdXRoZW50aWNhdGVkKVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VsZWN0V29ya2VyKFxuICBjb21wYW55SWQ6IHN0cmluZyxcbiAgd29ya2VySWQ6IHN0cmluZ1xuKTogUHJvbWlzZTxMb2dpblJlc3VsdD4ge1xuICB0cnkge1xuICAgIC8vIEdldCBjb21wYW55LXNjb3BlZCB3b3JrZXJzIGNvbGxlY3Rpb25cbiAgICBjb25zdCB3b3JrZXJzQ29sbGVjdGlvbiA9IGF3YWl0IGdldENvbXBhbnlDb2xsZWN0aW9uPFdvcmtlcldpdGhQYXNzd29yZD4oXG4gICAgICBjb21wYW55SWQsXG4gICAgICBcIndvcmtlcnNcIlxuICAgIClcblxuICAgIC8vIEZpbmQgdGhlIHdvcmtlciBpbiB0aGUgY29tcGFueSdzIGNvbGxlY3Rpb25cbiAgICBjb25zdCB3b3JrZXIgPSBhd2FpdCB3b3JrZXJzQ29sbGVjdGlvbi5maW5kT25lKHsgaWQ6IHdvcmtlcklkIH0pXG5cbiAgICAvLyBWZXJpZnkgd29ya2VyIGV4aXN0cyBhbmQgYmVsb25ncyB0byB0aGUgY29tcGFueVxuICAgIGlmICghd29ya2VyKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6IFwiV29ya2VyIG5vdCBmb3VuZFwiLFxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh3b3JrZXIuY29tcGFueUlkICE9PSBjb21wYW55SWQpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBlcnJvcjogXCJXb3JrZXIgZG9lcyBub3QgYmVsb25nIHRvIHRoaXMgY29tcGFueVwiLFxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNldCB3b3JrZXJJZCBpbiBleGlzdGluZyBjb21wYW55IHNlc3Npb25cbiAgICBhd2FpdCBzZXRXb3JrZXJJblNlc3Npb24od29ya2VySWQpXG5cbiAgICAvLyBSZWNvcmQgbG9naW4gc2Vzc2lvbiBpbiBjb21wYW55J3Mgc2Vzc2lvbnMgY29sbGVjdGlvblxuICAgIGNvbnN0IHNlc3Npb25zQ29sbGVjdGlvbiA9IGF3YWl0IGdldENvbXBhbnlDb2xsZWN0aW9uKGNvbXBhbnlJZCwgXCJzZXNzaW9uc1wiKVxuICAgIGF3YWl0IHNlc3Npb25zQ29sbGVjdGlvbi5pbnNlcnRPbmUoe1xuICAgICAgd29ya2VySWQsXG4gICAgICBjb21wYW55SWQsXG4gICAgICBsb2dpbkF0OiBuZXcgRGF0ZSgpLFxuICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLFxuICAgIH0pXG5cbiAgICAvLyBSZWRpcmVjdCB0byBkYXNoYm9hcmQgKHRoaXMgd2lsbCB0aHJvdywgd2hpY2ggaXMgZXhwZWN0ZWQgaW4gTmV4dC5qcylcbiAgICByZWRpcmVjdChcIi9cIilcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyBJZiBpdCdzIGEgcmVkaXJlY3QgZXJyb3IsIGxldCBpdCBwcm9wYWdhdGVcbiAgICBpZiAoZXJyb3IgJiYgdHlwZW9mIGVycm9yID09PSBcIm9iamVjdFwiICYmIFwiZGlnZXN0XCIgaW4gZXJyb3IpIHtcbiAgICAgIHRocm93IGVycm9yXG4gICAgfVxuXG4gICAgY29uc29sZS5lcnJvcihcIldvcmtlciBzZWxlY3Rpb24gZXJyb3I6XCIsIGVycm9yKVxuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgIGVycm9yOiBcIkFuIGVycm9yIG9jY3VycmVkIGR1cmluZyB3b3JrZXIgc2VsZWN0aW9uXCIsXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogTGVnYWN5OiBMb2dpbiB3b3JrZXIgLSB2ZXJpZmllcyBjcmVkZW50aWFscyBhZ2FpbnN0IGNvbXBhbnktc2NvcGVkIHdvcmtlciBjb2xsZWN0aW9uXG4gKiBTZXRzIHNlc3Npb24gd2l0aCBjb21wYW55SWQgYW5kIHdvcmtlcklkIG9uIHN1Y2Nlc3NcbiAqIEBkZXByZWNhdGVkIFVzZSBsb2dpbkNvbXBhbnkgKyBzZWxlY3RXb3JrZXIgaW5zdGVhZFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9naW5Xb3JrZXIoXG4gIGNvbXBhbnlJZDogc3RyaW5nLFxuICB3b3JrZXJJZDogc3RyaW5nLFxuICBwYXNzd29yZDogc3RyaW5nXG4pOiBQcm9taXNlPExvZ2luUmVzdWx0PiB7XG4gIHRyeSB7XG4gICAgLy8gR2V0IGNvbXBhbnktc2NvcGVkIHdvcmtlcnMgY29sbGVjdGlvblxuICAgIGNvbnN0IHdvcmtlcnNDb2xsZWN0aW9uID0gYXdhaXQgZ2V0Q29tcGFueUNvbGxlY3Rpb248V29ya2VyV2l0aFBhc3N3b3JkPihcbiAgICAgIGNvbXBhbnlJZCxcbiAgICAgIFwid29ya2Vyc1wiXG4gICAgKVxuXG4gICAgLy8gRmluZCB0aGUgd29ya2VyIGluIHRoZSBjb21wYW55J3MgY29sbGVjdGlvblxuICAgIGNvbnN0IHdvcmtlciA9IGF3YWl0IHdvcmtlcnNDb2xsZWN0aW9uLmZpbmRPbmUoeyBpZDogd29ya2VySWQgfSlcblxuICAgIC8vIFZlcmlmeSB3b3JrZXIgZXhpc3RzIGFuZCBiZWxvbmdzIHRvIHRoZSBjb21wYW55XG4gICAgaWYgKCF3b3JrZXIpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBlcnJvcjogXCJXb3JrZXIgbm90IGZvdW5kXCIsXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHdvcmtlci5jb21wYW55SWQgIT09IGNvbXBhbnlJZCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIGVycm9yOiBcIldvcmtlciBkb2VzIG5vdCBiZWxvbmcgdG8gdGhpcyBjb21wYW55XCIsXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVmVyaWZ5IHBhc3N3b3JkXG4gICAgLy8gSW4gcHJvZHVjdGlvbiwgcGFzc3dvcmRzIHNob3VsZCBiZSBoYXNoZWQgKGUuZy4sIHVzaW5nIGJjcnlwdClcbiAgICBjb25zdCBjb3JyZWN0UGFzc3dvcmQgPSB3b3JrZXIucGFzc3dvcmRcblxuICAgIGlmICghY29ycmVjdFBhc3N3b3JkIHx8IGNvcnJlY3RQYXNzd29yZCAhPT0gcGFzc3dvcmQpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBlcnJvcjogXCJJbmNvcnJlY3QgcGFzc3dvcmRcIixcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTZXQgc2Vzc2lvbiB3aXRoIGNvbXBhbnlJZCBhbmQgd29ya2VySWRcbiAgICBhd2FpdCBzZXRTZXNzaW9uKGNvbXBhbnlJZCwgd29ya2VySWQpXG5cbiAgICAvLyBSZWNvcmQgbG9naW4gc2Vzc2lvbiBpbiBjb21wYW55J3Mgc2Vzc2lvbnMgY29sbGVjdGlvblxuICAgIGNvbnN0IHNlc3Npb25zQ29sbGVjdGlvbiA9IGF3YWl0IGdldENvbXBhbnlDb2xsZWN0aW9uKGNvbXBhbnlJZCwgXCJzZXNzaW9uc1wiKVxuICAgIGF3YWl0IHNlc3Npb25zQ29sbGVjdGlvbi5pbnNlcnRPbmUoe1xuICAgICAgd29ya2VySWQsXG4gICAgICBjb21wYW55SWQsXG4gICAgICBsb2dpbkF0OiBuZXcgRGF0ZSgpLFxuICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLFxuICAgIH0pXG5cbiAgICAvLyBSZWRpcmVjdCB0byBkYXNoYm9hcmQgKHRoaXMgd2lsbCB0aHJvdywgd2hpY2ggaXMgZXhwZWN0ZWQgaW4gTmV4dC5qcylcbiAgICByZWRpcmVjdChcIi9cIilcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyBJZiBpdCdzIGEgcmVkaXJlY3QgZXJyb3IsIGxldCBpdCBwcm9wYWdhdGVcbiAgICBpZiAoZXJyb3IgJiYgdHlwZW9mIGVycm9yID09PSBcIm9iamVjdFwiICYmIFwiZGlnZXN0XCIgaW4gZXJyb3IpIHtcbiAgICAgIHRocm93IGVycm9yXG4gICAgfVxuXG4gICAgY29uc29sZS5lcnJvcihcIkxvZ2luIGVycm9yOlwiLCBlcnJvcilcbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICBlcnJvcjogXCJBbiBlcnJvciBvY2N1cnJlZCBkdXJpbmcgbG9naW5cIixcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvZ291dCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgeyBjbGVhclNlc3Npb24gfSA9IGF3YWl0IGltcG9ydChcIi4vc2Vzc2lvblwiKVxuICBcbiAgLy8gQ2xlYXIgc2Vzc2lvbiBjb29raWVzXG4gIGF3YWl0IGNsZWFyU2Vzc2lvbigpXG4gIFxuICAvLyBJbiBhIHJlYWwgYXBwLCB5b3Ugd291bGQgYWxzbzpcbiAgLy8gMS4gSW52YWxpZGF0ZSBzZXNzaW9uIGluIGRhdGFiYXNlXG4gIC8vIDIuIExvZyBsb2dvdXQgZXZlbnRcbiAgXG4gIC8vIFJlZGlyZWN0IHRvIGxvZ2luIHBhZ2VcbiAgcmVkaXJlY3QoXCIvbG9naW5cIilcbn1cblxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI0UkEwQnNCIn0=
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/auth/data:e5cb36 [app-client] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"600171263a30e7f65dafe2a32d7b3a8fdc60ea9bd5":"selectWorker"},"lib/auth/authServer.ts",""] */ __turbopack_context__.s([
    "selectWorker",
    ()=>selectWorker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
"use turbopack no side effects";
;
var selectWorker = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("600171263a30e7f65dafe2a32d7b3a8fdc60ea9bd5", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "selectWorker"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYXV0aFNlcnZlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzZXJ2ZXJcIlxuXG5pbXBvcnQgeyByZWRpcmVjdCB9IGZyb20gXCJuZXh0L25hdmlnYXRpb25cIlxuaW1wb3J0IHsgZ2V0Q29tcGFueUNvbGxlY3Rpb24gfSBmcm9tIFwiQC9saWIvZGIvY29tcGFueURiXCJcbmltcG9ydCB7IGdldENvbXBhbmllc0NvbGxlY3Rpb24gfSBmcm9tIFwiQC9saWIvZGIvY29tcGFueURiXCJcbmltcG9ydCB7IHNldFNlc3Npb24sIHNldENvbXBhbnlTZXNzaW9uLCBzZXRXb3JrZXJJblNlc3Npb24gfSBmcm9tIFwiLi9zZXNzaW9uXCJcblxuaW50ZXJmYWNlIFdvcmtlcldpdGhQYXNzd29yZCB7XG4gIGlkOiBzdHJpbmdcbiAgbmFtZTogc3RyaW5nXG4gIHJvbGU6IHN0cmluZ1xuICBhdmF0YXJDb2xvcjogc3RyaW5nXG4gIGNvbXBhbnlJZDogc3RyaW5nXG4gIHBhc3N3b3JkPzogc3RyaW5nXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTG9naW5SZXN1bHQge1xuICBzdWNjZXNzOiBib29sZWFuXG4gIGVycm9yPzogc3RyaW5nXG4gIHJlZGlyZWN0Pzogc3RyaW5nXG59XG5cbi8qKlxuICogTG9naW4gY29tcGFueSAtIHZlcmlmaWVzIGNvbXBhbnkgcGFzc3dvcmRcbiAqIFNldHMgc2Vzc2lvbiB3aXRoIGNvbXBhbnlJZCBvbmx5ICh3b3JrZXIgbm90IHNlbGVjdGVkIHlldClcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvZ2luQ29tcGFueShcbiAgY29tcGFueUlkOiBzdHJpbmcsXG4gIHBhc3N3b3JkOiBzdHJpbmdcbik6IFByb21pc2U8TG9naW5SZXN1bHQ+IHtcbiAgdHJ5IHtcbiAgICAvLyBHZXQgY29tcGFueSBmcm9tIHNoYXJlZCBjb21wYW5pZXMgY29sbGVjdGlvblxuICAgIGNvbnN0IGNvbXBhbmllc0NvbGxlY3Rpb24gPSBhd2FpdCBnZXRDb21wYW5pZXNDb2xsZWN0aW9uKClcbiAgICBjb25zdCBjb21wYW55ID0gYXdhaXQgY29tcGFuaWVzQ29sbGVjdGlvbi5maW5kT25lKHsgY29tcGFueUlkIH0pXG5cbiAgICAvLyBWZXJpZnkgY29tcGFueSBleGlzdHNcbiAgICBpZiAoIWNvbXBhbnkpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBlcnJvcjogXCJDb21wYW55IG5vdCBmb3VuZFwiLFxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFZlcmlmeSBwYXNzd29yZFxuICAgIC8vIEluIHByb2R1Y3Rpb24sIHBhc3N3b3JkcyBzaG91bGQgYmUgaGFzaGVkIChlLmcuLCB1c2luZyBiY3J5cHQpXG4gICAgY29uc3QgY29ycmVjdFBhc3N3b3JkID0gKGNvbXBhbnkgYXMgYW55KS5wYXNzd29yZFxuXG4gICAgaWYgKCFjb3JyZWN0UGFzc3dvcmQgfHwgY29ycmVjdFBhc3N3b3JkICE9PSBwYXNzd29yZCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIGVycm9yOiBcIkluY29ycmVjdCBwYXNzd29yZFwiLFxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNldCBzZXNzaW9uIHdpdGggY29tcGFueUlkIG9ubHkgKHBhcnRpYWwgc2Vzc2lvbilcbiAgICBhd2FpdCBzZXRDb21wYW55U2Vzc2lvbihjb21wYW55SWQpXG5cbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkNvbXBhbnkgbG9naW4gZXJyb3I6XCIsIGVycm9yKVxuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgIGVycm9yOiBcIkFuIGVycm9yIG9jY3VycmVkIGR1cmluZyBsb2dpblwiLFxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFNlbGVjdCB3b3JrZXIgLSBzZXRzIHdvcmtlcklkIGluIGV4aXN0aW5nIGNvbXBhbnkgc2Vzc2lvblxuICogTm8gcGFzc3dvcmQgcmVxdWlyZWQgKGNvbXBhbnkgYWxyZWFkeSBhdXRoZW50aWNhdGVkKVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VsZWN0V29ya2VyKFxuICBjb21wYW55SWQ6IHN0cmluZyxcbiAgd29ya2VySWQ6IHN0cmluZ1xuKTogUHJvbWlzZTxMb2dpblJlc3VsdD4ge1xuICB0cnkge1xuICAgIC8vIEdldCBjb21wYW55LXNjb3BlZCB3b3JrZXJzIGNvbGxlY3Rpb25cbiAgICBjb25zdCB3b3JrZXJzQ29sbGVjdGlvbiA9IGF3YWl0IGdldENvbXBhbnlDb2xsZWN0aW9uPFdvcmtlcldpdGhQYXNzd29yZD4oXG4gICAgICBjb21wYW55SWQsXG4gICAgICBcIndvcmtlcnNcIlxuICAgIClcblxuICAgIC8vIEZpbmQgdGhlIHdvcmtlciBpbiB0aGUgY29tcGFueSdzIGNvbGxlY3Rpb25cbiAgICBjb25zdCB3b3JrZXIgPSBhd2FpdCB3b3JrZXJzQ29sbGVjdGlvbi5maW5kT25lKHsgaWQ6IHdvcmtlcklkIH0pXG5cbiAgICAvLyBWZXJpZnkgd29ya2VyIGV4aXN0cyBhbmQgYmVsb25ncyB0byB0aGUgY29tcGFueVxuICAgIGlmICghd29ya2VyKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6IFwiV29ya2VyIG5vdCBmb3VuZFwiLFxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh3b3JrZXIuY29tcGFueUlkICE9PSBjb21wYW55SWQpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBlcnJvcjogXCJXb3JrZXIgZG9lcyBub3QgYmVsb25nIHRvIHRoaXMgY29tcGFueVwiLFxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNldCB3b3JrZXJJZCBpbiBleGlzdGluZyBjb21wYW55IHNlc3Npb25cbiAgICBhd2FpdCBzZXRXb3JrZXJJblNlc3Npb24od29ya2VySWQpXG5cbiAgICAvLyBSZWNvcmQgbG9naW4gc2Vzc2lvbiBpbiBjb21wYW55J3Mgc2Vzc2lvbnMgY29sbGVjdGlvblxuICAgIGNvbnN0IHNlc3Npb25zQ29sbGVjdGlvbiA9IGF3YWl0IGdldENvbXBhbnlDb2xsZWN0aW9uKGNvbXBhbnlJZCwgXCJzZXNzaW9uc1wiKVxuICAgIGF3YWl0IHNlc3Npb25zQ29sbGVjdGlvbi5pbnNlcnRPbmUoe1xuICAgICAgd29ya2VySWQsXG4gICAgICBjb21wYW55SWQsXG4gICAgICBsb2dpbkF0OiBuZXcgRGF0ZSgpLFxuICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLFxuICAgIH0pXG5cbiAgICAvLyBSZWRpcmVjdCB0byBkYXNoYm9hcmQgKHRoaXMgd2lsbCB0aHJvdywgd2hpY2ggaXMgZXhwZWN0ZWQgaW4gTmV4dC5qcylcbiAgICByZWRpcmVjdChcIi9cIilcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyBJZiBpdCdzIGEgcmVkaXJlY3QgZXJyb3IsIGxldCBpdCBwcm9wYWdhdGVcbiAgICBpZiAoZXJyb3IgJiYgdHlwZW9mIGVycm9yID09PSBcIm9iamVjdFwiICYmIFwiZGlnZXN0XCIgaW4gZXJyb3IpIHtcbiAgICAgIHRocm93IGVycm9yXG4gICAgfVxuXG4gICAgY29uc29sZS5lcnJvcihcIldvcmtlciBzZWxlY3Rpb24gZXJyb3I6XCIsIGVycm9yKVxuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgIGVycm9yOiBcIkFuIGVycm9yIG9jY3VycmVkIGR1cmluZyB3b3JrZXIgc2VsZWN0aW9uXCIsXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogTGVnYWN5OiBMb2dpbiB3b3JrZXIgLSB2ZXJpZmllcyBjcmVkZW50aWFscyBhZ2FpbnN0IGNvbXBhbnktc2NvcGVkIHdvcmtlciBjb2xsZWN0aW9uXG4gKiBTZXRzIHNlc3Npb24gd2l0aCBjb21wYW55SWQgYW5kIHdvcmtlcklkIG9uIHN1Y2Nlc3NcbiAqIEBkZXByZWNhdGVkIFVzZSBsb2dpbkNvbXBhbnkgKyBzZWxlY3RXb3JrZXIgaW5zdGVhZFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9naW5Xb3JrZXIoXG4gIGNvbXBhbnlJZDogc3RyaW5nLFxuICB3b3JrZXJJZDogc3RyaW5nLFxuICBwYXNzd29yZDogc3RyaW5nXG4pOiBQcm9taXNlPExvZ2luUmVzdWx0PiB7XG4gIHRyeSB7XG4gICAgLy8gR2V0IGNvbXBhbnktc2NvcGVkIHdvcmtlcnMgY29sbGVjdGlvblxuICAgIGNvbnN0IHdvcmtlcnNDb2xsZWN0aW9uID0gYXdhaXQgZ2V0Q29tcGFueUNvbGxlY3Rpb248V29ya2VyV2l0aFBhc3N3b3JkPihcbiAgICAgIGNvbXBhbnlJZCxcbiAgICAgIFwid29ya2Vyc1wiXG4gICAgKVxuXG4gICAgLy8gRmluZCB0aGUgd29ya2VyIGluIHRoZSBjb21wYW55J3MgY29sbGVjdGlvblxuICAgIGNvbnN0IHdvcmtlciA9IGF3YWl0IHdvcmtlcnNDb2xsZWN0aW9uLmZpbmRPbmUoeyBpZDogd29ya2VySWQgfSlcblxuICAgIC8vIFZlcmlmeSB3b3JrZXIgZXhpc3RzIGFuZCBiZWxvbmdzIHRvIHRoZSBjb21wYW55XG4gICAgaWYgKCF3b3JrZXIpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBlcnJvcjogXCJXb3JrZXIgbm90IGZvdW5kXCIsXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHdvcmtlci5jb21wYW55SWQgIT09IGNvbXBhbnlJZCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIGVycm9yOiBcIldvcmtlciBkb2VzIG5vdCBiZWxvbmcgdG8gdGhpcyBjb21wYW55XCIsXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVmVyaWZ5IHBhc3N3b3JkXG4gICAgLy8gSW4gcHJvZHVjdGlvbiwgcGFzc3dvcmRzIHNob3VsZCBiZSBoYXNoZWQgKGUuZy4sIHVzaW5nIGJjcnlwdClcbiAgICBjb25zdCBjb3JyZWN0UGFzc3dvcmQgPSB3b3JrZXIucGFzc3dvcmRcblxuICAgIGlmICghY29ycmVjdFBhc3N3b3JkIHx8IGNvcnJlY3RQYXNzd29yZCAhPT0gcGFzc3dvcmQpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBlcnJvcjogXCJJbmNvcnJlY3QgcGFzc3dvcmRcIixcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTZXQgc2Vzc2lvbiB3aXRoIGNvbXBhbnlJZCBhbmQgd29ya2VySWRcbiAgICBhd2FpdCBzZXRTZXNzaW9uKGNvbXBhbnlJZCwgd29ya2VySWQpXG5cbiAgICAvLyBSZWNvcmQgbG9naW4gc2Vzc2lvbiBpbiBjb21wYW55J3Mgc2Vzc2lvbnMgY29sbGVjdGlvblxuICAgIGNvbnN0IHNlc3Npb25zQ29sbGVjdGlvbiA9IGF3YWl0IGdldENvbXBhbnlDb2xsZWN0aW9uKGNvbXBhbnlJZCwgXCJzZXNzaW9uc1wiKVxuICAgIGF3YWl0IHNlc3Npb25zQ29sbGVjdGlvbi5pbnNlcnRPbmUoe1xuICAgICAgd29ya2VySWQsXG4gICAgICBjb21wYW55SWQsXG4gICAgICBsb2dpbkF0OiBuZXcgRGF0ZSgpLFxuICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLFxuICAgIH0pXG5cbiAgICAvLyBSZWRpcmVjdCB0byBkYXNoYm9hcmQgKHRoaXMgd2lsbCB0aHJvdywgd2hpY2ggaXMgZXhwZWN0ZWQgaW4gTmV4dC5qcylcbiAgICByZWRpcmVjdChcIi9cIilcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyBJZiBpdCdzIGEgcmVkaXJlY3QgZXJyb3IsIGxldCBpdCBwcm9wYWdhdGVcbiAgICBpZiAoZXJyb3IgJiYgdHlwZW9mIGVycm9yID09PSBcIm9iamVjdFwiICYmIFwiZGlnZXN0XCIgaW4gZXJyb3IpIHtcbiAgICAgIHRocm93IGVycm9yXG4gICAgfVxuXG4gICAgY29uc29sZS5lcnJvcihcIkxvZ2luIGVycm9yOlwiLCBlcnJvcilcbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICBlcnJvcjogXCJBbiBlcnJvciBvY2N1cnJlZCBkdXJpbmcgbG9naW5cIixcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvZ291dCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgeyBjbGVhclNlc3Npb24gfSA9IGF3YWl0IGltcG9ydChcIi4vc2Vzc2lvblwiKVxuICBcbiAgLy8gQ2xlYXIgc2Vzc2lvbiBjb29raWVzXG4gIGF3YWl0IGNsZWFyU2Vzc2lvbigpXG4gIFxuICAvLyBJbiBhIHJlYWwgYXBwLCB5b3Ugd291bGQgYWxzbzpcbiAgLy8gMS4gSW52YWxpZGF0ZSBzZXNzaW9uIGluIGRhdGFiYXNlXG4gIC8vIDIuIExvZyBsb2dvdXQgZXZlbnRcbiAgXG4gIC8vIFJlZGlyZWN0IHRvIGxvZ2luIHBhZ2VcbiAgcmVkaXJlY3QoXCIvbG9naW5cIilcbn1cblxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI0UkF5RXNCIn0=
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/auth/data:75394a [app-client] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"706eaece57029aad276a30b25bf6e85547c101354f":"loginWorker"},"lib/auth/authServer.ts",""] */ __turbopack_context__.s([
    "loginWorker",
    ()=>loginWorker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
"use turbopack no side effects";
;
var loginWorker = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("706eaece57029aad276a30b25bf6e85547c101354f", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "loginWorker"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vYXV0aFNlcnZlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzZXJ2ZXJcIlxuXG5pbXBvcnQgeyByZWRpcmVjdCB9IGZyb20gXCJuZXh0L25hdmlnYXRpb25cIlxuaW1wb3J0IHsgZ2V0Q29tcGFueUNvbGxlY3Rpb24gfSBmcm9tIFwiQC9saWIvZGIvY29tcGFueURiXCJcbmltcG9ydCB7IGdldENvbXBhbmllc0NvbGxlY3Rpb24gfSBmcm9tIFwiQC9saWIvZGIvY29tcGFueURiXCJcbmltcG9ydCB7IHNldFNlc3Npb24sIHNldENvbXBhbnlTZXNzaW9uLCBzZXRXb3JrZXJJblNlc3Npb24gfSBmcm9tIFwiLi9zZXNzaW9uXCJcblxuaW50ZXJmYWNlIFdvcmtlcldpdGhQYXNzd29yZCB7XG4gIGlkOiBzdHJpbmdcbiAgbmFtZTogc3RyaW5nXG4gIHJvbGU6IHN0cmluZ1xuICBhdmF0YXJDb2xvcjogc3RyaW5nXG4gIGNvbXBhbnlJZDogc3RyaW5nXG4gIHBhc3N3b3JkPzogc3RyaW5nXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTG9naW5SZXN1bHQge1xuICBzdWNjZXNzOiBib29sZWFuXG4gIGVycm9yPzogc3RyaW5nXG4gIHJlZGlyZWN0Pzogc3RyaW5nXG59XG5cbi8qKlxuICogTG9naW4gY29tcGFueSAtIHZlcmlmaWVzIGNvbXBhbnkgcGFzc3dvcmRcbiAqIFNldHMgc2Vzc2lvbiB3aXRoIGNvbXBhbnlJZCBvbmx5ICh3b3JrZXIgbm90IHNlbGVjdGVkIHlldClcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvZ2luQ29tcGFueShcbiAgY29tcGFueUlkOiBzdHJpbmcsXG4gIHBhc3N3b3JkOiBzdHJpbmdcbik6IFByb21pc2U8TG9naW5SZXN1bHQ+IHtcbiAgdHJ5IHtcbiAgICAvLyBHZXQgY29tcGFueSBmcm9tIHNoYXJlZCBjb21wYW5pZXMgY29sbGVjdGlvblxuICAgIGNvbnN0IGNvbXBhbmllc0NvbGxlY3Rpb24gPSBhd2FpdCBnZXRDb21wYW5pZXNDb2xsZWN0aW9uKClcbiAgICBjb25zdCBjb21wYW55ID0gYXdhaXQgY29tcGFuaWVzQ29sbGVjdGlvbi5maW5kT25lKHsgY29tcGFueUlkIH0pXG5cbiAgICAvLyBWZXJpZnkgY29tcGFueSBleGlzdHNcbiAgICBpZiAoIWNvbXBhbnkpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBlcnJvcjogXCJDb21wYW55IG5vdCBmb3VuZFwiLFxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFZlcmlmeSBwYXNzd29yZFxuICAgIC8vIEluIHByb2R1Y3Rpb24sIHBhc3N3b3JkcyBzaG91bGQgYmUgaGFzaGVkIChlLmcuLCB1c2luZyBiY3J5cHQpXG4gICAgY29uc3QgY29ycmVjdFBhc3N3b3JkID0gKGNvbXBhbnkgYXMgYW55KS5wYXNzd29yZFxuXG4gICAgaWYgKCFjb3JyZWN0UGFzc3dvcmQgfHwgY29ycmVjdFBhc3N3b3JkICE9PSBwYXNzd29yZCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIGVycm9yOiBcIkluY29ycmVjdCBwYXNzd29yZFwiLFxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNldCBzZXNzaW9uIHdpdGggY29tcGFueUlkIG9ubHkgKHBhcnRpYWwgc2Vzc2lvbilcbiAgICBhd2FpdCBzZXRDb21wYW55U2Vzc2lvbihjb21wYW55SWQpXG5cbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkNvbXBhbnkgbG9naW4gZXJyb3I6XCIsIGVycm9yKVxuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgIGVycm9yOiBcIkFuIGVycm9yIG9jY3VycmVkIGR1cmluZyBsb2dpblwiLFxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFNlbGVjdCB3b3JrZXIgLSBzZXRzIHdvcmtlcklkIGluIGV4aXN0aW5nIGNvbXBhbnkgc2Vzc2lvblxuICogTm8gcGFzc3dvcmQgcmVxdWlyZWQgKGNvbXBhbnkgYWxyZWFkeSBhdXRoZW50aWNhdGVkKVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VsZWN0V29ya2VyKFxuICBjb21wYW55SWQ6IHN0cmluZyxcbiAgd29ya2VySWQ6IHN0cmluZ1xuKTogUHJvbWlzZTxMb2dpblJlc3VsdD4ge1xuICB0cnkge1xuICAgIC8vIEdldCBjb21wYW55LXNjb3BlZCB3b3JrZXJzIGNvbGxlY3Rpb25cbiAgICBjb25zdCB3b3JrZXJzQ29sbGVjdGlvbiA9IGF3YWl0IGdldENvbXBhbnlDb2xsZWN0aW9uPFdvcmtlcldpdGhQYXNzd29yZD4oXG4gICAgICBjb21wYW55SWQsXG4gICAgICBcIndvcmtlcnNcIlxuICAgIClcblxuICAgIC8vIEZpbmQgdGhlIHdvcmtlciBpbiB0aGUgY29tcGFueSdzIGNvbGxlY3Rpb25cbiAgICBjb25zdCB3b3JrZXIgPSBhd2FpdCB3b3JrZXJzQ29sbGVjdGlvbi5maW5kT25lKHsgaWQ6IHdvcmtlcklkIH0pXG5cbiAgICAvLyBWZXJpZnkgd29ya2VyIGV4aXN0cyBhbmQgYmVsb25ncyB0byB0aGUgY29tcGFueVxuICAgIGlmICghd29ya2VyKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6IFwiV29ya2VyIG5vdCBmb3VuZFwiLFxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh3b3JrZXIuY29tcGFueUlkICE9PSBjb21wYW55SWQpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBlcnJvcjogXCJXb3JrZXIgZG9lcyBub3QgYmVsb25nIHRvIHRoaXMgY29tcGFueVwiLFxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNldCB3b3JrZXJJZCBpbiBleGlzdGluZyBjb21wYW55IHNlc3Npb25cbiAgICBhd2FpdCBzZXRXb3JrZXJJblNlc3Npb24od29ya2VySWQpXG5cbiAgICAvLyBSZWNvcmQgbG9naW4gc2Vzc2lvbiBpbiBjb21wYW55J3Mgc2Vzc2lvbnMgY29sbGVjdGlvblxuICAgIGNvbnN0IHNlc3Npb25zQ29sbGVjdGlvbiA9IGF3YWl0IGdldENvbXBhbnlDb2xsZWN0aW9uKGNvbXBhbnlJZCwgXCJzZXNzaW9uc1wiKVxuICAgIGF3YWl0IHNlc3Npb25zQ29sbGVjdGlvbi5pbnNlcnRPbmUoe1xuICAgICAgd29ya2VySWQsXG4gICAgICBjb21wYW55SWQsXG4gICAgICBsb2dpbkF0OiBuZXcgRGF0ZSgpLFxuICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLFxuICAgIH0pXG5cbiAgICAvLyBSZWRpcmVjdCB0byBkYXNoYm9hcmQgKHRoaXMgd2lsbCB0aHJvdywgd2hpY2ggaXMgZXhwZWN0ZWQgaW4gTmV4dC5qcylcbiAgICByZWRpcmVjdChcIi9cIilcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyBJZiBpdCdzIGEgcmVkaXJlY3QgZXJyb3IsIGxldCBpdCBwcm9wYWdhdGVcbiAgICBpZiAoZXJyb3IgJiYgdHlwZW9mIGVycm9yID09PSBcIm9iamVjdFwiICYmIFwiZGlnZXN0XCIgaW4gZXJyb3IpIHtcbiAgICAgIHRocm93IGVycm9yXG4gICAgfVxuXG4gICAgY29uc29sZS5lcnJvcihcIldvcmtlciBzZWxlY3Rpb24gZXJyb3I6XCIsIGVycm9yKVxuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgIGVycm9yOiBcIkFuIGVycm9yIG9jY3VycmVkIGR1cmluZyB3b3JrZXIgc2VsZWN0aW9uXCIsXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogTGVnYWN5OiBMb2dpbiB3b3JrZXIgLSB2ZXJpZmllcyBjcmVkZW50aWFscyBhZ2FpbnN0IGNvbXBhbnktc2NvcGVkIHdvcmtlciBjb2xsZWN0aW9uXG4gKiBTZXRzIHNlc3Npb24gd2l0aCBjb21wYW55SWQgYW5kIHdvcmtlcklkIG9uIHN1Y2Nlc3NcbiAqIEBkZXByZWNhdGVkIFVzZSBsb2dpbkNvbXBhbnkgKyBzZWxlY3RXb3JrZXIgaW5zdGVhZFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9naW5Xb3JrZXIoXG4gIGNvbXBhbnlJZDogc3RyaW5nLFxuICB3b3JrZXJJZDogc3RyaW5nLFxuICBwYXNzd29yZDogc3RyaW5nXG4pOiBQcm9taXNlPExvZ2luUmVzdWx0PiB7XG4gIHRyeSB7XG4gICAgLy8gR2V0IGNvbXBhbnktc2NvcGVkIHdvcmtlcnMgY29sbGVjdGlvblxuICAgIGNvbnN0IHdvcmtlcnNDb2xsZWN0aW9uID0gYXdhaXQgZ2V0Q29tcGFueUNvbGxlY3Rpb248V29ya2VyV2l0aFBhc3N3b3JkPihcbiAgICAgIGNvbXBhbnlJZCxcbiAgICAgIFwid29ya2Vyc1wiXG4gICAgKVxuXG4gICAgLy8gRmluZCB0aGUgd29ya2VyIGluIHRoZSBjb21wYW55J3MgY29sbGVjdGlvblxuICAgIGNvbnN0IHdvcmtlciA9IGF3YWl0IHdvcmtlcnNDb2xsZWN0aW9uLmZpbmRPbmUoeyBpZDogd29ya2VySWQgfSlcblxuICAgIC8vIFZlcmlmeSB3b3JrZXIgZXhpc3RzIGFuZCBiZWxvbmdzIHRvIHRoZSBjb21wYW55XG4gICAgaWYgKCF3b3JrZXIpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBlcnJvcjogXCJXb3JrZXIgbm90IGZvdW5kXCIsXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHdvcmtlci5jb21wYW55SWQgIT09IGNvbXBhbnlJZCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIGVycm9yOiBcIldvcmtlciBkb2VzIG5vdCBiZWxvbmcgdG8gdGhpcyBjb21wYW55XCIsXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVmVyaWZ5IHBhc3N3b3JkXG4gICAgLy8gSW4gcHJvZHVjdGlvbiwgcGFzc3dvcmRzIHNob3VsZCBiZSBoYXNoZWQgKGUuZy4sIHVzaW5nIGJjcnlwdClcbiAgICBjb25zdCBjb3JyZWN0UGFzc3dvcmQgPSB3b3JrZXIucGFzc3dvcmRcblxuICAgIGlmICghY29ycmVjdFBhc3N3b3JkIHx8IGNvcnJlY3RQYXNzd29yZCAhPT0gcGFzc3dvcmQpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBlcnJvcjogXCJJbmNvcnJlY3QgcGFzc3dvcmRcIixcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTZXQgc2Vzc2lvbiB3aXRoIGNvbXBhbnlJZCBhbmQgd29ya2VySWRcbiAgICBhd2FpdCBzZXRTZXNzaW9uKGNvbXBhbnlJZCwgd29ya2VySWQpXG5cbiAgICAvLyBSZWNvcmQgbG9naW4gc2Vzc2lvbiBpbiBjb21wYW55J3Mgc2Vzc2lvbnMgY29sbGVjdGlvblxuICAgIGNvbnN0IHNlc3Npb25zQ29sbGVjdGlvbiA9IGF3YWl0IGdldENvbXBhbnlDb2xsZWN0aW9uKGNvbXBhbnlJZCwgXCJzZXNzaW9uc1wiKVxuICAgIGF3YWl0IHNlc3Npb25zQ29sbGVjdGlvbi5pbnNlcnRPbmUoe1xuICAgICAgd29ya2VySWQsXG4gICAgICBjb21wYW55SWQsXG4gICAgICBsb2dpbkF0OiBuZXcgRGF0ZSgpLFxuICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLFxuICAgIH0pXG5cbiAgICAvLyBSZWRpcmVjdCB0byBkYXNoYm9hcmQgKHRoaXMgd2lsbCB0aHJvdywgd2hpY2ggaXMgZXhwZWN0ZWQgaW4gTmV4dC5qcylcbiAgICByZWRpcmVjdChcIi9cIilcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyBJZiBpdCdzIGEgcmVkaXJlY3QgZXJyb3IsIGxldCBpdCBwcm9wYWdhdGVcbiAgICBpZiAoZXJyb3IgJiYgdHlwZW9mIGVycm9yID09PSBcIm9iamVjdFwiICYmIFwiZGlnZXN0XCIgaW4gZXJyb3IpIHtcbiAgICAgIHRocm93IGVycm9yXG4gICAgfVxuXG4gICAgY29uc29sZS5lcnJvcihcIkxvZ2luIGVycm9yOlwiLCBlcnJvcilcbiAgICByZXR1cm4ge1xuICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICBlcnJvcjogXCJBbiBlcnJvciBvY2N1cnJlZCBkdXJpbmcgbG9naW5cIixcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvZ291dCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgeyBjbGVhclNlc3Npb24gfSA9IGF3YWl0IGltcG9ydChcIi4vc2Vzc2lvblwiKVxuICBcbiAgLy8gQ2xlYXIgc2Vzc2lvbiBjb29raWVzXG4gIGF3YWl0IGNsZWFyU2Vzc2lvbigpXG4gIFxuICAvLyBJbiBhIHJlYWwgYXBwLCB5b3Ugd291bGQgYWxzbzpcbiAgLy8gMS4gSW52YWxpZGF0ZSBzZXNzaW9uIGluIGRhdGFiYXNlXG4gIC8vIDIuIExvZyBsb2dvdXQgZXZlbnRcbiAgXG4gIC8vIFJlZGlyZWN0IHRvIGxvZ2luIHBhZ2VcbiAgcmVkaXJlY3QoXCIvbG9naW5cIilcbn1cblxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiIyUkF1SXNCIn0=
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/auth/authClient.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "handleCompanyLogin",
    ()=>handleCompanyLogin,
    "handleLogin",
    ()=>handleLogin,
    "handleWorkerSelect",
    ()=>handleWorkerSelect
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$data$3a$e161a6__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/lib/auth/data:e161a6 [app-client] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$data$3a$e5cb36__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/lib/auth/data:e5cb36 [app-client] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$data$3a$75394a__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/lib/auth/data:75394a [app-client] (ecmascript) <text/javascript>");
"use client";
;
async function handleCompanyLogin(params) {
    try {
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$data$3a$e161a6__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["loginCompany"])(params.companyId, params.password);
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
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$data$3a$e5cb36__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["selectWorker"])(params.companyId, params.workerId);
        // If redirect is returned, handle it client-side
        if (result.redirect) {
            // Use window.location for client-side redirect
            if ("TURBOPACK compile-time truthy", 1) {
                window.location.href = result.redirect;
            }
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
            if ("TURBOPACK compile-time truthy", 1) {
                window.location.href = "/";
            }
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
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$data$3a$75394a__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["loginWorker"])(params.companyId, params.workerId, params.password);
        // If redirect is returned, handle it client-side
        if (result.redirect) {
            // Use window.location for client-side redirect
            if ("TURBOPACK compile-time truthy", 1) {
                window.location.href = result.redirect;
            }
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
            if ("TURBOPACK compile-time truthy", 1) {
                window.location.href = "/";
            }
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/auth/CompanyPasswordForm.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CompanyPasswordForm",
    ()=>CompanyPasswordForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/input.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/label.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$authClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/authClient.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function CompanyPasswordForm({ companyName, companyId, onSuccess, onBack }) {
    _s();
    const [password, setPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoggingIn, setIsLoggingIn] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleSubmit = async (e)=>{
        e.preventDefault();
        if (!password.trim()) {
            return;
        }
        setError(null);
        setIsLoggingIn(true);
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$authClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["handleCompanyLogin"])({
                companyId,
                password: password.trim()
            });
            if (!result.success) {
                setError(result.error || "Login failed");
                setPassword(""); // Clear password on error
            } else {
                // Success - call onSuccess to proceed to worker selection
                onSuccess();
            }
        } catch (err) {
            setError("An unexpected error occurred");
            setPassword("");
        } finally{
            setIsLoggingIn(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onBack,
                className: "flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: "w-4 h-4",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeWidth: 2,
                            d: "M15 19l-7-7 7-7"
                        }, void 0, false, {
                            fileName: "[project]/components/auth/CompanyPasswordForm.tsx",
                            lineNumber: 71,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/auth/CompanyPasswordForm.tsx",
                        lineNumber: 65,
                        columnNumber: 9
                    }, this),
                    "Back to company selection"
                ]
            }, void 0, true, {
                fileName: "[project]/components/auth/CompanyPasswordForm.tsx",
                lineNumber: 61,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center space-y-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-2xl font-bold text-gray-900",
                        children: [
                            "Login to ",
                            companyName
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/auth/CompanyPasswordForm.tsx",
                        lineNumber: 82,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-gray-600",
                        children: "Enter the company password to continue."
                    }, void 0, false, {
                        fileName: "[project]/components/auth/CompanyPasswordForm.tsx",
                        lineNumber: 85,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/auth/CompanyPasswordForm.tsx",
                lineNumber: 81,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: handleSubmit,
                className: "space-y-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                htmlFor: "password",
                                className: "text-sm font-medium text-gray-700",
                                children: "Company Password"
                            }, void 0, false, {
                                fileName: "[project]/components/auth/CompanyPasswordForm.tsx",
                                lineNumber: 92,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                id: "password",
                                type: "password",
                                value: password,
                                onChange: (e)=>{
                                    setPassword(e.target.value);
                                    setError(null); // Clear error when typing
                                },
                                disabled: isLoggingIn,
                                className: "mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                                placeholder: "Enter company password",
                                autoFocus: true
                            }, void 0, false, {
                                fileName: "[project]/components/auth/CompanyPasswordForm.tsx",
                                lineNumber: 95,
                                columnNumber: 11
                            }, this),
                            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-2 text-sm text-red-600",
                                children: error
                            }, void 0, false, {
                                fileName: "[project]/components/auth/CompanyPasswordForm.tsx",
                                lineNumber: 109,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/auth/CompanyPasswordForm.tsx",
                        lineNumber: 91,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                type: "submit",
                                disabled: !password.trim() || isLoggingIn,
                                className: "w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed",
                                children: isLoggingIn ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                            className: "w-4 h-4 mr-2 animate-spin"
                                        }, void 0, false, {
                                            fileName: "[project]/components/auth/CompanyPasswordForm.tsx",
                                            lineNumber: 121,
                                            columnNumber: 17
                                        }, this),
                                        "Logging in..."
                                    ]
                                }, void 0, true) : "Continue"
                            }, void 0, false, {
                                fileName: "[project]/components/auth/CompanyPasswordForm.tsx",
                                lineNumber: 114,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "text-sm text-gray-500 hover:text-gray-700 transition-colors",
                                children: "Forgot password?"
                            }, void 0, false, {
                                fileName: "[project]/components/auth/CompanyPasswordForm.tsx",
                                lineNumber: 128,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/auth/CompanyPasswordForm.tsx",
                        lineNumber: 113,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/auth/CompanyPasswordForm.tsx",
                lineNumber: 90,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/auth/CompanyPasswordForm.tsx",
        lineNumber: 60,
        columnNumber: 5
    }, this);
}
_s(CompanyPasswordForm, "m/o6duKqKk78ympFOcIqN+AZxLg=");
_c = CompanyPasswordForm;
var _c;
__turbopack_context__.k.register(_c, "CompanyPasswordForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/auth/WorkerSelector.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WorkerSelector",
    ()=>WorkerSelector
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/label.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$authClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/authClient.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function WorkerSelector({ companyName, workers, selectedWorkerId, onSelect, onBack, isLoading: isLoadingWorkers = false }) {
    _s();
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isSelecting, setIsSelecting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const selectedWorker = workers.find((w)=>w.id === selectedWorkerId);
    const handleWorkerClick = async (workerId)=>{
        // Immediately select the worker visually
        onSelect(workerId);
        setError(null);
        // Auto-submit after selection
        setIsSelecting(true);
        try {
            // Find companyId from the selected worker
            const companyId = workers.find((w)=>w.id === workerId)?.companyId;
            if (!companyId) {
                setError("Invalid worker selection");
                setIsSelecting(false);
                return;
            }
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$authClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["handleWorkerSelect"])({
                companyId,
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onBack,
                className: "flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: "w-4 h-4",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeWidth: 2,
                            d: "M15 19l-7-7 7-7"
                        }, void 0, false, {
                            fileName: "[project]/components/auth/WorkerSelector.tsx",
                            lineNumber: 89,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/auth/WorkerSelector.tsx",
                        lineNumber: 83,
                        columnNumber: 9
                    }, this),
                    "Back to company password"
                ]
            }, void 0, true, {
                fileName: "[project]/components/auth/WorkerSelector.tsx",
                lineNumber: 79,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center space-y-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-2xl font-bold text-gray-900",
                        children: "Select Worker Account"
                    }, void 0, false, {
                        fileName: "[project]/components/auth/WorkerSelector.tsx",
                        lineNumber: 100,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-gray-600",
                        children: "Choose your worker profile to continue."
                    }, void 0, false, {
                        fileName: "[project]/components/auth/WorkerSelector.tsx",
                        lineNumber: 103,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/auth/WorkerSelector.tsx",
                lineNumber: 99,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                className: "text-sm font-medium text-gray-700 mb-3 block",
                                children: "Available Workers"
                            }, void 0, false, {
                                fileName: "[project]/components/auth/WorkerSelector.tsx",
                                lineNumber: 111,
                                columnNumber: 11
                            }, this),
                            isLoadingWorkers ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center py-8 text-gray-500",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                        className: "w-6 h-6 animate-spin mx-auto mb-2"
                                    }, void 0, false, {
                                        fileName: "[project]/components/auth/WorkerSelector.tsx",
                                        lineNumber: 116,
                                        columnNumber: 15
                                    }, this),
                                    "Loading workers..."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/auth/WorkerSelector.tsx",
                                lineNumber: 115,
                                columnNumber: 13
                            }, this) : workers.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center py-8 text-gray-500",
                                children: "No workers found for this company"
                            }, void 0, false, {
                                fileName: "[project]/components/auth/WorkerSelector.tsx",
                                lineNumber: 120,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3",
                                children: workers.map((worker)=>{
                                    const isSelected = selectedWorkerId === worker.id;
                                    const isProcessing = isSelected && isSelecting;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                        onClick: ()=>!isSelecting && handleWorkerClick(worker.id),
                                        className: `
                      p-4 cursor-pointer transition-all duration-200
                      ${isSelected ? "border-2 border-blue-600 bg-blue-50 shadow-md" : "border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"}
                      ${isSelecting ? "opacity-50 cursor-wait" : ""}
                    `,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `
                          w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm
                          ${worker.avatarColor}
                        `,
                                                    children: getInitials(worker.name)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/auth/WorkerSelector.tsx",
                                                    lineNumber: 142,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1 min-w-0",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "font-medium text-gray-900 truncate",
                                                            children: worker.name
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/auth/WorkerSelector.tsx",
                                                            lineNumber: 151,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs text-gray-600",
                                                            children: worker.role
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/auth/WorkerSelector.tsx",
                                                            lineNumber: 154,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/auth/WorkerSelector.tsx",
                                                    lineNumber: 150,
                                                    columnNumber: 23
                                                }, this),
                                                isSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-2 flex-shrink-0",
                                                    children: isProcessing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                        className: "w-4 h-4 animate-spin text-blue-600"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/auth/WorkerSelector.tsx",
                                                        lineNumber: 159,
                                                        columnNumber: 29
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                            className: "w-3 h-3 text-white",
                                                            fill: "none",
                                                            stroke: "currentColor",
                                                            viewBox: "0 0 24 24",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                strokeLinecap: "round",
                                                                strokeLinejoin: "round",
                                                                strokeWidth: 2,
                                                                d: "M5 13l4 4L19 7"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/auth/WorkerSelector.tsx",
                                                                lineNumber: 168,
                                                                columnNumber: 33
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/auth/WorkerSelector.tsx",
                                                            lineNumber: 162,
                                                            columnNumber: 31
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/auth/WorkerSelector.tsx",
                                                        lineNumber: 161,
                                                        columnNumber: 29
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/auth/WorkerSelector.tsx",
                                                    lineNumber: 157,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/auth/WorkerSelector.tsx",
                                            lineNumber: 141,
                                            columnNumber: 21
                                        }, this)
                                    }, worker.id, false, {
                                        fileName: "[project]/components/auth/WorkerSelector.tsx",
                                        lineNumber: 129,
                                        columnNumber: 19
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/components/auth/WorkerSelector.tsx",
                                lineNumber: 124,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/auth/WorkerSelector.tsx",
                        lineNumber: 110,
                        columnNumber: 9
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-3 bg-red-50 border border-red-200 rounded-lg",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-red-600",
                            children: error
                        }, void 0, false, {
                            fileName: "[project]/components/auth/WorkerSelector.tsx",
                            lineNumber: 189,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/auth/WorkerSelector.tsx",
                        lineNumber: 188,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/auth/WorkerSelector.tsx",
                lineNumber: 108,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/auth/WorkerSelector.tsx",
        lineNumber: 78,
        columnNumber: 5
    }, this);
}
_s(WorkerSelector, "FHGiTMlBbjhPLLOIv1xmifsdLM8=");
_c = WorkerSelector;
var _c;
__turbopack_context__.k.register(_c, "WorkerSelector");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/companies/data:e797ca [app-client] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"40a0f5fbdc65e39265f0539e0044af3d7c60b4fca8":"getCompanyWorkers"},"lib/companies/workers.ts",""] */ __turbopack_context__.s([
    "getCompanyWorkers",
    ()=>getCompanyWorkers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
"use turbopack no side effects";
;
var getCompanyWorkers = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("40a0f5fbdc65e39265f0539e0044af3d7c60b4fca8", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "getCompanyWorkers"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vd29ya2Vycy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzZXJ2ZXJcIlxuXG5pbXBvcnQgeyBnZXRDb21wYW55Q29sbGVjdGlvbiB9IGZyb20gXCJAL2xpYi9kYi9jb21wYW55RGJcIlxuaW1wb3J0IHR5cGUgeyBXb3JrZXIgfSBmcm9tIFwiQC9saWIvYXV0aC9tb2NrRGF0YVwiXG5cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2VyV2l0aFBhc3N3b3JkIGV4dGVuZHMgV29ya2VyIHtcbiAgcGFzc3dvcmQ/OiBzdHJpbmdcbn1cblxuLyoqXG4gKiBHZXQgYWxsIHdvcmtlcnMgZm9yIGEgc3BlY2lmaWMgY29tcGFueVxuICogUmVhZHMgZnJvbSBjb21wYW55LXNjb3BlZCB3b3JrZXJzIGNvbGxlY3Rpb25cbiAqIFNlcmlhbGl6ZXMgTW9uZ29EQiBkb2N1bWVudHMgdG8gcGxhaW4gb2JqZWN0cyBmb3IgQ2xpZW50IENvbXBvbmVudHNcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldENvbXBhbnlXb3JrZXJzKGNvbXBhbnlJZDogc3RyaW5nKTogUHJvbWlzZTxXb3JrZXJbXT4ge1xuICBjb25zdCB3b3JrZXJzQ29sbGVjdGlvbiA9IGF3YWl0IGdldENvbXBhbnlDb2xsZWN0aW9uPFdvcmtlcldpdGhQYXNzd29yZD4oXG4gICAgY29tcGFueUlkLFxuICAgIFwid29ya2Vyc1wiXG4gIClcblxuICBjb25zdCB3b3JrZXJzID0gYXdhaXQgd29ya2Vyc0NvbGxlY3Rpb24uZmluZCh7fSkudG9BcnJheSgpXG5cbiAgLy8gU2VyaWFsaXplIE1vbmdvREIgZG9jdW1lbnRzIGFuZCByZW1vdmUgcGFzc3dvcmQgZnJvbSByZXNwb25zZVxuICByZXR1cm4gd29ya2Vycy5tYXAoKHdvcmtlcjogYW55KSA9PiB7XG4gICAgY29uc3QgeyBwYXNzd29yZCwgX2lkLCAuLi53b3JrZXJEYXRhIH0gPSB3b3JrZXJcbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IHdvcmtlckRhdGEuaWQsXG4gICAgICBuYW1lOiB3b3JrZXJEYXRhLm5hbWUsXG4gICAgICByb2xlOiB3b3JrZXJEYXRhLnJvbGUsXG4gICAgICBhdmF0YXJDb2xvcjogd29ya2VyRGF0YS5hdmF0YXJDb2xvcixcbiAgICAgIGNvbXBhbnlJZDogd29ya2VyRGF0YS5jb21wYW55SWQsXG4gICAgfVxuICB9KVxufVxuXG4vKipcbiAqIEdldCBhIHNpbmdsZSB3b3JrZXIgYnkgSUQgKGNvbXBhbnktc2NvcGVkKVxuICogU2VyaWFsaXplcyBNb25nb0RCIGRvY3VtZW50IHRvIHBsYWluIG9iamVjdFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0Q29tcGFueVdvcmtlcihcbiAgY29tcGFueUlkOiBzdHJpbmcsXG4gIHdvcmtlcklkOiBzdHJpbmdcbik6IFByb21pc2U8V29ya2VyV2l0aFBhc3N3b3JkIHwgbnVsbD4ge1xuICBjb25zdCB3b3JrZXJzQ29sbGVjdGlvbiA9IGF3YWl0IGdldENvbXBhbnlDb2xsZWN0aW9uPFdvcmtlcldpdGhQYXNzd29yZD4oXG4gICAgY29tcGFueUlkLFxuICAgIFwid29ya2Vyc1wiXG4gIClcblxuICBjb25zdCB3b3JrZXIgPSBhd2FpdCB3b3JrZXJzQ29sbGVjdGlvbi5maW5kT25lKHsgaWQ6IHdvcmtlcklkIH0pXG4gIFxuICBpZiAoIXdvcmtlcikgcmV0dXJuIG51bGxcblxuICAvLyBTZXJpYWxpemUgTW9uZ29EQiBkb2N1bWVudCB0byBwbGFpbiBvYmplY3RcbiAgY29uc3QgeyBfaWQsIC4uLndvcmtlckRhdGEgfSA9IHdvcmtlclxuICByZXR1cm4gd29ya2VyRGF0YVxufVxuXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Im1TQWNzQiJ9
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/(auth)/login/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LoginPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$auth$2f$CompanySelector$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/auth/CompanySelector.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$auth$2f$CompanyPasswordForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/auth/CompanyPasswordForm.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$auth$2f$WorkerSelector$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/auth/WorkerSelector.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$companies$2f$data$3a$e797ca__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/lib/companies/data:e797ca [app-client] (ecmascript) <text/javascript>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/truck.js [app-client] (ecmascript) <export default as Truck>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
function LoginPage() {
    _s();
    const [step, setStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("company");
    const [selectedCompanyId, setSelectedCompanyId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedWorkerId, setSelectedWorkerId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [companies, setCompanies] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [companyWorkers, setCompanyWorkers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isLoadingWorkers, setIsLoadingWorkers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const selectedCompany = companies.find((c)=>c.companyId === selectedCompanyId);
    // Load companies on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LoginPage.useEffect": ()=>{
            async function loadCompanies() {
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
                }
            }
            loadCompanies();
        }
    }["LoginPage.useEffect"], []);
    // Load workers when company is authenticated (after password step)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LoginPage.useEffect": ()=>{
            async function loadWorkers() {
                if (!selectedCompanyId || step !== "worker") {
                    setCompanyWorkers([]);
                    return;
                }
                setIsLoadingWorkers(true);
                try {
                    const workers = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$companies$2f$data$3a$e797ca__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["getCompanyWorkers"])(selectedCompanyId);
                    setCompanyWorkers(workers);
                } catch (error) {
                    console.error("Error loading workers:", error);
                    setCompanyWorkers([]);
                } finally{
                    setIsLoadingWorkers(false);
                }
            }
            loadWorkers();
        }
    }["LoginPage.useEffect"], [
        selectedCompanyId,
        step
    ]);
    const handleCompanyContinue = ()=>{
        if (selectedCompanyId) {
            setStep("password");
        }
    };
    const handlePasswordSuccess = ()=>{
        // After company password is verified, move to worker selection
        setStep("worker");
        setSelectedWorkerId(null); // Reset worker selection
    };
    const handleBackToCompany = ()=>{
        setStep("company");
        setSelectedWorkerId(null); // Reset worker selection when going back
    };
    const handleBackToPassword = ()=>{
        setStep("password");
        setSelectedWorkerId(null); // Reset worker selection when going back
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gray-50 flex items-center justify-center p-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full max-w-4xl",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center mb-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-center gap-3 mb-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__["Truck"], {
                                        className: "w-7 h-7 text-white"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(auth)/login/page.tsx",
                                        lineNumber: 96,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/(auth)/login/page.tsx",
                                    lineNumber: 95,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-2xl font-bold text-gray-900",
                                    children: "XP Agency"
                                }, void 0, false, {
                                    fileName: "[project]/app/(auth)/login/page.tsx",
                                    lineNumber: 98,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(auth)/login/page.tsx",
                            lineNumber: 94,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-gray-600",
                            children: "Logistics Platform"
                        }, void 0, false, {
                            fileName: "[project]/app/(auth)/login/page.tsx",
                            lineNumber: 100,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/(auth)/login/page.tsx",
                    lineNumber: 93,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-center gap-2 md:gap-4 mb-6 flex-wrap",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${step === "company" ? "bg-blue-600 text-white" : step === "password" || step === "worker" ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"}
              `,
                                    children: step === "company" ? "1" : "✓"
                                }, void 0, false, {
                                    fileName: "[project]/app/(auth)/login/page.tsx",
                                    lineNumber: 106,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `text-xs md:text-sm font-medium ${step === "company" ? "text-gray-900" : "text-gray-500"}`,
                                    children: "Company"
                                }, void 0, false, {
                                    fileName: "[project]/app/(auth)/login/page.tsx",
                                    lineNumber: 119,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(auth)/login/page.tsx",
                            lineNumber: 105,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-8 md:w-12 h-0.5 bg-gray-300"
                        }, void 0, false, {
                            fileName: "[project]/app/(auth)/login/page.tsx",
                            lineNumber: 127,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${step === "password" ? "bg-blue-600 text-white" : step === "worker" ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"}
              `,
                                    children: step === "password" ? "2" : step === "worker" ? "✓" : "2"
                                }, void 0, false, {
                                    fileName: "[project]/app/(auth)/login/page.tsx",
                                    lineNumber: 129,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `text-xs md:text-sm font-medium ${step === "password" ? "text-gray-900" : "text-gray-500"}`,
                                    children: "Password"
                                }, void 0, false, {
                                    fileName: "[project]/app/(auth)/login/page.tsx",
                                    lineNumber: 142,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(auth)/login/page.tsx",
                            lineNumber: 128,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-8 md:w-12 h-0.5 bg-gray-300"
                        }, void 0, false, {
                            fileName: "[project]/app/(auth)/login/page.tsx",
                            lineNumber: 150,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${step === "worker" ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"}
              `,
                                    children: "3"
                                }, void 0, false, {
                                    fileName: "[project]/app/(auth)/login/page.tsx",
                                    lineNumber: 152,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `text-xs md:text-sm font-medium ${step === "worker" ? "text-gray-900" : "text-gray-500"}`,
                                    children: "Worker"
                                }, void 0, false, {
                                    fileName: "[project]/app/(auth)/login/page.tsx",
                                    lineNumber: 163,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(auth)/login/page.tsx",
                            lineNumber: 151,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/(auth)/login/page.tsx",
                    lineNumber: 104,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                    className: "p-6 md:p-8 bg-white border-gray-200 shadow-lg",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `
              transition-opacity duration-300
              ${step === "company" ? "opacity-100" : "hidden"}
            `,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$auth$2f$CompanySelector$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CompanySelector"], {
                                companies: companies.map((c)=>({
                                        id: c.companyId,
                                        name: c.name,
                                        description: c.description || "",
                                        logoInitials: c.logoInitials || c.name.substring(0, 2).toUpperCase()
                                    })),
                                selectedCompanyId: selectedCompanyId,
                                onSelect: setSelectedCompanyId,
                                onContinue: handleCompanyContinue
                            }, void 0, false, {
                                fileName: "[project]/app/(auth)/login/page.tsx",
                                lineNumber: 181,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/(auth)/login/page.tsx",
                            lineNumber: 175,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `
              transition-opacity duration-300
              ${step === "password" ? "opacity-100" : "hidden"}
            `,
                            children: selectedCompany && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$auth$2f$CompanyPasswordForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CompanyPasswordForm"], {
                                companyName: selectedCompany.name,
                                companyId: selectedCompany.companyId,
                                onSuccess: handlePasswordSuccess,
                                onBack: handleBackToCompany
                            }, void 0, false, {
                                fileName: "[project]/app/(auth)/login/page.tsx",
                                lineNumber: 201,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/(auth)/login/page.tsx",
                            lineNumber: 194,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `
              transition-opacity duration-300
              ${step === "worker" ? "opacity-100" : "hidden"}
            `,
                            children: selectedCompany && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$auth$2f$WorkerSelector$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WorkerSelector"], {
                                companyName: selectedCompany.name,
                                workers: companyWorkers,
                                selectedWorkerId: selectedWorkerId,
                                onSelect: setSelectedWorkerId,
                                onBack: handleBackToPassword,
                                isLoading: isLoadingWorkers
                            }, void 0, false, {
                                fileName: "[project]/app/(auth)/login/page.tsx",
                                lineNumber: 217,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/(auth)/login/page.tsx",
                            lineNumber: 210,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/(auth)/login/page.tsx",
                    lineNumber: 174,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/(auth)/login/page.tsx",
            lineNumber: 91,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/(auth)/login/page.tsx",
        lineNumber: 90,
        columnNumber: 5
    }, this);
}
_s(LoginPage, "Tika010gSDco0JEVftKwishQz7U=");
_c = LoginPage;
var _c;
__turbopack_context__.k.register(_c, "LoginPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_3e1ccc54._.js.map