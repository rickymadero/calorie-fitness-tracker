"use client";

import { CreatePostForm } from "@/components/posts/CreatePostForm";

export default function NewPostPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
        Share a workout
      </h1>
      <p className="mt-1 text-sm text-muted">
        Free for everyone — inspire your network with what you did today.
      </p>
      <div className="mt-6 max-w-xl">
        <CreatePostForm />
      </div>
    </div>
  );
}
