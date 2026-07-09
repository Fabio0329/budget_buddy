import { SignupForm } from "@/components/signup-form";

type SignupPageProps = {
  searchParams: Promise<{
    redirectTo?: string;
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;

  return <SignupForm redirectTo={params.redirectTo ?? "/dashboard"} />;
}
