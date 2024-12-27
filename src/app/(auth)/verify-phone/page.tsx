// src/app/(auth)/verify-phone/page.tsx
import { AuthLayout } from "../_components/AuthLayout";
import { VerificationForm } from "./_components/VerificationForm";

const sidebarContent = (
  <div className="space-y-6 text-red-800">
    <p className="text-lg">
      Phone verification helps us keep your account secure and allows us to send
      you important updates about your orders.
    </p>
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Why verify your phone?</h2>
      <div className="space-y-2">
        <p>🔒 Enhanced account security</p>
        <p>📱 Order status updates via SMS</p>
        <p>🔔 Delivery notifications</p>
        <p>💌 Exclusive SMS offers</p>
      </div>
    </div>
  </div>
);

export default function VerifyPhonePage() {
  return (
    <AuthLayout
      heading="Verify Your Phone"
      subheading="One Last Step to Secure Your Account"
      sidebarContent={sidebarContent}
    >
      <VerificationForm />
    </AuthLayout>
  );
}
