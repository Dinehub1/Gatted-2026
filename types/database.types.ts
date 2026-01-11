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
        PostgrestVersion: "14.1"
    }
    public: {
        Tables: {
            announcement_reads: {
                Row: {
                    announcement_id: string | null
                    id: string
                    read_at: string | null
                    user_id: string | null
                }
                Insert: {
                    announcement_id?: string | null
                    id?: string
                    read_at?: string | null
                    user_id?: string | null
                }
                Update: {
                    announcement_id?: string | null
                    id?: string
                    read_at?: string | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "announcement_reads_announcement_id_fkey"
                        columns: ["announcement_id"]
                        isOneToOne: false
                        referencedRelation: "announcements"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "announcement_reads_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            announcements: {
                Row: {
                    attachments: string[] | null
                    created_at: string | null
                    created_by: string | null
                    expires_at: string | null
                    id: string
                    message: string
                    society_id: string | null
                    target_block_id: string | null
                    target_role: Database["public"]["Enums"]["user_role"] | null
                    target_type: Database["public"]["Enums"]["announcement_target"] | null
                    target_unit_id: string | null
                    title: string
                }
                Insert: {
                    attachments?: string[] | null
                    created_at?: string | null
                    created_by?: string | null
                    expires_at?: string | null
                    id?: string
                    message: string
                    society_id?: string | null
                    target_block_id?: string | null
                    target_role?: Database["public"]["Enums"]["user_role"] | null
                    target_type?: Database["public"]["Enums"]["announcement_target"] | null
                    target_unit_id?: string | null
                    title: string
                }
                Update: {
                    attachments?: string[] | null
                    created_at?: string | null
                    created_by?: string | null
                    expires_at?: string | null
                    id?: string
                    message?: string
                    society_id?: string | null
                    target_block_id?: string | null
                    target_role?: Database["public"]["Enums"]["user_role"] | null
                    target_type?: Database["public"]["Enums"]["announcement_target"] | null
                    target_unit_id?: string | null
                    title?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "announcements_created_by_fkey"
                        columns: ["created_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "announcements_society_id_fkey"
                        columns: ["society_id"]
                        isOneToOne: false
                        referencedRelation: "societies"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "announcements_target_block_id_fkey"
                        columns: ["target_block_id"]
                        isOneToOne: false
                        referencedRelation: "blocks"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "announcements_target_unit_id_fkey"
                        columns: ["target_unit_id"]
                        isOneToOne: false
                        referencedRelation: "units"
                        referencedColumns: ["id"]
                    },
                ]
            }
            blocks: {
                Row: {
                    created_at: string | null
                    id: string
                    name: string
                    society_id: string | null
                    total_floors: number | null
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    name: string
                    society_id?: string | null
                    total_floors?: number | null
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    name?: string
                    society_id?: string | null
                    total_floors?: number | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "blocks_society_id_fkey"
                        columns: ["society_id"]
                        isOneToOne: false
                        referencedRelation: "societies"
                        referencedColumns: ["id"]
                    },
                ]
            }
            guard_shifts: {
                Row: {
                    created_at: string | null
                    guard_id: string | null
                    id: string
                    shift_end: string | null
                    shift_start: string | null
                    society_id: string | null
                }
                Insert: {
                    created_at?: string | null
                    guard_id?: string | null
                    id?: string
                    shift_end?: string | null
                    shift_start?: string | null
                    society_id?: string | null
                }
                Update: {
                    created_at?: string | null
                    guard_id?: string | null
                    id?: string
                    shift_end?: string | null
                    shift_start?: string | null
                    society_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "guard_shifts_guard_id_fkey"
                        columns: ["guard_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "guard_shifts_society_id_fkey"
                        columns: ["society_id"]
                        isOneToOne: false
                        referencedRelation: "societies"
                        referencedColumns: ["id"]
                    },
                ]
            }
            issue_updates: {
                Row: {
                    comment: string | null
                    created_at: string | null
                    id: string
                    issue_id: string | null
                    status_changed_to: Database["public"]["Enums"]["issue_status"] | null
                    updated_by: string | null
                }
                Insert: {
                    comment?: string | null
                    created_at?: string | null
                    id?: string
                    issue_id?: string | null
                    status_changed_to?: Database["public"]["Enums"]["issue_status"] | null
                    updated_by?: string | null
                }
                Update: {
                    comment?: string | null
                    created_at?: string | null
                    id?: string
                    issue_id?: string | null
                    status_changed_to?: Database["public"]["Enums"]["issue_status"] | null
                    updated_by?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "issue_updates_issue_id_fkey"
                        columns: ["issue_id"]
                        isOneToOne: false
                        referencedRelation: "issues"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "issue_updates_updated_by_fkey"
                        columns: ["updated_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            issues: {
                Row: {
                    assigned_at: string | null
                    assigned_to: string | null
                    category: Database["public"]["Enums"]["issue_category"]
                    created_at: string | null
                    description: string | null
                    id: string
                    photos: string[] | null
                    priority: Database["public"]["Enums"]["issue_priority"]
                    reported_by: string | null
                    resolution_notes: string | null
                    resolved_at: string | null
                    resolved_by: string | null
                    society_id: string | null
                    status: Database["public"]["Enums"]["issue_status"]
                    title: string
                    unit_id: string | null
                    updated_at: string | null
                }
                Insert: {
                    assigned_at?: string | null
                    assigned_to?: string | null
                    category: Database["public"]["Enums"]["issue_category"]
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    photos?: string[] | null
                    priority?: Database["public"]["Enums"]["issue_priority"]
                    reported_by?: string | null
                    resolution_notes?: string | null
                    resolved_at?: string | null
                    resolved_by?: string | null
                    society_id?: string | null
                    status?: Database["public"]["Enums"]["issue_status"]
                    title: string
                    unit_id?: string | null
                    updated_at?: string | null
                }
                Update: {
                    assigned_at?: string | null
                    assigned_to?: string | null
                    category?: Database["public"]["Enums"]["issue_category"]
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    photos?: string[] | null
                    priority?: Database["public"]["Enums"]["issue_priority"]
                    reported_by?: string | null
                    resolution_notes?: string | null
                    resolved_at?: string | null
                    resolved_by?: string | null
                    society_id?: string | null
                    status?: Database["public"]["Enums"]["issue_status"]
                    title?: string
                    unit_id?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "issues_assigned_to_fkey"
                        columns: ["assigned_to"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "issues_reported_by_fkey"
                        columns: ["reported_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "issues_resolved_by_fkey"
                        columns: ["resolved_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "issues_society_id_fkey"
                        columns: ["society_id"]
                        isOneToOne: false
                        referencedRelation: "societies"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "issues_unit_id_fkey"
                        columns: ["unit_id"]
                        isOneToOne: false
                        referencedRelation: "units"
                        referencedColumns: ["id"]
                    },
                ]
            }
            notifications: {
                Row: {
                    created_at: string | null
                    id: string
                    message: string
                    metadata: Json | null
                    read: boolean | null
                    title: string
                    type: string | null
                    user_id: string | null
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    message: string
                    metadata?: Json | null
                    read?: boolean | null
                    title: string
                    type?: string | null
                    user_id?: string | null
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    message?: string
                    metadata?: Json | null
                    read?: boolean | null
                    title?: string
                    type?: string | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "notifications_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            parcels: {
                Row: {
                    collected_at: string | null
                    collected_by: string | null
                    courier_name: string | null
                    created_at: string | null
                    description: string | null
                    id: string
                    received_at: string | null
                    received_by: string | null
                    resident_id: string | null
                    society_id: string | null
                    status: string | null
                    tracking_number: string | null
                    unit_id: string | null
                    updated_at: string | null
                }
                Insert: {
                    collected_at?: string | null
                    collected_by?: string | null
                    courier_name?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    received_at?: string | null
                    received_by?: string | null
                    resident_id?: string | null
                    society_id?: string | null
                    status?: string | null
                    tracking_number?: string | null
                    unit_id?: string | null
                    updated_at?: string | null
                }
                Update: {
                    collected_at?: string | null
                    collected_by?: string | null
                    courier_name?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    received_at?: string | null
                    received_by?: string | null
                    resident_id?: string | null
                    society_id?: string | null
                    status?: string | null
                    tracking_number?: string | null
                    unit_id?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "parcels_collected_by_fkey"
                        columns: ["collected_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "parcels_received_by_fkey"
                        columns: ["received_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "parcels_resident_id_fkey"
                        columns: ["resident_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "parcels_society_id_fkey"
                        columns: ["society_id"]
                        isOneToOne: false
                        referencedRelation: "societies"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "parcels_unit_id_fkey"
                        columns: ["unit_id"]
                        isOneToOne: false
                        referencedRelation: "units"
                        referencedColumns: ["id"]
                    },
                ]
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    created_at: string | null
                    email: string | null
                    full_name: string | null
                    id: string
                    phone: string
                    updated_at: string | null
                }
                Insert: {
                    avatar_url?: string | null
                    created_at?: string | null
                    email?: string | null
                    full_name?: string | null
                    id: string
                    phone: string
                    updated_at?: string | null
                }
                Update: {
                    avatar_url?: string | null
                    created_at?: string | null
                    email?: string | null
                    full_name?: string | null
                    id?: string
                    phone?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
            societies: {
                Row: {
                    address: string | null
                    city: string | null
                    created_at: string | null
                    id: string
                    name: string
                    settings: Json | null
                    state: string | null
                    total_blocks: number | null
                    total_units: number | null
                    updated_at: string | null
                    zip_code: string | null
                }
                Insert: {
                    address?: string | null
                    city?: string | null
                    created_at?: string | null
                    id?: string
                    name: string
                    settings?: Json | null
                    state?: string | null
                    total_blocks?: number | null
                    total_units?: number | null
                    updated_at?: string | null
                    zip_code?: string | null
                }
                Update: {
                    address?: string | null
                    city?: string | null
                    created_at?: string | null
                    id?: string
                    name?: string
                    settings?: Json | null
                    state?: string | null
                    total_blocks?: number | null
                    total_units?: number | null
                    updated_at?: string | null
                    zip_code?: string | null
                }
                Relationships: []
            }
            unit_residents: {
                Row: {
                    created_at: string | null
                    id: string
                    is_primary: boolean | null
                    move_in_date: string | null
                    move_out_date: string | null
                    unit_id: string | null
                    user_id: string | null
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    is_primary?: boolean | null
                    move_in_date?: string | null
                    move_out_date?: string | null
                    unit_id?: string | null
                    user_id?: string | null
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    is_primary?: boolean | null
                    move_in_date?: string | null
                    move_out_date?: string | null
                    unit_id?: string | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "unit_residents_unit_id_fkey"
                        columns: ["unit_id"]
                        isOneToOne: false
                        referencedRelation: "units"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "unit_residents_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            units: {
                Row: {
                    area_sqft: number | null
                    block_id: string | null
                    created_at: string | null
                    floor: number | null
                    id: string
                    society_id: string | null
                    unit_number: string
                    unit_type: string | null
                    updated_at: string | null
                }
                Insert: {
                    area_sqft?: number | null
                    block_id?: string | null
                    created_at?: string | null
                    floor?: number | null
                    id?: string
                    society_id?: string | null
                    unit_number: string
                    unit_type?: string | null
                    updated_at?: string | null
                }
                Update: {
                    area_sqft?: number | null
                    block_id?: string | null
                    created_at?: string | null
                    floor?: number | null
                    id?: string
                    society_id?: string | null
                    unit_number?: string
                    unit_type?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "units_block_id_fkey"
                        columns: ["block_id"]
                        isOneToOne: false
                        referencedRelation: "blocks"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "units_society_id_fkey"
                        columns: ["society_id"]
                        isOneToOne: false
                        referencedRelation: "societies"
                        referencedColumns: ["id"]
                    },
                ]
            }
            user_roles: {
                Row: {
                    created_at: string | null
                    id: string
                    is_active: boolean | null
                    role: Database["public"]["Enums"]["user_role"]
                    society_id: string | null
                    unit_id: string | null
                    updated_at: string | null
                    user_id: string | null
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    is_active?: boolean | null
                    role: Database["public"]["Enums"]["user_role"]
                    society_id?: string | null
                    unit_id?: string | null
                    updated_at?: string | null
                    user_id?: string | null
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    is_active?: boolean | null
                    role?: Database["public"]["Enums"]["user_role"]
                    society_id?: string | null
                    unit_id?: string | null
                    updated_at?: string | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "user_roles_society_id_fkey"
                        columns: ["society_id"]
                        isOneToOne: false
                        referencedRelation: "societies"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "user_roles_unit_id_fkey"
                        columns: ["unit_id"]
                        isOneToOne: false
                        referencedRelation: "units"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "user_roles_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            visitors: {
                Row: {
                    checked_in_at: string | null
                    checked_in_by: string | null
                    checked_out_at: string | null
                    checked_out_by: string | null
                    created_at: string | null
                    expected_date: string | null
                    expected_time: string | null
                    host_id: string | null
                    id: string
                    notes: string | null
                    otp: string | null
                    otp_expires_at: string | null
                    photo_url: string | null
                    purpose: string | null
                    society_id: string | null
                    status: Database["public"]["Enums"]["visitor_status"]
                    unit_id: string | null
                    updated_at: string | null
                    valid_until: string | null
                    vehicle_number: string | null
                    visitor_name: string
                    visitor_phone: string | null
                    visitor_type: Database["public"]["Enums"]["visitor_type"]
                }
                Insert: {
                    checked_in_at?: string | null
                    checked_in_by?: string | null
                    checked_out_at?: string | null
                    checked_out_by?: string | null
                    created_at?: string | null
                    expected_date?: string | null
                    expected_time?: string | null
                    host_id?: string | null
                    id?: string
                    notes?: string | null
                    otp?: string | null
                    otp_expires_at?: string | null
                    photo_url?: string | null
                    purpose?: string | null
                    society_id?: string | null
                    status?: Database["public"]["Enums"]["visitor_status"]
                    unit_id?: string | null
                    updated_at?: string | null
                    valid_until?: string | null
                    vehicle_number?: string | null
                    visitor_name: string
                    visitor_phone?: string | null
                    visitor_type?: Database["public"]["Enums"]["visitor_type"]
                }
                Update: {
                    checked_in_at?: string | null
                    checked_in_by?: string | null
                    checked_out_at?: string | null
                    checked_out_by?: string | null
                    created_at?: string | null
                    expected_date?: string | null
                    expected_time?: string | null
                    host_id?: string | null
                    id?: string
                    notes?: string | null
                    otp?: string | null
                    otp_expires_at?: string | null
                    photo_url?: string | null
                    purpose?: string | null
                    society_id?: string | null
                    status?: Database["public"]["Enums"]["visitor_status"]
                    unit_id?: string | null
                    updated_at?: string | null
                    valid_until?: string | null
                    vehicle_number?: string | null
                    visitor_name?: string
                    visitor_phone?: string | null
                    visitor_type?: Database["public"]["Enums"]["visitor_type"]
                }
                Relationships: [
                    {
                        foreignKeyName: "visitors_checked_in_by_fkey"
                        columns: ["checked_in_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "visitors_checked_out_by_fkey"
                        columns: ["checked_out_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "visitors_host_id_fkey"
                        columns: ["host_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "visitors_society_id_fkey"
                        columns: ["society_id"]
                        isOneToOne: false
                        referencedRelation: "societies"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "visitors_unit_id_fkey"
                        columns: ["unit_id"]
                        isOneToOne: false
                        referencedRelation: "units"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            checkin_visitor: {
                Args: {
                    visitor_uuid: string
                    guard_uuid: string
                    otp_code?: string
                }
                Returns: Json
            }
            checkout_visitor: {
                Args: {
                    visitor_uuid: string
                    guard_uuid: string
                }
                Returns: Json
            }
            generate_visitor_otp: {
                Args: Record<PropertyKey, never>
                Returns: undefined
            }
            get_user_context: {
                Args: {
                    user_uuid: string
                }
                Returns: {
                    society_id: string
                    society_name: string
                    role: Database["public"]["Enums"]["user_role"]
                    unit_id: string
                    unit_number: string
                }[]
            }
        }
        Enums: {
            announcement_target: "all" | "block" | "unit" | "role"
            issue_category:
            | "plumbing"
            | "electrical"
            | "cleaning"
            | "security"
            | "maintenance"
            | "parking"
            | "noise"
            | "other"
            issue_priority: "low" | "medium" | "high" | "urgent"
            issue_status: "open" | "in-progress" | "resolved" | "closed" | "rejected"
            user_role: "admin" | "manager" | "guard" | "resident" | "owner" | "tenant"
            visitor_status:
            | "pending"
            | "approved"
            | "checked-in"
            | "checked-out"
            | "denied"
            visitor_type: "expected" | "walk-in" | "delivery" | "service" | "guest"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof DatabaseWithoutInternals, "public">]

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
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
    public: {
        Enums: {
            announcement_target: ["all", "block", "unit", "role"],
            issue_category: [
                "plumbing",
                "electrical",
                "cleaning",
                "security",
                "maintenance",
                "parking",
                "noise",
                "other",
            ],
            issue_priority: ["low", "medium", "high", "urgent"],
            issue_status: ["open", "in-progress", "resolved", "closed", "rejected"],
            user_role: ["admin", "manager", "guard", "resident", "owner", "tenant"],
            visitor_status: [
                "pending",
                "approved",
                "checked-in",
                "checked-out",
                "denied",
            ],
            visitor_type: ["expected", "walk-in", "delivery", "service", "guest"],
        },
    },
} as const