"use client";

import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { TrainingProvider } from "@/components/training/TrainingProvider";
import { SocialProvider } from "@/components/social/SocialProvider";
import { PostsProvider } from "@/components/posts/PostsProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <SocialProvider>
            <PostsProvider>
              <TrainingProvider>{children}</TrainingProvider>
            </PostsProvider>
          </SocialProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
