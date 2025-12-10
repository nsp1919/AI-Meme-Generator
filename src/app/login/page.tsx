import { signInAction } from "@/app/(auth-pages)/actions";
import { AuthForm } from "@/components/auth-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        return redirect("/");
    }

    return (
        <div className="flex h-screen w-full items-center justify-center px-4">
            <AuthForm type="login" action={signInAction} />
        </div>
    );
}
