// src/app/(auth)/login/page.tsx
import { AuthLayout } from "../_components/AuthLayout";
import { LoginForm } from "./_components/LoginForm";

const sidebarContent = (
  <div className="space-y-6 text-red-800">
    <p className="text-lg">
      Welcome to Amamma&apos;s Kitchen, where traditional South Indian
      pickle-making meets modern convenience. Our recipes have been passed down
      through generations, preserving the authentic tastes of home.
    </p>
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Why Choose Us?</h2>
      <div className="space-y-2">
        <p>🌿 100% Natural Ingredients</p>
        <p>👩‍🍳 Traditional Family Recipes</p>
        <p>🏆 Premium Quality Assurance</p>
        <p>🚚 Pan India Delivery</p>
      </div>
    </div>
  </div>
);

export default function LoginPage() {
  return (
    <AuthLayout
      heading="Amamma's Kitchen"
      subheading="South Indian Pickles, Crafted with Love"
      sidebarContent={sidebarContent}
    >
      <LoginForm />
    </AuthLayout>
  );
}
