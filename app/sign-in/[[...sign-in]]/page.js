import { SignIn } from "@clerk/nextjs";

export default function SignInCatchAll() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignIn redirectUrl="/checkout" />
    </div>
  );
}
