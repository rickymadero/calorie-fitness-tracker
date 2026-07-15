/** Resolve where a signed-in user should land. Never requires email verification. */
export function getPostAuthPath(user: {
  onboardingComplete: boolean;
  introSeen: boolean;
  pricingSeen: boolean;
} | null): string {
  if (!user) return "/";
  if (!user.onboardingComplete) return "/onboarding";
  if (!user.introSeen) return "/intro";
  if (!user.pricingSeen) return "/pricing";
  return "/feed";
}
