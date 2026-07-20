"use client";

import { CreatePostForm } from "@/components/posts/CreatePostForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAppTranslation } from "@/components/providers/LanguageProvider";

export default function NewPostPage() {
  const { t } = useAppTranslation(["common", "posts"]);

  return (
    <div>
      <PageHeader
        title={t("posts:newTitle")}
        subtitle={t("posts:newSubtitle")}
        backHref="/explore"
        backLabel={t("common:nav.evofit")}
      />
      <div className="mt-5">
        <CreatePostForm />
      </div>
    </div>
  );
}
