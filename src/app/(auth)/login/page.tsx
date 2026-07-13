import { LoginForm } from "@/features/auth/components/login-form.client";

type LoginPageProps = {
  searchParams: Promise<{
    redirectTo?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return <LoginForm redirectTo={params.redirectTo ?? "/dashboard"} />;
}
