import { Suspense } from "react";
import AuthLayout from "@/components/layout/AuthLayout";
import SignUpForm from "@/components/ui/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account - Certitude Atelier",
  description: "Create a new customer account at Certitude Atelier.",
};

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Certitude Atelier to track orders, manage your profile, and receive updates."
    >
      <Suspense fallback={<div className="text-center text-xs text-stone-500 font-light py-8">Loading form...</div>}>
        <SignUpForm />
      </Suspense>
    </AuthLayout>
  );
}
