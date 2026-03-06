"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OnboardingProgress, CardAData, CardBData, CardCData, CardDData, SoulType } from "@/types/database.types";
import { saveOnboardingCard, completeOnboarding, saveGuestOnboarding } from "@/app/actions/onboarding";
import CardA from "./CardA";
import CardB from "./CardB";
import CardC from "./CardC";
import CardD from "./CardD";
import SoulTypeReveal from "./SoulTypeReveal";

interface OnboardingFlowProps {
  initialProgress: OnboardingProgress | null;
  isGuest: boolean;
}

/**
 * オンボーディングフロー管理コンポーネント
 * ゲストモード：localStorageに保存してAPIでソウルタイプ生成
 * ログイン済み：DBに保存してサーバーアクションで生成
 */
export default function OnboardingFlow({ initialProgress, isGuest }: OnboardingFlowProps) {
  const [currentCard, setCurrentCard] = useState(
    initialProgress?.current_card ?? 0
  );
  const [cardAData, setCardAData] = useState<CardAData | null>(
    (initialProgress?.card_a_data as CardAData) ?? null
  );
  const [cardBData, setCardBData] = useState<CardBData | null>(
    (initialProgress?.card_b_data as CardBData) ?? null
  );
  const [cardCData, setCardCData] = useState<CardCData | null>(
    (initialProgress?.card_c_data as CardCData) ?? null
  );
  const [cardDData, setCardDData] = useState<CardDData | null>(
    (initialProgress?.card_d_data as CardDData) ?? null
  );
  const [generatedSoulType, setGeneratedSoulType] = useState<Partial<SoulType> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ログイン済み：localStorageにゲストデータがあれば自動保存して完了
  useEffect(() => {
    if (!isGuest && currentCard === 0) {
      const guestCardsStr = localStorage.getItem("az_guest_cards");
      const guestSoulTypeStr = localStorage.getItem("az_guest_soul_type");

      if (guestCardsStr && guestSoulTypeStr) {
        setIsGenerating(true);
        const guestCards = JSON.parse(guestCardsStr);
        const guestSoulType = JSON.parse(guestSoulTypeStr);

        saveGuestOnboarding(guestCards, guestSoulType).then((result) => {
          if (result.error) {
            setError(result.error);
          } else {
            localStorage.removeItem("az_guest_cards");
            localStorage.removeItem("az_guest_soul_type");
            setGeneratedSoulType(result.soulType!);
          }
          setIsGenerating(false);
        });
      }
    }
  }, [isGuest, currentCard]);

  // カード完了ハンドラ（ゲストはstate更新のみ、ログイン済みはDB保存）
  async function handleCardAComplete(data: CardAData) {
    if (!isGuest) await saveOnboardingCard(1, data);
    setCardAData(data);
    setCurrentCard(1);
  }

  async function handleCardBComplete(data: CardBData) {
    if (!isGuest) await saveOnboardingCard(2, data);
    setCardBData(data);
    setCurrentCard(2);
  }

  async function handleCardCComplete(data: CardCData) {
    if (!isGuest) await saveOnboardingCard(3, data);
    setCardCData(data);
    setCurrentCard(3);
  }

  async function handleCardDComplete(data: CardDData) {
    if (!isGuest) await saveOnboardingCard(4, data);
    setCardDData(data);
    setIsGenerating(true);
    setCurrentCard(4);

    if (isGuest) {
      // ゲストモード：APIを呼び出してlocalStorageに保存
      const guestCards = { cardA: cardAData!, cardB: cardBData!, cardC: cardCData!, cardD: data };
      localStorage.setItem("az_guest_cards", JSON.stringify(guestCards));

      const res = await fetch("/api/generate-soul-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guestCards),
      });
      const result = await res.json();

      if (result.error) {
        setError(result.error);
      } else {
        localStorage.setItem("az_guest_soul_type", JSON.stringify(result.soulType));
        setGeneratedSoulType(result.soulType);
      }
    } else {
      // ログイン済み：サーバーアクションで生成・保存
      const result = await completeOnboarding(cardAData!, cardBData!, cardCData!, data);

      if (result.error) {
        setError(result.error);
      } else {
        setGeneratedSoulType(result.soulType!);
      }
    }

    setIsGenerating(false);
  }

  const progress = ((currentCard) / 4) * 100;

  if (generatedSoulType) {
    return <SoulTypeReveal soulType={generatedSoulType} isGuest={isGuest} />;
  }

  return (
    <div className="min-h-screen bg-gradient-mystic flex flex-col">
      {/* ヘッダー */}
      <div className="px-4 pt-8 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-az-gold text-gold-glow">AZ</h1>
          <span className="text-az-subtle text-sm">
            {currentCard}/4
          </span>
        </div>
        {/* 進捗バー */}
        <div className="h-1 bg-az-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-az-glow to-az-mystic rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* カードコンテンツ */}
      <div className="flex-1 px-4 pb-8">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center h-full py-20"
            >
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-2 border-az-glow/30 animate-glow-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl animate-float">✨</span>
                </div>
              </div>
              <p className="mt-8 text-az-text text-center text-lg">
                あなたのソウルタイプを<br />召喚しています...
              </p>
              <p className="mt-3 text-az-subtle text-center text-sm">
                AIが診断結果を分析中
              </p>
            </motion.div>
          ) : currentCard === 0 ? (
            <motion.div
              key="card-a"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <CardA onComplete={handleCardAComplete} initialData={cardAData} />
            </motion.div>
          ) : currentCard === 1 ? (
            <motion.div
              key="card-b"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <CardB onComplete={handleCardBComplete} initialData={cardBData} />
            </motion.div>
          ) : currentCard === 2 ? (
            <motion.div
              key="card-c"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <CardC onComplete={handleCardCComplete} initialData={cardCData} />
            </motion.div>
          ) : currentCard === 3 ? (
            <motion.div
              key="card-d"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <CardD onComplete={handleCardDComplete} initialData={cardDData} />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {error && (
          <div className="fixed bottom-4 left-4 right-4 bg-red-500/20 border border-red-500/40 rounded-xl p-3 text-red-300 text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
