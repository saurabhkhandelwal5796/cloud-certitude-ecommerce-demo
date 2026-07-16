import AuthLayout from "@/components/layout/AuthLayout";
import ResetPasswordForm from "@/components/ui/ResetPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password - Certitude Atelier",
  description: "Set a new password for your customer account at Certitude Atelier.",
};

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Please enter and confirm your new secure password below."
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}
