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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      approval_notifications: {
        Row: {
          created_at: string | null
          email: string
          id: string
          read: boolean | null
          sent_at: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          read?: boolean | null
          sent_at?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          read?: boolean | null
          sent_at?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      document_delivery_logs: {
        Row: {
          acknowledged_at: string | null
          country: string | null
          created_at: string | null
          delivery_method: string | null
          delivery_status: string | null
          document_type: string
          email_id: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          opened_at: string | null
          recipient_email: string
          sent_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          country?: string | null
          created_at?: string | null
          delivery_method?: string | null
          delivery_status?: string | null
          document_type: string
          email_id?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          recipient_email: string
          sent_at?: string | null
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          country?: string | null
          created_at?: string | null
          delivery_method?: string | null
          delivery_status?: string | null
          document_type?: string
          email_id?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          recipient_email?: string
          sent_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      document_requests: {
        Row: {
          created_at: string | null
          document_title: string
          document_type: string
          id: string
          processed_at: string | null
          reason: string | null
          requested_at: string
          requested_language: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          document_title: string
          document_type: string
          id?: string
          processed_at?: string | null
          reason?: string | null
          requested_at: string
          requested_language: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          document_title?: string
          document_type?: string
          id?: string
          processed_at?: string | null
          reason?: string | null
          requested_at?: string
          requested_language?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      document_views: {
        Row: {
          created_at: string | null
          document_type: string
          id: string
          language: string | null
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          id?: string
          language?: string | null
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          id?: string
          language?: string | null
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: []
      }
      executive_presale_protocols: {
        Row: {
          allocation_committee: boolean | null
          asset_specific_interests: Json | null
          blockchain: string | null
          blockchain_familiarity: string[] | null
          board_seat_interest: boolean | null
          company_name: string | null
          company_revenue_tier: string | null
          company_website: string | null
          contact_availability: string | null
          contact_preference: string | null
          container_volume_annually: string | null
          conviction_based_status: string | null
          conviction_level: string | null
          created_at: string | null
          discovery_source: string[] | null
          due_diligence_requests: string[] | null
          due_diligence_timeframe: string | null
          employee_count_range: string | null
          engagement_level: string | null
          exclusive_access_requests: string[] | null
          executive_title: string | null
          expected_roi_timeline: string | null
          follow_on_capacity: boolean | null
          geographic_preference: string[] | null
          heard_about_portx: string | null
          heard_about_project: string | null
          id: string
          industry_experience_years: string | null
          infrastructure_interests: Json | null
          interest_level: string | null
          investment_authority_level: string | null
          investment_thesis: string | null
          is_test_account: boolean | null
          key_investment_factors: string[] | null
          kyc_verified: boolean | null
          kyc_verified_at: string | null
          linkedin_profile: string | null
          maritime_investment_experience: string | null
          maritime_logistics_experience: boolean | null
          maximum_investment_size: string | null
          minimum_investment_size: string | null
          nda_executed: boolean | null
          nda_status: boolean | null
          offering_type: string | null
          partnership_consideration: boolean | null
          preferred_asset: string | null
          preferred_blockchain: string | null
          preferred_briefing: string[] | null
          preferred_engagement: string[] | null
          preferred_investment_focus: string | null
          presale_event_interest: boolean | null
          previous_port_investments: boolean | null
          primary_asset_interest: string[] | null
          primary_interest_factors: string[] | null
          private_roadshow_interest: boolean | null
          protocol_status: string | null
          public_company: boolean | null
          questionnaire_completed_at: string | null
          questionnaire_status: string | null
          risk_appetite: string | null
          secondary_asset_interest: string[] | null
          site_visit_interest: boolean | null
          strategic_asset_interests: Json | null
          strategic_objectives: string[] | null
          submitted_at: string | null
          target_deployment_phase: string | null
          technical_demo_requested: boolean | null
          technical_team_meeting: boolean | null
          technical_understanding: string[] | null
          ticker_symbol: string | null
          tokenization_understanding: string[] | null
          typical_investment_size: string | null
          updated_at: string | null
          user_id: string
          verification_notes: string | null
          verified_at: string | null
          wallet_integration: string | null
        }
        Insert: {
          allocation_committee?: boolean | null
          asset_specific_interests?: Json | null
          blockchain?: string | null
          blockchain_familiarity?: string[] | null
          board_seat_interest?: boolean | null
          company_name?: string | null
          company_revenue_tier?: string | null
          company_website?: string | null
          contact_availability?: string | null
          contact_preference?: string | null
          container_volume_annually?: string | null
          conviction_based_status?: string | null
          conviction_level?: string | null
          created_at?: string | null
          discovery_source?: string[] | null
          due_diligence_requests?: string[] | null
          due_diligence_timeframe?: string | null
          employee_count_range?: string | null
          engagement_level?: string | null
          exclusive_access_requests?: string[] | null
          executive_title?: string | null
          expected_roi_timeline?: string | null
          follow_on_capacity?: boolean | null
          geographic_preference?: string[] | null
          heard_about_portx?: string | null
          heard_about_project?: string | null
          id?: string
          industry_experience_years?: string | null
          infrastructure_interests?: Json | null
          interest_level?: string | null
          investment_authority_level?: string | null
          investment_thesis?: string | null
          is_test_account?: boolean | null
          key_investment_factors?: string[] | null
          kyc_verified?: boolean | null
          kyc_verified_at?: string | null
          linkedin_profile?: string | null
          maritime_investment_experience?: string | null
          maritime_logistics_experience?: boolean | null
          maximum_investment_size?: string | null
          minimum_investment_size?: string | null
          nda_executed?: boolean | null
          nda_status?: boolean | null
          offering_type?: string | null
          partnership_consideration?: boolean | null
          preferred_asset?: string | null
          preferred_blockchain?: string | null
          preferred_briefing?: string[] | null
          preferred_engagement?: string[] | null
          preferred_investment_focus?: string | null
          presale_event_interest?: boolean | null
          previous_port_investments?: boolean | null
          primary_asset_interest?: string[] | null
          primary_interest_factors?: string[] | null
          private_roadshow_interest?: boolean | null
          protocol_status?: string | null
          public_company?: boolean | null
          questionnaire_completed_at?: string | null
          questionnaire_status?: string | null
          risk_appetite?: string | null
          secondary_asset_interest?: string[] | null
          site_visit_interest?: boolean | null
          strategic_asset_interests?: Json | null
          strategic_objectives?: string[] | null
          submitted_at?: string | null
          target_deployment_phase?: string | null
          technical_demo_requested?: boolean | null
          technical_team_meeting?: boolean | null
          technical_understanding?: string[] | null
          ticker_symbol?: string | null
          tokenization_understanding?: string[] | null
          typical_investment_size?: string | null
          updated_at?: string | null
          user_id: string
          verification_notes?: string | null
          verified_at?: string | null
          wallet_integration?: string | null
        }
        Update: {
          allocation_committee?: boolean | null
          asset_specific_interests?: Json | null
          blockchain?: string | null
          blockchain_familiarity?: string[] | null
          board_seat_interest?: boolean | null
          company_name?: string | null
          company_revenue_tier?: string | null
          company_website?: string | null
          contact_availability?: string | null
          contact_preference?: string | null
          container_volume_annually?: string | null
          conviction_based_status?: string | null
          conviction_level?: string | null
          created_at?: string | null
          discovery_source?: string[] | null
          due_diligence_requests?: string[] | null
          due_diligence_timeframe?: string | null
          employee_count_range?: string | null
          engagement_level?: string | null
          exclusive_access_requests?: string[] | null
          executive_title?: string | null
          expected_roi_timeline?: string | null
          follow_on_capacity?: boolean | null
          geographic_preference?: string[] | null
          heard_about_portx?: string | null
          heard_about_project?: string | null
          id?: string
          industry_experience_years?: string | null
          infrastructure_interests?: Json | null
          interest_level?: string | null
          investment_authority_level?: string | null
          investment_thesis?: string | null
          is_test_account?: boolean | null
          key_investment_factors?: string[] | null
          kyc_verified?: boolean | null
          kyc_verified_at?: string | null
          linkedin_profile?: string | null
          maritime_investment_experience?: string | null
          maritime_logistics_experience?: boolean | null
          maximum_investment_size?: string | null
          minimum_investment_size?: string | null
          nda_executed?: boolean | null
          nda_status?: boolean | null
          offering_type?: string | null
          partnership_consideration?: boolean | null
          preferred_asset?: string | null
          preferred_blockchain?: string | null
          preferred_briefing?: string[] | null
          preferred_engagement?: string[] | null
          preferred_investment_focus?: string | null
          presale_event_interest?: boolean | null
          previous_port_investments?: boolean | null
          primary_asset_interest?: string[] | null
          primary_interest_factors?: string[] | null
          private_roadshow_interest?: boolean | null
          protocol_status?: string | null
          public_company?: boolean | null
          questionnaire_completed_at?: string | null
          questionnaire_status?: string | null
          risk_appetite?: string | null
          secondary_asset_interest?: string[] | null
          site_visit_interest?: boolean | null
          strategic_asset_interests?: Json | null
          strategic_objectives?: string[] | null
          submitted_at?: string | null
          target_deployment_phase?: string | null
          technical_demo_requested?: boolean | null
          technical_team_meeting?: boolean | null
          technical_understanding?: string[] | null
          ticker_symbol?: string | null
          tokenization_understanding?: string[] | null
          typical_investment_size?: string | null
          updated_at?: string | null
          user_id?: string
          verification_notes?: string | null
          verified_at?: string | null
          wallet_integration?: string | null
        }
        Relationships: []
      }
      investor_tracking: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string | null
          investor_tier: string | null
          last_active_at: string | null
          legal_docs_viewed: string[] | null
          page_visited: string | null
          return_visits: number | null
          sections_visited: string[] | null
          seriousness_score: number | null
          time_spent: number | null
          total_time_seconds: number | null
          updated_at: string | null
          user_id: string
          verified_at: string | null
          wallet_address: string | null
          wallet_verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string | null
          investor_tier?: string | null
          last_active_at?: string | null
          legal_docs_viewed?: string[] | null
          page_visited?: string | null
          return_visits?: number | null
          sections_visited?: string[] | null
          seriousness_score?: number | null
          time_spent?: number | null
          total_time_seconds?: number | null
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
          wallet_address?: string | null
          wallet_verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string | null
          investor_tier?: string | null
          last_active_at?: string | null
          legal_docs_viewed?: string[] | null
          page_visited?: string | null
          return_visits?: number | null
          sections_visited?: string[] | null
          seriousness_score?: number | null
          time_spent?: number | null
          total_time_seconds?: number | null
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
          wallet_address?: string | null
          wallet_verified?: boolean | null
        }
        Relationships: []
      }
      kyc_status: {
        Row: {
          created_at: string | null
          id: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      legal_acknowledgements: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          created_at: string | null
          document_type: string
          document_version: string | null
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          created_at?: string | null
          document_type: string
          document_version?: string | null
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id: string
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          created_at?: string | null
          document_type?: string
          document_version?: string | null
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      legal_status: {
        Row: {
          created_at: string | null
          fully_compliant: boolean | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          fully_compliant?: boolean | null
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          fully_compliant?: boolean | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pending_emails: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          type?: string | null
        }
        Relationships: []
      }
      presale_purchases: {
        Row: {
          asset_key: string
          asset_name: string
          asset_name_key: string | null
          created_at: string | null
          id: string
          latest_purchase_at: string | null
          payment_history: Json | null
          payment_token: string
          price_usd: number
          quantity: number
          source: string | null
          total_usd: number
          tx_signature: string | null
          updated_at: string | null
          user_id: string | null
          wallet_address: string
        }
        Insert: {
          asset_key: string
          asset_name: string
          asset_name_key?: string | null
          created_at?: string | null
          id?: string
          latest_purchase_at?: string | null
          payment_history?: Json | null
          payment_token: string
          price_usd: number
          quantity: number
          source?: string | null
          total_usd: number
          tx_signature?: string | null
          updated_at?: string | null
          user_id?: string | null
          wallet_address: string
        }
        Update: {
          asset_key?: string
          asset_name?: string
          asset_name_key?: string | null
          created_at?: string | null
          id?: string
          latest_purchase_at?: string | null
          payment_history?: Json | null
          payment_token?: string
          price_usd?: number
          quantity?: number
          source?: string | null
          total_usd?: number
          tx_signature?: string | null
          updated_at?: string | null
          user_id?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      presale_sessions: {
        Row: {
          created_at: string
          has_invested: boolean
          id: string
          investment_time: string | null
          presale_start_at: string | null
          started_at: string
          timer_ended: boolean | null
          timer_paused_at: string | null
          timer_started_at: string | null
          updated_at: string | null
          user_id: string
          virtual_investors: number
        }
        Insert: {
          created_at?: string
          has_invested?: boolean
          id?: string
          investment_time?: string | null
          presale_start_at?: string | null
          started_at?: string
          timer_ended?: boolean | null
          timer_paused_at?: string | null
          timer_started_at?: string | null
          updated_at?: string | null
          user_id: string
          virtual_investors?: number
        }
        Update: {
          created_at?: string
          has_invested?: boolean
          id?: string
          investment_time?: string | null
          presale_start_at?: string | null
          started_at?: string
          timer_ended?: boolean | null
          timer_paused_at?: string | null
          timer_started_at?: string | null
          updated_at?: string | null
          user_id?: string
          virtual_investors?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          city: string | null
          company_name: string | null
          country: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          investment_tier: string | null
          investor_tier: string | null
          last_name: string | null
          last_questionnaire_reminder: string | null
          minimum_balance_verified: boolean | null
          onboarding_completed: boolean | null
          onboarding_step: string | null
          phone: string | null
          updated_at: string | null
          user_type: string | null
          wallet_address: string | null
        }
        Insert: {
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          investment_tier?: string | null
          investor_tier?: string | null
          last_name?: string | null
          last_questionnaire_reminder?: string | null
          minimum_balance_verified?: boolean | null
          onboarding_completed?: boolean | null
          onboarding_step?: string | null
          phone?: string | null
          updated_at?: string | null
          user_type?: string | null
          wallet_address?: string | null
        }
        Update: {
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          investment_tier?: string | null
          investor_tier?: string | null
          last_name?: string | null
          last_questionnaire_reminder?: string | null
          minimum_balance_verified?: boolean | null
          onboarding_completed?: boolean | null
          onboarding_step?: string | null
          phone?: string | null
          updated_at?: string | null
          user_type?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      sumsub_webhook_logs: {
        Row: {
          details: Json | null
          event_type: string | null
          id: string
          received_at: string | null
          status: string | null
          success: boolean | null
          user_id: string | null
        }
        Insert: {
          details?: Json | null
          event_type?: string | null
          id?: string
          received_at?: string | null
          status?: string | null
          success?: boolean | null
          user_id?: string | null
        }
        Update: {
          details?: Json | null
          event_type?: string | null
          id?: string
          received_at?: string | null
          status?: string | null
          success?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string | null
          id: number
          ip_address: string | null
          ip_metadata: Json | null
          user_agent: string | null
          user_id: string | null
          wallet_address: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string | null
          id?: number
          ip_address?: string | null
          ip_metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
          wallet_address?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string | null
          id?: number
          ip_address?: string | null
          ip_metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      user_kyc_status: {
        Row: {
          applicant_id: string | null
          created_at: string | null
          id: string
          inspection_id: string | null
          kyc_status: string | null
          provider: string | null
          reject_reason: string | null
          review_notes: string | null
          reviewed_at: string | null
          test_mode: boolean | null
          updated_at: string | null
          user_id: string | null
          verified_at: string | null
        }
        Insert: {
          applicant_id?: string | null
          created_at?: string | null
          id?: string
          inspection_id?: string | null
          kyc_status?: string | null
          provider?: string | null
          reject_reason?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          test_mode?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          verified_at?: string | null
        }
        Update: {
          applicant_id?: string | null
          created_at?: string | null
          id?: string
          inspection_id?: string | null
          kyc_status?: string | null
          provider?: string | null
          reject_reason?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          test_mode?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      user_legal_status: {
        Row: {
          accredited_investor_questionnaire_completed: boolean | null
          accredited_investor_status: string | null
          created_at: string | null
          executive_protocol_completed: boolean | null
          fully_compliant: boolean | null
          id: string
          presale_access_level: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          accredited_investor_questionnaire_completed?: boolean | null
          accredited_investor_status?: string | null
          created_at?: string | null
          executive_protocol_completed?: boolean | null
          fully_compliant?: boolean | null
          id?: string
          presale_access_level?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          accredited_investor_questionnaire_completed?: boolean | null
          accredited_investor_status?: string | null
          created_at?: string | null
          executive_protocol_completed?: boolean | null
          fully_compliant?: boolean | null
          id?: string
          presale_access_level?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_onboarding_state: {
        Row: {
          pof_verified: boolean | null
          status: string | null
          updated_at: string | null
          user_id: string
          wallet_connected: boolean | null
        }
        Insert: {
          pof_verified?: boolean | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          wallet_connected?: boolean | null
        }
        Update: {
          pof_verified?: boolean | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          wallet_connected?: boolean | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          admin_email: string | null
          created_at: string | null
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          admin_email?: string | null
          created_at?: string | null
          id?: string
          role: string
          user_id?: string | null
        }
        Update: {
          admin_email?: string | null
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      serious_investors: {
        Row: {
          email: string | null
          id: string | null
          investor_tier: string | null
          minimum_balance_verified: boolean | null
          seriousness_score: number | null
          wallet_address: string | null
        }
        Relationships: []
      }
      user_access_matrix: {
        Row: {
          all_legal_docs_acknowledged: boolean | null
          can_access_dashboard: boolean | null
          can_invest: boolean | null
          fully_compliant: boolean | null
          has_any_legal_acknowledged: boolean | null
          is_legally_compliant: boolean | null
          kyc_verified: boolean | null
          onboarding_status: string | null
          onboarding_updated_at: string | null
          pof_verified: boolean | null
          presale_access_level: string | null
          questionnaire_status: string | null
          user_id: string | null
          wallet_connected: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      auto_approve_executive_protocols: { Args: never; Returns: undefined }
      auto_approve_questionnaires: { Args: never; Returns: undefined }
      send_approval_email: {
        Args: { user_email: string; user_name: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
