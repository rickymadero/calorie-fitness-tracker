"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { usePosts } from "@/components/posts/PostsProvider";
import { useSocial } from "@/components/social/SocialProvider";
import { SocialAvatar } from "@/components/social/PersonCard";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import type { PostComment } from "@/lib/types/posts";

export function CommentComposer({
  postId,
  parentId,
  onDone,
}: {
  postId: string;
  parentId?: string;
  onDone?: () => void;
}) {
  const { addComment } = usePosts();
  const { toast } = useToast();
  const [body, setBody] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const c = addComment(postId, body, parentId);
    if (!c) {
      toast("Could not post comment.", "error");
      return;
    }
    setBody("");
    toast("Comment posted.", "success");
    onDone?.();
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={parentId ? "Write a reply…" : "Encourage them…"}
        className="h-11 flex-1 rounded-2xl border border-border bg-background px-4 text-base outline-none focus:border-accent"
      />
      <Button type="submit" size="sm" disabled={!body.trim()}>
        Post
      </Button>
    </form>
  );
}

function CommentItem({
  comment,
  postAuthorId,
  depth = 0,
}: {
  comment: PostComment;
  postAuthorId: string;
  depth?: number;
}) {
  const { user } = useAuth();
  const { commentsFor, deleteComment } = usePosts();
  const { getCard } = useSocial();
  const { toast } = useToast();
  const [replying, setReplying] = useState(false);
  const author = getCard(comment.authorId);
  const name = author?.profile.displayName ?? "Athlete";
  const username = author?.profile.username ?? "athlete";
  const canDelete =
    user?.id === comment.authorId || user?.id === postAuthorId;
  const replies = commentsFor(comment.postId).filter(
    (c) => c.parentId === comment.id,
  );

  return (
    <div className={depth > 0 ? "ml-4 mt-3 border-l border-border pl-3 sm:ml-8" : ""}>
      <div className="flex gap-3">
        <Link href={`/social/u/${username}`}>
          <SocialAvatar name={name} size="sm" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/social/u/${username}`}
              className="text-sm font-semibold"
            >
              {name}
            </Link>
            <span className="text-xs text-muted">
              {new Date(comment.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="mt-1 text-sm leading-relaxed">{comment.body}</p>
          <div className="mt-1 flex gap-1">
            {depth < 1 && (
              <button
                type="button"
                className="evolve-press inline-flex min-h-9 items-center rounded-lg px-2 text-xs font-medium text-muted hover:bg-muted-bg hover:text-foreground"
                onClick={() => setReplying((v) => !v)}
              >
                Reply
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                className="evolve-press inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs text-muted hover:bg-muted-bg hover:text-danger"
                onClick={() => {
                  deleteComment(comment.id);
                  toast("Comment removed.", "info");
                }}
              >
                <Trash2 size={12} />
                Delete
              </button>
            )}
          </div>
          {replying && (
            <div className="mt-2">
              <CommentComposer
                postId={comment.postId}
                parentId={comment.id}
                onDone={() => setReplying(false)}
              />
            </div>
          )}
        </div>
      </div>
      {replies.map((r) => (
        <CommentItem
          key={r.id}
          comment={r}
          postAuthorId={postAuthorId}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export function CommentThread({
  postId,
  postAuthorId,
}: {
  postId: string;
  postAuthorId: string;
}) {
  const { commentsFor, tick } = usePosts();
  void tick;
  const all = commentsFor(postId);
  const roots = all.filter((c) => !c.parentId);

  return (
    <div className="space-y-5">
      <CommentComposer postId={postId} />
      {roots.length === 0 ? (
        <p className="text-center text-sm text-muted">
          Be the first to cheer them on.
        </p>
      ) : (
        <div className="space-y-4">
          {roots.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              postAuthorId={postAuthorId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
