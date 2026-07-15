"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell, SocialAuthButtons, AuthDivider } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { StepProgress } from "@/components/ui/StepProgress";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { passwordStrength } from "@/lib/calculations/nutrition";
import { COUNTRIES } from "@/lib/mock/data";
import type { MeasurementSystem } from "@/lib/types";

const STEPS = ["Account", "Security", "Profile", "Preferences"];

export default function RegisterPage() {
  const { registerDraft, updateRegisterDraft, completeRegistration, clearRegisterDraft } =
    useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const strength = useMemo(
    () => passwordStrength(registerDraft.password),
    [registerDraft.password],
  );

  function validateStep(step: number): boolean {
    const next: Record<string, string> = {};
    if (step === 0) {
      if (!registerDraft.fullName.trim()) next.fullName = "Full name is required.";
      if (!registerDraft.email.includes("@")) next.email = "Enter a valid email.";
    }
    if (step === 1) {
      if (strength.score < 3) next.password = "Choose a stronger password.";
      if (registerDraft.password !== registerDraft.confirmPassword) {
        next.confirmPassword = "Passwords do not match.";
      }
    }
    if (step === 2) {
      if (!registerDraft.dateOfBirth) next.dateOfBirth = "Date of birth is required.";
      else {
        const age =
          (Date.now() - new Date(registerDraft.dateOfBirth).getTime()) /
          (1000 * 60 * 60 * 24 * 365.25);
        if (age < 13) next.dateOfBirth = "You must be at least 13 years old.";
      }
      if (!registerDraft.country) next.country = "Select your country.";
    }
    if (step === 3) {
      if (!registerDraft.agreedToTerms) {
        next.agreedToTerms = "Accept the terms to continue.";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function next() {
    if (!validateStep(registerDraft.step)) return;
    updateRegisterDraft({ step: registerDraft.step + 1 });
    toast("Progress saved.", "info");
  }

  function back() {
    updateRegisterDraft({ step: Math.max(0, registerDraft.step - 1) });
    setErrors({});
  }

  async function finish() {
    if (!validateStep(3)) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    completeRegistration();
    clearRegisterDraft();
    setLoading(false);
    toast("Account created. Set up your social profile next.", "success");
    router.push("/onboarding");
  }

  return (
    <AuthShell showQuote={false}>
      <div>
        <h2 className="font-display text-2xl font-bold">Create account</h2>
        <p className="mt-2 text-sm text-muted">
          Join the free social fitness network. Already have one?{" "}
          <Link href="/login" className="font-medium text-accent-dim dark:text-accent">
            Log in
          </Link>
        </p>

        {registerDraft.step === 0 && (
          <div className="mt-8">
            <SocialAuthButtons layout="instagram-first" />
            <AuthDivider label="or sign up with email" />
          </div>
        )}

        <div className={registerDraft.step === 0 ? "" : "mt-6"}>
          <StepProgress
            current={registerDraft.step}
            total={STEPS.length}
            label={STEPS[registerDraft.step]}
          />
        </div>

        <div className="mt-8 space-y-4">
          {registerDraft.step === 0 && (
            <>
              <Input
                label="Full name"
                value={registerDraft.fullName}
                onChange={(e) => updateRegisterDraft({ fullName: e.target.value })}
                error={errors.fullName}
                placeholder="Alex Rivera"
              />
              <Input
                label="Email address"
                type="email"
                value={registerDraft.email}
                onChange={(e) => updateRegisterDraft({ email: e.target.value })}
                error={errors.email}
                placeholder="you@email.com"
              />
            </>
          )}

          {registerDraft.step === 1 && (
            <>
              <Input
                label="Password"
                type="password"
                value={registerDraft.password}
                onChange={(e) => updateRegisterDraft({ password: e.target.value })}
                error={errors.password}
                placeholder="Create a strong password"
              />
              {registerDraft.password && (
                <div>
                  <div className="mb-1 flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${
                          i < strength.score ? "bg-accent" : "bg-ring-track"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted">
                    Strength: {strength.label}
                    {strength.hints[0] ? ` — ${strength.hints[0]}` : ""}
                  </p>
                </div>
              )}
              <Input
                label="Confirm password"
                type="password"
                value={registerDraft.confirmPassword}
                onChange={(e) =>
                  updateRegisterDraft({ confirmPassword: e.target.value })
                }
                error={errors.confirmPassword}
              />
            </>
          )}

          {registerDraft.step === 2 && (
            <>
              <Input
                label="Date of birth"
                type="date"
                value={registerDraft.dateOfBirth}
                onChange={(e) => updateRegisterDraft({ dateOfBirth: e.target.value })}
                error={errors.dateOfBirth}
              />
              <Select
                label="Country"
                value={registerDraft.country}
                onChange={(e) => updateRegisterDraft({ country: e.target.value })}
                error={errors.country}
                placeholder="Select country"
                options={COUNTRIES.map((c) => ({ value: c, label: c }))}
              />
            </>
          )}

          {registerDraft.step === 3 && (
            <>
              <div>
                <p className="mb-2 text-sm font-medium">Preferred measurement system</p>
                <div className="grid grid-cols-2 gap-3">
                  {(["metric", "imperial"] as MeasurementSystem[]).map((system) => (
                    <button
                      key={system}
                      type="button"
                      onClick={() => updateRegisterDraft({ measurementSystem: system })}
                      className={`rounded-2xl border px-4 py-3 text-sm font-medium capitalize transition ${
                        registerDraft.measurementSystem === system
                          ? "border-accent bg-accent-soft"
                          : "border-border hover:border-accent/40"
                      }`}
                    >
                      {system}
                    </button>
                  ))}
                </div>
              </div>
              <Checkbox
                label={
                  <>
                    I agree to the{" "}
                    <span className="underline">Terms of Service</span> and{" "}
                    <span className="underline">Privacy Policy</span>
                  </>
                }
                checked={registerDraft.agreedToTerms}
                onChange={(e) =>
                  updateRegisterDraft({ agreedToTerms: e.target.checked })
                }
                error={errors.agreedToTerms}
              />
            </>
          )}
        </div>

        <div className="mt-8 flex gap-3">
          {registerDraft.step > 0 && (
            <Button type="button" variant="outline" onClick={back} className="flex-1">
              Back
            </Button>
          )}
          {registerDraft.step < STEPS.length - 1 ? (
            <Button type="button" onClick={next} className="flex-1">
              Continue
            </Button>
          ) : (
            <Button type="button" onClick={finish} loading={loading} className="flex-1">
              Create account
            </Button>
          )}
        </div>

      </div>
    </AuthShell>
  );
}
