import { SignupForm } from "@/features/auth/components/signup-form.client";

type SignupPageProps = {
  searchParams: Promise<{
    redirectTo?: string;
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;

  return <SignupForm redirectTo={params.redirectTo ?? "/dashboard"} />;
}
