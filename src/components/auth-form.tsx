"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface AuthFormProps {
    type: "login" | "signup";
    action: (prevState: any, formData: FormData) => Promise<{ error?: string; success?: string }>;
}

export function AuthForm({ type, action }: AuthFormProps) {
    const [state, formAction, isPending] = useActionState(action, {});

    return (
        <form action={formAction} className="flex flex-col w-full max-w-md gap-4 p-8 border rounded-lg shadow-sm bg-card text-card-foreground">
            <h1 className="text-2xl font-bold text-center">
                {type === "login" ? "Sign In" : "Sign Up"}
            </h1>
            <p className="text-sm text-center text-muted-foreground">
                {type === "login"
                    ? "Enter your email below to login to your account"
                    : "Create an account to start generating memes"}
            </p>

            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input name="email" id="email" type="email" placeholder="m@example.com" required />
            </div>

            <div className="grid gap-2">
                <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    {type === "login" && (
                        <Link href="/forgot-password" className="ml-auto inline-block text-sm underline">
                            Forgot your password?
                        </Link>
                    )}
                </div>
                <Input name="password" id="password" type="password" required minLength={6} />
            </div>

            {state?.error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded border border-red-200">
                    {state.error}
                </div>
            )}

            {state?.success && (
                <div className="p-3 text-sm text-green-500 bg-green-50 rounded border border-green-200">
                    {state.success}
                </div>
            )}

            <Button disabled={isPending} className="w-full">
                {isPending ? "Loading..." : type === "login" ? "Login" : "Sign Up"}
            </Button>

            <div className="mt-4 text-center text-sm">
                {type === "login" ? (
                    <>
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="underline">
                            Sign up
                        </Link>
                    </>
                ) : (
                    <>
                        Already have an account?{" "}
                        <Link href="/login" className="underline">
                            Sign in
                        </Link>
                    </>
                )}
            </div>
        </form>
    );
}
