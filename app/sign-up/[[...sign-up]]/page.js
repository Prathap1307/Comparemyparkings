import { SignUp } from "@clerk/nextjs";

export default function SignUpCatchAll() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignUp afterSignInUrl="/checkout" afterSignUpUrl="/checkout" />
    </div>
  );
}
