"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { toggleReaction } from "@/app/actions/posts";

/** 投稿タイプのラベル・色マップ */
const POST_TYPE_CONFIG = {
  insight: { label: "気づき", color: "az-glow", emoji: "💡" },
  progress: { label: "進捗", color: "az-aurora", emoji: "📈" },
  task_complete: { label: "達成", color: "az-gold", emoji: "⚡" },
  emotion: { label: "感情", color: "az-mystic", emoji: "🌊" },
};

/** リアクション設定 */
const REACTIONS = [
  { type: "empathy" as const, emoji: "🤝", label: "共感" },
  { type: "helpful" as const, emoji: "💡", label: "参考" },
  { type: "cheer" as const, emoji: "🌟", label: "応援" },
];

interface PostCardProps {
  post: {
    id: string;
    content: string;
    post_type: string;
    created_at: string;
    profiles?: {
      id: string;
      username: string;
      display_name: string | null;
      avatar_url: string | null;
    } | null;
    reactions?: { reaction_type: string }[];
  };
  currentUserId: string;
}

/**
 * 投稿カードコンポーネント
 */
export default function PostCard({ post, currentUserId }: PostCardProps) {
  const [reactions, setReactions] = useState(post.reactions || []);
  const [loading, setLoading] = useState<string | null>(null);

  const config =
    POST_TYPE_CONFIG[post.post_type as keyof typeof POST_TYPE_CONFIG] ||
    POST_TYPE_CONFIG.insight;

  // リアクションカウントを集計
  const reactionCounts = REACTIONS.reduce(
    (acc, r) => ({
      ...acc,
      [r.type]: reactions.filter((rx) => rx.reaction_type === r.type).length,
    }),
    {} as Record<string, number>
  );

  async function handleReaction(type: "empathy" | "helpful" | "cheer") {
    if (loading) return;
    setLoading(type);

    // 楽観的更新
    const hasReacted = reactions.some(
      (r) => r.reaction_type === type
    );

    if (hasReacted) {
      setReactions((prev) =>
        prev.filter((r) => r.reaction_type !== type)
      );
    } else {
      setReactions((prev) => [...prev, { reaction_type: type }]);
    }

    await toggleReaction(post.id, type);
    setLoading(null);
  }

  const displayName =
    post.profiles?.display_name || post.profiles?.username || "匿名";
  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: ja,
  });

  return (
    <div className="card-surface p-4 space-y-3">
      {/* ヘッダー */}
      <div className="flex items-start gap-3">
        {/* アバター */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-az-glow to-az-mystic
                        flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
          {displayName.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-az-text text-sm">{displayName}</span>
            {/* 投稿タイプバッジ */}
            <span
              className="text-xs px-2 py-0.5 rounded-full bg-az-muted border border-az-border text-az-subtle"
            >
              {config.emoji} {config.label}
            </span>
          </div>
          <span className="text-az-subtle text-xs">{timeAgo}</span>
        </div>
      </div>

      {/* 本文 */}
      <p className="text-az-text text-sm leading-relaxed">{post.content}</p>

      {/* リアクションボタン */}
      <div className="flex items-center gap-2 pt-1">
        {REACTIONS.map((reaction) => {
          const count = reactionCounts[reaction.type] || 0;
          return (
            <button
              key={reaction.type}
              onClick={() => handleReaction(reaction.type)}
              disabled={loading === reaction.type}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                         text-xs border border-az-border bg-az-muted
                         hover:border-az-glow/40 hover:bg-az-glow/5
                         active:scale-95 transition-all duration-150"
            >
              <span>{reaction.emoji}</span>
              <span className="text-az-subtle">{reaction.label}</span>
              {count > 0 && (
                <span className="text-az-text font-medium">{count}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
