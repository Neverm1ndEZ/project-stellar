// src/app/(auth)/register/page.tsx
import { AuthLayout } from "../_components/AuthLayout";
import { RegisterForm } from "./_components/RegisterForm";

const sidebarContent = (
  <div className="space-y-6 text-red-800">
    <p className="text-lg">
      Creating an account lets you order delicious pickles, track your orders,
      and get exclusive offers tailored just for you.
    </p>
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Member Benefits</h2>
      <div className="space-y-2">
        <p>🎁 Get ₹100 off on your first order</p>
        <p>📦 Free shipping on orders above ₹500</p>
        <p>🎯 Exclusive access to limited editions</p>
        <p>💝 Special birthday offers</p>
      </div>
    </div>
  </div>
);

export default function RegisterPage() {
  return (
    <AuthLayout
      heading="Join Our Family"
      subheading="Start Your Culinary Journey with Us"
      sidebarContent={sidebarContent}
    >
      <RegisterForm />
    </AuthLayout>
  );
}
