/** Resolve where a signed-in user should land. Never requires email verification. */
export function getPostAuthPath(user: {
  onboardingComplete: boolean;
  introSeen?: boolean;
  pricingSeen?: boolean;
} | null): string {
  if (!user) return "/";
  if (!user.onboardingComplete) return "/onboarding";
  return "/feed";
}
