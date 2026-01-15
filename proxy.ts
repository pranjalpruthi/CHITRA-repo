import { NextResponse } from "next/server";
import appConfig from "./config";

let clerkMiddleware: (arg0: (auth: any, req: any) => any) => { (arg0: any): any; new(): any; }, createRouteMatcher;

if (appConfig.auth.enabled) {
    try {
        ({ clerkMiddleware, createRouteMatcher } = require("@clerk/nextjs/server"));
    } catch (error) {
        console.warn("Clerk modules not available. Auth will be disabled.");
        appConfig.auth.enabled = false;
    }
}

const isProtectedRoute = appConfig.auth.enabled
    ? createRouteMatcher(["/dashboard(.*)"])
    : () => false;

export default function proxy(req: any) {
    if (appConfig.auth.enabled) {
        return clerkMiddleware((auth, req) => {
            if (!auth().userId && isProtectedRoute(req)) {
                return auth().redirectToSignIn();
            } else {
                return NextResponse.next();
            }
        })(req);
    } else {
        return NextResponse.next();
    }
}

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
