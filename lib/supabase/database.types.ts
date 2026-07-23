export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          average_heart_rate: number | null
          average_pace_seconds_per_km: number | null
          average_speed_kmh: number | null
          calories: number | null
          created_at: string
          description: string | null
          device_name: string | null
          distance_meters: number | null
          duration_seconds: number | null
          elevation_gain_meters: number | null
          external_activity_id: string | null
          id: string
          is_wearable_imported: boolean
          maximum_heart_rate: number | null
          source: Database["public"]["Enums"]["activity_source"]
          started_at: string | null
          title: string
          updated_at: string
          user_id: string
          visibility: Database["public"]["Enums"]["visibility_level"]
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          average_heart_rate?: number | null
          average_pace_seconds_per_km?: number | null
          average_speed_kmh?: number | null
          calories?: number | null
          created_at?: string
          description?: string | null
          device_name?: string | null
          distance_meters?: number | null
          duration_seconds?: number | null
          elevation_gain_meters?: number | null
          external_activity_id?: string | null
          id?: string
          is_wearable_imported?: boolean
          maximum_heart_rate?: number | null
          source?: Database["public"]["Enums"]["activity_source"]
          started_at?: string | null
          title: string
          updated_at?: string
          user_id: string
          visibility?: Database["public"]["Enums"]["visibility_level"]
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          average_heart_rate?: number | null
          average_pace_seconds_per_km?: number | null
          average_speed_kmh?: number | null
          calories?: number | null
          created_at?: string
          description?: string | null
          device_name?: string | null
          distance_meters?: number | null
          duration_seconds?: number | null
          elevation_gain_meters?: number | null
          external_activity_id?: string | null
          id?: string
          is_wearable_imported?: boolean
          maximum_heart_rate?: number | null
          source?: Database["public"]["Enums"]["activity_source"]
          started_at?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          visibility?: Database["public"]["Enums"]["visibility_level"]
        }
        Relationships: [
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_metrics: {
        Row: {
          activity_id: string
          category: Database["public"]["Enums"]["metric_category"]
          created_at: string
          id: string
          label: string
          metric_key: string
          numeric_value: number | null
          source: Database["public"]["Enums"]["activity_source"]
          text_value: string | null
          unit: string | null
        }
        Insert: {
          activity_id: string
          category?: Database["public"]["Enums"]["metric_category"]
          created_at?: string
          id?: string
          label: string
          metric_key: string
          numeric_value?: number | null
          source?: Database["public"]["Enums"]["activity_source"]
          text_value?: string | null
          unit?: string | null
        }
        Update: {
          activity_id?: string
          category?: Database["public"]["Enums"]["metric_category"]
          created_at?: string
          id?: string
          label?: string
          metric_key?: string
          numeric_value?: number | null
          source?: Database["public"]["Enums"]["activity_source"]
          text_value?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_metrics_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_splits: {
        Row: {
          activity_id: string
          average_heart_rate: number | null
          created_at: string
          distance_meters: number | null
          duration_seconds: number | null
          elevation_change_meters: number | null
          id: string
          pace_seconds_per_km: number | null
          split_index: number
        }
        Insert: {
          activity_id: string
          average_heart_rate?: number | null
          created_at?: string
          distance_meters?: number | null
          duration_seconds?: number | null
          elevation_change_meters?: number | null
          id?: string
          pace_seconds_per_km?: number | null
          split_index: number
        }
        Update: {
          activity_id?: string
          average_heart_rate?: number | null
          created_at?: string
          distance_meters?: number | null
          duration_seconds?: number | null
          elevation_change_meters?: number | null
          id?: string
          pace_seconds_per_km?: number | null
          split_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "activity_splits_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          body: string
          created_at: string
          id: string
          parent_comment_id: string | null
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      connection_test: {
        Row: {
          created_at: string
          id: number
          label: string
        }
        Insert: {
          created_at?: string
          id?: never
          label: string
        }
        Update: {
          created_at?: string
          id?: never
          label?: string
        }
        Relationships: []
      }
      conversation_members: {
        Row: {
          conversation_id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          joined_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_members_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          status: Database["public"]["Enums"]["follow_status"]
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          status?: Database["public"]["Enums"]["follow_status"]
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          status?: Database["public"]["Enums"]["follow_status"]
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      food_logs: {
        Row: {
          calories: number
          carbohydrate_grams: number
          created_at: string
          fat_grams: number
          food_name: string
          id: string
          logged_at: string
          meal_type: Database["public"]["Enums"]["meal_type"]
          protein_grams: number
          serving_size: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          calories?: number
          carbohydrate_grams?: number
          created_at?: string
          fat_grams?: number
          food_name: string
          id?: string
          logged_at?: string
          meal_type: Database["public"]["Enums"]["meal_type"]
          protein_grams?: number
          serving_size?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          calories?: number
          carbohydrate_grams?: number
          created_at?: string
          fat_grams?: number
          food_name?: string
          id?: string
          logged_at?: string
          meal_type?: Database["public"]["Enums"]["meal_type"]
          protein_grams?: number
          serving_size?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      heart_rate_zones: {
        Row: {
          activity_id: string
          created_at: string
          duration_seconds: number | null
          id: string
          maximum_bpm: number | null
          minimum_bpm: number | null
          percentage: number | null
          zone_number: number
        }
        Insert: {
          activity_id: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          maximum_bpm?: number | null
          minimum_bpm?: number | null
          percentage?: number | null
          zone_number: number
        }
        Update: {
          activity_id?: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          maximum_bpm?: number | null
          minimum_bpm?: number | null
          percentage?: number | null
          zone_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "heart_rate_zones_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string | null
          conversation_id: string
          created_at: string
          id: string
          media_url: string | null
          read_at: string | null
          sender_id: string
        }
        Insert: {
          body?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          media_url?: string | null
          read_at?: string | null
          sender_id: string
        }
        Update: {
          body?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          media_url?: string | null
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_metric_visibility: {
        Row: {
          created_at: string
          display_order: number
          metric_key: string
          post_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          metric_key: string
          post_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          metric_key?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_metric_visibility_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          activity_id: string | null
          caption: string | null
          created_at: string
          id: string
          image_url: string | null
          updated_at: string
          user_id: string
          visibility: Database["public"]["Enums"]["visibility_level"]
        }
        Insert: {
          activity_id?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          updated_at?: string
          user_id: string
          visibility?: Database["public"]["Enums"]["visibility_level"]
        }
        Update: {
          activity_id?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          updated_at?: string
          user_id?: string
          visibility?: Database["public"]["Enums"]["visibility_level"]
        }
        Relationships: [
          {
            foreignKeyName: "posts_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          is_private: boolean
          onboarding_completed: boolean
          onboarding_completed_at: string | null
          plan: Database["public"]["Enums"]["plan_tier"]
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_private?: boolean
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          plan?: Database["public"]["Enums"]["plan_tier"]
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_private?: boolean
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          plan?: Database["public"]["Enums"]["plan_tier"]
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      route_points: {
        Row: {
          activity_id: string
          elevation_meters: number | null
          id: number
          latitude: number
          longitude: number
          recorded_at: string | null
          sequence_number: number
        }
        Insert: {
          activity_id: string
          elevation_meters?: number | null
          id?: never
          latitude: number
          longitude: number
          recorded_at?: string | null
          sequence_number: number
        }
        Update: {
          activity_id?: string
          elevation_meters?: number | null
          id?: never
          latitude?: number
          longitude?: number
          recorded_at?: string | null
          sequence_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "route_points_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          archived_at: string | null
          caption: string | null
          created_at: string
          expires_at: string
          front_media_url: string | null
          id: string
          media_type: Database["public"]["Enums"]["story_media_type"]
          media_url: string
          metadata: Json
          rear_media_url: string | null
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          caption?: string | null
          created_at?: string
          expires_at: string
          front_media_url?: string | null
          id?: string
          media_type?: Database["public"]["Enums"]["story_media_type"]
          media_url: string
          metadata?: Json
          rear_media_url?: string | null
          user_id: string
        }
        Update: {
          archived_at?: string | null
          caption?: string | null
          created_at?: string
          expires_at?: string
          front_media_url?: string | null
          id?: string
          media_type?: Database["public"]["Enums"]["story_media_type"]
          media_url?: string
          metadata?: Json
          rear_media_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string
          language: string
          preferred_units: Database["public"]["Enums"]["preferred_units"]
          theme: Database["public"]["Enums"]["theme_preference"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          language?: string
          preferred_units?: Database["public"]["Enums"]["preferred_units"]
          theme?: Database["public"]["Enums"]["theme_preference"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          language?: string
          preferred_units?: Database["public"]["Enums"]["preferred_units"]
          theme?: Database["public"]["Enums"]["theme_preference"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wearable_connections: {
        Row: {
          connected_at: string | null
          created_at: string
          external_user_id: string | null
          id: string
          last_sync_at: string | null
          provider: Database["public"]["Enums"]["wearable_provider"]
          status: Database["public"]["Enums"]["wearable_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          connected_at?: string | null
          created_at?: string
          external_user_id?: string | null
          id?: string
          last_sync_at?: string | null
          provider: Database["public"]["Enums"]["wearable_provider"]
          status?: Database["public"]["Enums"]["wearable_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          connected_at?: string | null
          created_at?: string
          external_user_id?: string | null
          id?: string
          last_sync_at?: string | null
          provider?: Database["public"]["Enums"]["wearable_provider"]
          status?: Database["public"]["Enums"]["wearable_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wearable_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_read_advanced_metric: {
        Args: { p_activity_id: string }
        Returns: boolean
      }
      can_view_activity: { Args: { p_activity_id: string }; Returns: boolean }
      can_view_post: { Args: { p_post_id: string }; Returns: boolean }
      can_view_profile: { Args: { owner_id: string }; Returns: boolean }
      is_accepted_follower: {
        Args: { follower: string; following: string }
        Returns: boolean
      }
      is_allowed_feed_metric_key: { Args: { p_key: string }; Returns: boolean }
      is_conversation_member: {
        Args: { p_conversation_id: string }
        Returns: boolean
      }
      is_pro: { Args: { uid: string }; Returns: boolean }
    }
    Enums: {
      activity_source:
        | "manual"
        | "apple_health"
        | "apple_watch"
        | "garmin"
        | "imported_file"
        | "other"
      activity_type:
        | "running"
        | "cycling"
        | "swimming"
        | "hyrox"
        | "walking"
        | "hiking"
        | "strength"
        | "functional"
        | "cross_training"
        | "rowing"
        | "indoor_cycling"
        | "treadmill"
        | "other"
      follow_status: "pending" | "accepted"
      meal_type: "breakfast" | "lunch" | "dinner" | "snack"
      metric_category: "basic" | "advanced"
      plan_tier: "free" | "pro"
      preferred_units: "metric" | "imperial"
      story_media_type: "image" | "video"
      theme_preference: "light" | "dark" | "system"
      visibility_level: "public" | "followers" | "private"
      wearable_provider: "apple_health" | "apple_watch" | "garmin" | "other"
      wearable_status: "disconnected" | "connected" | "error" | "pending"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_source: [
        "manual",
        "apple_health",
        "apple_watch",
        "garmin",
        "imported_file",
        "other",
      ],
      activity_type: [
        "running",
        "cycling",
        "swimming",
        "hyrox",
        "walking",
        "hiking",
        "strength",
        "functional",
        "cross_training",
        "rowing",
        "indoor_cycling",
        "treadmill",
        "other",
      ],
      follow_status: ["pending", "accepted"],
      meal_type: ["breakfast", "lunch", "dinner", "snack"],
      metric_category: ["basic", "advanced"],
      plan_tier: ["free", "pro"],
      preferred_units: ["metric", "imperial"],
      story_media_type: ["image", "video"],
      theme_preference: ["light", "dark", "system"],
      visibility_level: ["public", "followers", "private"],
      wearable_provider: ["apple_health", "apple_watch", "garmin", "other"],
      wearable_status: ["disconnected", "connected", "error", "pending"],
    },
  },
} as const

