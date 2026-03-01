"use client";

import { useState } from "react";
import { logout } from "@/app/actions/auth";
import { Profile, SoulType, Post, Badge } from "@/types/database.types";
import PostCard from "./PostCard";

interface ProfileViewProps {
  profile: Profile | null;
  soulType: SoulType | null;
  posts: Post[];
  badges: Badge[];
  followerCount: number;
  followingCount: number;
  currentUserId: string;
}

/**
 * プロフィール画面
 * ソウルタイプ、推進剤マップ、投稿履歴、バッジを表示
 */
export default function ProfileView({
  profile,
  soulType,
  posts,
  badges,
  followerCount,
  followingCount,
  currentUserId,
}: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "map" | "badges">("posts");

  const displayName = profile?.display_name || profile?.username || "あなた";
  const xp = profile?.xp || 0;

  // XPからレベルを計算（100XPごとに1レベル）
  const level = Math.floor(xp / 100) + 1;
  const levelProgress = xp % 100;

  return (
    <div className="max-w-md mx-auto pb-24">
      {/* ヘッダー */}
      <div className="sticky top-0 bg-az-bg/95 backdrop-blur-xl z-40 px-4 pt-6 pb-3 border-b border-az-border">
        <div className="flex items-center justify-between">
          <h1 className="text-az-text font-bold text-lg">自分</h1>
          <button
            onClick={() => logout()}
            className="text-az-subtle text-sm hover:text-az-flame transition-colors"
          >
            ログアウト
          </button>
        </div>
      </div>

      {/* プロフィールセクション */}
      <div className="px-4 pt-5 space-y-5">
        {/* アバター＋基本情報 */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-az-glow to-az-mystic
                            flex items-center justify-center text-2xl text-white font-bold soul-glow">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-az-gold
                            flex items-center justify-center text-az-bg text-xs font-bold">
              {level}
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-az-text font-bold text-xl">{displayName}</h2>
            <p className="text-az-subtle text-sm">@{profile?.username}</p>
            {soulType && (
              <p className="text-az-glow text-xs mt-1 font-medium">
                ✦ {soulType.type_name}
              </p>
            )}
          </div>
        </div>

        {/* XP・レベルバー */}
        <div className="card-surface p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-az-subtle text-xs">レベル {level}</span>
            <span className="text-az-gold text-xs font-semibold">
              {xp} XP
            </span>
          </div>
          <div className="h-2 bg-az-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-az-gold to-az-aurora rounded-full transition-all"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
          <p className="text-az-subtle text-xs text-center">
            次のレベルまで {100 - levelProgress} XP
          </p>
        </div>

        {/* フォロー統計 */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="card-surface p-3">
            <div className="text-az-text font-bold text-xl">{posts.length}</div>
            <div className="text-az-subtle text-xs">投稿</div>
          </div>
          <div className="card-surface p-3">
            <div className="text-az-text font-bold text-xl">{followerCount}</div>
            <div className="text-az-subtle text-xs">フォロワー</div>
          </div>
          <div className="card-surface p-3">
            <div className="text-az-text font-bold text-xl">{followingCount}</div>
            <div className="text-az-subtle text-xs">フォロー中</div>
          </div>
        </div>

        {/* タブ */}
        <div className="flex border-b border-az-border">
          {[
            { id: "posts", label: "投稿" },
            { id: "map", label: "推進剤マップ" },
            { id: "badges", label: "バッジ" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "posts" | "map" | "badges")}
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-az-gold border-b-2 border-az-gold"
                  : "text-az-subtle"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* タブコンテンツ */}
        {activeTab === "posts" && (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <p className="text-center text-az-subtle text-sm py-8">
                まだ投稿がありません
              </p>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUserId}
                />
              ))
            )}
          </div>
        )}

        {activeTab === "map" && soulType && (
          <div className="space-y-4">
            {/* ソウルタイプ詳細 */}
            <div className="card-surface p-5 space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-az-glow to-az-mystic
                                flex items-center justify-center text-2xl mb-3 soul-glow">
                  ✨
                </div>
                <h3 className="text-az-text font-bold text-lg">{soulType.type_name}</h3>
                <p className="text-az-subtle text-sm mt-1">{soulType.type_description}</p>
              </div>

              {/* 強み */}
              {soulType.strengths.length > 0 && (
                <div>
                  <p className="text-az-subtle text-xs mb-2">✦ 強み</p>
                  <div className="flex flex-wrap gap-2">
                    {soulType.strengths.map((s, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-full text-xs bg-az-glow/20 text-az-glow border border-az-glow/30"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 推進剤マップ */}
            {soulType.energy_sources.length > 0 && (
              <div className="card-surface p-4">
                <p className="text-az-aurora text-xs font-medium mb-3">
                  ⚡ エネルギーが増える行為
                </p>
                <div className="flex flex-wrap gap-2">
                  {soulType.energy_sources.map((s, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-full text-xs bg-az-aurora/10 text-az-aurora border border-az-aurora/30"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 停止装置マップ */}
            {soulType.stop_triggers.length > 0 && (
              <div className="card-surface p-4">
                <p className="text-az-flame text-xs font-medium mb-3">
                  🚫 止まるトリガー
                </p>
                <div className="flex flex-wrap gap-2">
                  {soulType.stop_triggers.map((t, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-full text-xs bg-az-flame/10 text-az-flame border border-az-flame/30"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "map" && !soulType && (
          <p className="text-center text-az-subtle text-sm py-8">
            オンボーディングを完了してソウルタイプを取得しましょう
          </p>
        )}

        {activeTab === "badges" && (
          <div>
            {badges.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <p className="text-4xl">🎖️</p>
                <p className="text-az-subtle text-sm">
                  バッジを獲得するとここに表示されます
                </p>
                <p className="text-az-subtle text-xs">
                  投稿・タスク完了・詰まりボタン使用でゲット！
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="card-surface p-3 text-center space-y-1"
                  >
                    <div className="text-2xl">🏆</div>
                    <p className="text-az-text text-xs font-medium">{badge.badge_name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
