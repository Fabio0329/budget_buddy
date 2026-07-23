import { SignupForm } from "@/app/signup/_components/signup-form.client";
import { AuthPageShell } from "@/shared/components/auth-page-shell";

type SignupPageProps = {
  searchParams: Promise<{
    redirectTo?: string;
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;

  return (
    <AuthPageShell>
      <SignupForm redirectTo={params.redirectTo ?? "/dashboard"} />
    </AuthPageShell>
  );
}
