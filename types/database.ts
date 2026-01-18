/**
 * Supabase Database Types for Minutes 2 Match
 * 
 * These types represent the m2m schema tables and are used
 * to provide proper TypeScript type checking for Supabase operations.
 * 
 * Note: For full type safety, generate these using:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    m2m: {
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
                    updated_at?: string
                }
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
                }
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
    }
}

// Helper type aliases for easier use
export type Profile = Database['m2m']['Tables']['profiles']['Row']
export type Event = Database['m2m']['Tables']['events']['Row']
export type Match = Database['m2m']['Tables']['matches']['Row']
export type Payment = Database['m2m']['Tables']['payments']['Row']
export type EventBooking = Database['m2m']['Tables']['event_bookings']['Row']
export type EventQualification = Database['m2m']['Tables']['event_qualifications']['Row']
export type Admin = Database['m2m']['Tables']['admins']['Row']
export type Setting = Database['m2m']['Tables']['settings']['Row']
export type VibeAnswer = Database['m2m']['Tables']['vibe_answers']['Row']
export type OtpCode = Database['m2m']['Tables']['otp_codes']['Row']
