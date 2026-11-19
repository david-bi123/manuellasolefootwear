import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getSiteStatus } from "@/lib/services/site";
import { LoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect("/admin/dashboard");

  const [site, next] = await Promise.all([
    getSiteStatus(),
    Promise.resolve(typeof params.next === "string" ? params.next : undefined),
  ]);

  return <LoginForm next={next} paused={site.status === "paused"} />;
}
