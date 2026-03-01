/**
 * Supabaseデータベースの型定義（AZ〜アズ〜自己成長型SNS）
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          soul_type_id: string | null;
          xp: number;
          streak_days: number;
          last_active_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          soul_type_id?: string | null;
          xp?: number;
          streak_days?: number;
          last_active_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          soul_type_id?: string | null;
          xp?: number;
          streak_days?: number;
          last_active_at?: string | null;
          updated_at?: string;
        };
      };
      soul_types: {
        Row: {
          id: string;
          user_id: string;
          type_name: string;
          type_description: string;
          strengths: string[];
          growth_direction: string;
          energy_sources: string[];
          stop_triggers: string[];
          motivation_type: string;
          goal_area: string;
          autonomy_score: number;
          competence_score: number;
          relatedness_score: number;
          is_complete: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type_name?: string;
          type_description?: string;
          strengths?: string[];
          growth_direction?: string;
          energy_sources?: string[];
          stop_triggers?: string[];
          motivation_type?: string;
          goal_area?: string;
          autonomy_score?: number;
          competence_score?: number;
          relatedness_score?: number;
          is_complete?: boolean;
          created_at?: string;
        };
        Update: {
          type_name?: string;
          type_description?: string;
          strengths?: string[];
          growth_direction?: string;
          energy_sources?: string[];
          stop_triggers?: string[];
          motivation_type?: string;
          goal_area?: string;
          autonomy_score?: number;
          competence_score?: number;
          relatedness_score?: number;
          is_complete?: boolean;
        };
      };
      onboarding_progress: {
        Row: {
          id: string;
          user_id: string;
          current_card: number;
          card_a_data: Json | null;
          card_b_data: Json | null;
          card_c_data: Json | null;
          card_d_data: Json | null;
          is_complete: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          current_card?: number;
          card_a_data?: Json | null;
          card_b_data?: Json | null;
          card_c_data?: Json | null;
          card_d_data?: Json | null;
          is_complete?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          current_card?: number;
          card_a_data?: Json | null;
          card_b_data?: Json | null;
          card_c_data?: Json | null;
          card_d_data?: Json | null;
          is_complete?: boolean;
          updated_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          area: string;
          title: string;
          description: string | null;
          target_date: string | null;
          progress: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          area: string;
          title: string;
          description?: string | null;
          target_date?: string | null;
          progress?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          target_date?: string | null;
          progress?: number;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          goal_id: string | null;
          title: string;
          description: string | null;
          estimated_minutes: number;
          is_completed: boolean;
          completed_at: string | null;
          scheduled_date: string;
          xp_reward: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          goal_id?: string | null;
          title: string;
          description?: string | null;
          estimated_minutes?: number;
          is_completed?: boolean;
          completed_at?: string | null;
          scheduled_date: string;
          xp_reward?: number;
          created_at?: string;
        };
        Update: {
          is_completed?: boolean;
          completed_at?: string | null;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          post_type: "insight" | "progress" | "task_complete" | "emotion";
          visibility: "public" | "circle" | "private";
          image_url: string | null;
          goal_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          post_type?: "insight" | "progress" | "task_complete" | "emotion";
          visibility?: "public" | "circle" | "private";
          image_url?: string | null;
          goal_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          visibility?: "public" | "circle" | "private";
          updated_at?: string;
        };
      };
      reactions: {
        Row: {
          id: string;
          user_id: string;
          post_id: string;
          reaction_type: "empathy" | "helpful" | "cheer";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id: string;
          reaction_type: "empathy" | "helpful" | "cheer";
          created_at?: string;
        };
        Update: never;
      };
      emotion_logs: {
        Row: {
          id: string;
          user_id: string;
          emotion: string;
          intensity: number;
          context: string | null;
          ai_reframe: string | null;
          is_private: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          emotion: string;
          intensity?: number;
          context?: string | null;
          ai_reframe?: string | null;
          is_private?: boolean;
          created_at?: string;
        };
        Update: {
          ai_reframe?: string | null;
        };
      };
      stuck_records: {
        Row: {
          id: string;
          user_id: string;
          situation: string;
          emotion: string;
          auto_thought: string;
          alternative_view: string;
          next_action: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          situation: string;
          emotion: string;
          auto_thought: string;
          alternative_view: string;
          next_action: string;
          created_at?: string;
        };
        Update: never;
      };
      ai_conversations: {
        Row: {
          id: string;
          user_id: string;
          role: "user" | "assistant";
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: "user" | "assistant";
          content: string;
          created_at?: string;
        };
        Update: never;
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: never;
      };
      badges: {
        Row: {
          id: string;
          user_id: string;
          badge_type: string;
          badge_name: string;
          awarded_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_type: string;
          badge_name: string;
          awarded_at?: string;
        };
        Update: never;
      };
      communities: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          goal_area: string;
          member_count: number;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          goal_area: string;
          member_count?: number;
          created_by: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

/** 型エイリアス */
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type SoulType = Database["public"]["Tables"]["soul_types"]["Row"];
export type OnboardingProgress = Database["public"]["Tables"]["onboarding_progress"]["Row"];
export type Goal = Database["public"]["Tables"]["goals"]["Row"];
export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type Reaction = Database["public"]["Tables"]["reactions"]["Row"];
export type EmotionLog = Database["public"]["Tables"]["emotion_logs"]["Row"];
export type StuckRecord = Database["public"]["Tables"]["stuck_records"]["Row"];
export type AiConversation = Database["public"]["Tables"]["ai_conversations"]["Row"];
export type Follow = Database["public"]["Tables"]["follows"]["Row"];
export type Badge = Database["public"]["Tables"]["badges"]["Row"];
export type Community = Database["public"]["Tables"]["communities"]["Row"];

/** 拡張型 */
export type PostWithProfile = Post & {
  profiles: Pick<Profile, "id" | "username" | "display_name" | "avatar_url" | "soul_type_id">;
  soul_types?: Pick<SoulType, "type_name"> | null;
  reactions: { reaction_type: string; count: number }[];
  user_reaction?: string | null;
};

export type TaskWithGoal = Task & {
  goals: Pick<Goal, "title" | "area"> | null;
};

/** オンボーディングCardデータ型 */
export type CardAData = {
  energy_sources: string[];
  energy_drains: string[];
};

export type CardBData = {
  stop_triggers: string[];
};

export type CardCData = {
  autonomy_score: number;
  competence_score: number;
  relatedness_score: number;
};

export type CardDData = {
  goal_area: string;
  goal_text?: string;
};
