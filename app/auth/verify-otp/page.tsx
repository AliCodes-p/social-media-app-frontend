import { Suspense } from "react";
import OtpForm from "./OtpForm";

export default function OtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <OtpForm />
    </Suspense>
  );
}
