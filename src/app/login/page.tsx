import { LoginForm } from "@/app/login/_components/login-form.client";
import { AuthPageShell } from "@/shared/components/auth-page-shell";

type LoginPageProps = {
  searchParams: Promise<{
    redirectTo?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <AuthPageShell>
      <LoginForm redirectTo={params.redirectTo ?? "/dashboard"} />
    </AuthPageShell>
  );
}
