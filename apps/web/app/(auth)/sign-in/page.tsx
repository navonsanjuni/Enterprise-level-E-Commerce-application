import Link from "next/link";
import { Container } from "@tasheen/ui";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Sign In",
  description:
    "Welcome back to Tasheen — sign in to continue your story.",
  path: "/sign-in",
});

export default function SignInPage() {
  return (
    <Container size="narrow" className="flex flex-1 items-center py-16">
      <div className="w-full space-y-6 text-center">
        <h1 className="font-serif text-4xl text-charcoal">Welcome back</h1>
        <p className="text-sm text-slate-muted">
          Sign in form coming next. For now, head over to{" "}
          <Link
            href="/sign-up"
            className="font-medium text-charcoal underline underline-offset-4 hover:text-gold"
          >
            Sign up
          </Link>
          .
        </p>
      </div>
    </Container>
  );
}
