import AuthLayout from "@/components/layout/AuthLayout";
import ForgotPasswordForm from "@/components/ui/ForgotPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recover Password - Certitude Atelier",
  description: "Request a password recovery link from Certitude Atelier.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email address and we'll send you a recovery link."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
