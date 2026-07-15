"use client";

import { CreatePostForm } from "@/components/posts/CreatePostForm";
import { PageHeader } from "@/components/ui/PageHeader";

export default function NewPostPage() {
  return (
    <div>
      <PageHeader
        title="Share a workout"
        subtitle="Free for everyone — inspire your network with what you did today."
        backHref="/feed"
        backLabel="Feed"
      />
      <div className="mt-5">
        <CreatePostForm />
      </div>
    </div>
  );
}
