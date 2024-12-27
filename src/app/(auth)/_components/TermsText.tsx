// src/app/(auth)/_components/TermsText.tsx
import Link from "next/link";

export function TermsText() {
  return (
    <p className="text-center text-xs text-gray-500">
      By continuing, you agree to our{" "}
      <Link href="/terms" className="text-red-800 hover:text-red-600">
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link href="/privacy" className="text-red-800 hover:text-red-600">
        Privacy Policy
      </Link>
    </p>
  );
}
