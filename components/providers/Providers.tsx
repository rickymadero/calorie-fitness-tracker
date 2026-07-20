"use client";

import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { TrainingProvider } from "@/components/training/TrainingProvider";
import { SocialProvider } from "@/components/social/SocialProvider";
import { PostsProvider } from "@/components/posts/PostsProvider";
import { MessagesProvider } from "@/components/messages/MessagesProvider";
import { StoriesProvider } from "@/components/stories/StoriesProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <SocialProvider>
              <PostsProvider>
                <MessagesProvider>
                  <StoriesProvider>
                    <TrainingProvider>{children}</TrainingProvider>
                  </StoriesProvider>
                </MessagesProvider>
              </PostsProvider>
            </SocialProvider>
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
