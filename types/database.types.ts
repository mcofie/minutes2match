/**
 * Supabase Database Types for Minutes 2 Match
 * 
 * These types represent the m2m schema tables and are used
 * to provide proper TypeScript type checking for Supabase operations.
 * 
 * Note: For full type safety, generate these using:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.types.ts
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: M2MSchema
    m2m: M2MSchema
}

export type M2MDatabase = Database

export type M2MSchema = {
    Tables: {
        profiles: {
            Row: {
                id: string
                phone: string
                display_name: string | null
                gender: 'male' | 'female' | null
                birth_date: string | null
                location: string | null
                is_verified: boolean
                dating_persona: string | null
                photo_url: string | null
                interested_in: 'male' | 'female' | 'everyone' | null
                intent: 'marriage' | 'serious' | 'casual' | 'friendship' | null
                genotype: 'AA' | 'AS' | 'SS' | 'AC' | 'SC' | 'other' | null
                religion: string | null
                height_cm: number | null
                occupation: string | null
                is_active: boolean
                admin_notes: string | null
                dealbreakers: Json | null
                badges: string[] | null
                min_age: number | null
                max_age: number | null
                events_attended: number
                created_at: string
                updated_at: string
            }
            Insert: {
                id: string
                phone: string
                display_name?: string | null
                gender?: 'male' | 'female' | null
                birth_date?: string | null
                location?: string | null
                is_verified?: boolean
                dating_persona?: string | null
                photo_url?: string | null
                interested_in?: 'male' | 'female' | 'everyone' | null
                intent?: 'marriage' | 'serious' | 'casual' | 'friendship' | null
                genotype?: 'AA' | 'AS' | 'SS' | 'AC' | 'SC' | 'other' | null
                religion?: string | null
                height_cm?: number | null
                occupation?: string | null
                is_active?: boolean
                dealbreakers?: Json | null
                badges?: string[] | null
                min_age?: number | null
                max_age?: number | null
                events_attended?: number
                created_at?: string
                updated_at?: string
            }
            Update: {
                id?: string
                phone?: string
                display_name?: string | null
                gender?: 'male' | 'female' | null
                birth_date?: string | null
                location?: string | null
                is_verified?: boolean
                dating_persona?: string | null
                photo_url?: string | null
                interested_in?: 'male' | 'female' | 'everyone' | null
                intent?: 'marriage' | 'serious' | 'casual' | 'friendship' | null
                genotype?: 'AA' | 'AS' | 'SS' | 'AC' | 'SC' | 'other' | null
                religion?: string | null
                height_cm?: number | null
                occupation?: string | null
                is_active?: boolean
                admin_notes?: string | null
                dealbreakers?: Json | null
                badges?: string[] | null
                min_age?: number | null
                max_age?: number | null
                events_attended?: number
                updated_at?: string
            }
            Relationships: []
        }
        vibe_answers: {
            Row: {
                id: string
                user_id: string | null
                question_key: string
                answer_value: string
                created_at: string
            }
            Insert: {
                id?: string
                user_id?: string | null
                question_key: string
                answer_value: string
                created_at?: string
            }
            Update: {
                user_id?: string | null
                question_key?: string
                answer_value?: string
            }
            Relationships: []
        }
        otp_codes: {
            Row: {
                id: string
                phone: string
                code: string
                expires_at: string
                used: boolean
                created_at: string
            }
            Insert: {
                id?: string
                phone: string
                code: string
                expires_at: string
                used?: boolean
                created_at?: string
            }
            Update: {
                phone?: string
                code?: string
                expires_at?: string
                used?: boolean
            }
            Relationships: []
        }
        events: {
            Row: {
                id: string
                title: string
                description: string | null
                event_date: string
                venue: string
                venue_address: string | null
                male_capacity: number
                female_capacity: number
                male_tickets_sold: number
                female_tickets_sold: number
                ticket_price_male: number
                ticket_price_female: number
                status: 'draft' | 'open' | 'waitlist' | 'sold_out' | 'completed'
                cover_image_url: string | null
                is_public: boolean
                created_at: string
            }
            Insert: {
                id?: string
                title: string
                description?: string | null
                event_date: string
                venue: string
                venue_address?: string | null
                male_capacity: number
                female_capacity: number
                male_tickets_sold?: number
                female_tickets_sold?: number
                ticket_price_male: number
                ticket_price_female: number
                status?: 'draft' | 'open' | 'waitlist' | 'sold_out' | 'completed'
                cover_image_url?: string | null
                is_public?: boolean
                created_at?: string
            }
            Update: {
                title?: string
                description?: string | null
                event_date?: string
                venue?: string
                venue_address?: string | null
                male_capacity?: number
                female_capacity?: number
                male_tickets_sold?: number
                female_tickets_sold?: number
                ticket_price_male?: number
                ticket_price_female?: number
                status?: 'draft' | 'open' | 'waitlist' | 'sold_out' | 'completed'
                cover_image_url?: string | null
                is_public?: boolean
            }
            Relationships: []
        }
        event_bookings: {
            Row: {
                id: string
                event_id: string | null
                user_id: string | null
                status: 'pending' | 'confirmed' | 'waitlisted' | 'cancelled'
                payment_id: string | null
                created_at: string
            }
            Insert: {
                id?: string
                event_id?: string | null
                user_id?: string | null
                status?: 'pending' | 'confirmed' | 'waitlisted' | 'cancelled'
                payment_id?: string | null
                created_at?: string
            }
            Update: {
                event_id?: string | null
                user_id?: string | null
                status?: 'pending' | 'confirmed' | 'waitlisted' | 'cancelled'
                payment_id?: string | null
            }
            Relationships: []
        }
        event_qualifications: {
            Row: {
                id: string
                event_id: string
                user_id: string
                status: 'pending' | 'qualified' | 'invited'
                notified_at: string | null
                created_at: string
            }
            Insert: {
                id?: string
                event_id: string
                user_id: string
                status?: 'pending' | 'qualified' | 'invited'
                notified_at?: string | null
                created_at?: string
            }
            Update: {
                status?: 'pending' | 'qualified' | 'invited'
                notified_at?: string | null
            }
            Relationships: []
        }
        matches: {
            Row: {
                id: string
                user_1_id: string | null
                user_2_id: string | null
                status: 'pending_payment' | 'partial_payment' | 'unlocked' | 'rejected' | 'expired'
                unlock_price: number
                user_1_paid: boolean
                user_2_paid: boolean
                user_1_paid_at: string | null
                user_2_paid_at: string | null
                created_by: string | null
                created_at: string
                unlocked_at: string | null
                feedback_status: 'pending' | 'connected' | 'no_response' | 'unmatched' | 'dating' | null
                feedback_notes: string | null
                feedback_updated_at: string | null
                feedback_updated_by: string | null
                user_1_contacted: boolean
                user_2_contacted: boolean
                contact_exchanged: boolean
                user_notes: string | null
                match_score: number | null
                match_reasons: Json | null
                match_warnings: Json | null
                last_payment_reminder_at: string | null
                payment_reminder_count: number
            }
            Insert: {
                id?: string
                user_1_id?: string | null
                user_2_id?: string | null
                status?: 'pending_payment' | 'partial_payment' | 'unlocked' | 'rejected' | 'expired'
                unlock_price: number
                user_1_paid?: boolean
                user_2_paid?: boolean
                user_1_paid_at?: string | null
                user_2_paid_at?: string | null
                created_by?: string | null
                created_at?: string
                unlocked_at?: string | null
                feedback_status?: 'pending' | 'connected' | 'no_response' | 'unmatched' | 'dating' | null
                feedback_notes?: string | null
                feedback_updated_at?: string | null
                feedback_updated_by?: string | null
                user_1_contacted?: boolean
                user_2_contacted?: boolean
                contact_exchanged?: boolean
                user_notes?: string | null
                match_score?: number | null
                match_reasons?: Json | null
                match_warnings?: Json | null
                last_payment_reminder_at?: string | null
                payment_reminder_count?: number
            }
            Update: {
                user_1_id?: string | null
                user_2_id?: string | null
                status?: 'pending_payment' | 'partial_payment' | 'unlocked' | 'rejected' | 'expired'
                unlock_price?: number
                user_1_paid?: boolean
                user_2_paid?: boolean
                user_1_paid_at?: string | null
                user_2_paid_at?: string | null
                unlocked_at?: string | null
                feedback_status?: 'pending' | 'connected' | 'no_response' | 'unmatched' | 'dating' | null
                feedback_notes?: string | null
                feedback_updated_at?: string | null
                feedback_updated_by?: string | null
                user_1_contacted?: boolean
                user_2_contacted?: boolean
                contact_exchanged?: boolean
                user_notes?: string | null
                match_score?: number | null
                match_reasons?: Json | null
                match_warnings?: Json | null
                last_payment_reminder_at?: string | null
                payment_reminder_count?: number
            }
            Relationships: []
        }
        payments: {
            Row: {
                id: string
                user_id: string | null
                amount: number
                currency: string
                provider: 'paystack' | 'hubtel'
                provider_ref: string | null
                purpose: 'event_ticket' | 'match_unlock'
                status: 'pending' | 'success' | 'failed'
                metadata: Json | null
                created_at: string
            }
            Insert: {
                id?: string
                user_id?: string | null
                amount: number
                currency?: string
                provider: 'paystack' | 'hubtel'
                provider_ref?: string | null
                purpose: 'event_ticket' | 'match_unlock'
                status?: 'pending' | 'success' | 'failed'
                metadata?: Json | null
                created_at?: string
            }
            Update: {
                user_id?: string | null
                amount?: number
                currency?: string
                provider?: 'paystack' | 'hubtel'
                provider_ref?: string | null
                purpose?: 'event_ticket' | 'match_unlock'
                status?: 'pending' | 'success' | 'failed'
                metadata?: Json | null
            }
            Relationships: []
        }
        admins: {
            Row: {
                id: string
                role: 'super_admin' | 'matchmaker'
                created_at: string
            }
            Insert: {
                id: string
                role?: 'super_admin' | 'matchmaker'
                created_at?: string
            }
            Update: {
                role?: 'super_admin' | 'matchmaker'
            }
        }
        settings: {
            Row: {
                key: string
                value: Json
                updated_at: string
            }
            Insert: {
                key: string
                value: Json
                updated_at?: string
            }
            Update: {
                value?: Json
                updated_at?: string
            }
            Relationships: []
        }
        subscriptions: {
            Row: {
                id: string
                user_id: string
                status: 'active' | 'expired' | 'cancelled'
                start_date: string
                end_date: string
                auto_renew: boolean
                created_at: string
                updated_at: string
            }
            Insert: {
                id?: string
                user_id: string
                status?: 'active' | 'expired' | 'cancelled'
                start_date: string
                end_date: string
                auto_renew?: boolean
                created_at?: string
                updated_at?: string
            }
            Update: {
                status?: 'active' | 'expired' | 'cancelled'
                end_date?: string
                auto_renew?: boolean
                updated_at?: string
            }
            Relationships: []
        }
        payment_alerts: {
            Row: {
                id: string
                payment_ref: string | null
                user_id: string | null
                amount: number | null
                purpose: string | null
                error_message: string | null
                alert_type: 'payment_failed' | 'verification_error' | 'security_alert'
                resolved: boolean
                resolved_at: string | null
                created_at: string
            }
            Insert: {
                id?: string
                payment_ref?: string | null
                user_id?: string | null
                amount?: number | null
                purpose?: string | null
                error_message?: string | null
                alert_type: 'payment_failed' | 'verification_error' | 'security_alert'
                resolved?: boolean
                resolved_at?: string | null
                created_at?: string
            }
            Update: {
                resolved?: boolean
                resolved_at?: string | null
            }
            Relationships: []
        }
    }
    Views: {
        [_ in never]: never
    }
    Functions: {
        [_ in never]: never
    }
    Enums: {
        [_ in never]: never
    }
    CompositeTypes: {
        [_ in never]: never
    }
}

// Helper type aliases
export type Profile = M2MSchema['Tables']['profiles']['Row']
export type Event = M2MSchema['Tables']['events']['Row']
export type Match = M2MSchema['Tables']['matches']['Row']
export type Payment = M2MSchema['Tables']['payments']['Row']
export type EventBooking = M2MSchema['Tables']['event_bookings']['Row']
export type EventQualification = M2MSchema['Tables']['event_qualifications']['Row']
export type Admin = M2MSchema['Tables']['admins']['Row']
export type Setting = M2MSchema['Tables']['settings']['Row']
export type VibeAnswer = M2MSchema['Tables']['vibe_answers']['Row']
export type OtpCode = M2MSchema['Tables']['otp_codes']['Row']
