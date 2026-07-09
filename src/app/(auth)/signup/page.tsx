import { RoutePlaceholder } from "@/components/route-placeholder";

export default function SignupPage() {
  return (
    <RoutePlaceholder
      eyebrow="Signup"
      title="Registration UX follows in the next commit."
      description="This route is intentionally scaffolded only. The next phase will add form fields, validation, and a mock onboarding transition."
      bullets={[
        "Name, email, and password inputs",
        "Inline validation messaging",
        "Post-signup redirect into the app shell",
      ]}
    />
  );
}
