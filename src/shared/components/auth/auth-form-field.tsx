type InputType = "email" | "password" | "text";

export function AuthFormField({
  name,
  label,
  type = "text",
  placeholder,
  defaultValue,
  error,
  autoComplete,
}: Readonly<{
  name: string;
  label: string;
  type?: InputType;
  placeholder: string;
  defaultValue?: string;
  error?: string;
  autoComplete?: string;
}>) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <input
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-primary focus:bg-surface"
        defaultValue={defaultValue}
        name={name}
        placeholder={placeholder}
        type={type}
      />
      {error ? <span className="text-sm text-negative">{error}</span> : null}
    </label>
  );
}
