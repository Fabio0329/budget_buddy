import { RoutePlaceholder } from "@/components/route-placeholder";

export default function LoginPage() {
  return (
    <RoutePlaceholder
      eyebrow="Login"
      title="Sign-in UI lands in phase 2."
      description="The auth route exists now so the protected app flow and navigation structure can be reviewed before form behavior is added."
      bullets={[
        "Validated email/password form",
        "Mock submit state and redirect behavior",
        "Error and pending interaction states",
      ]}
    />
  );
}
