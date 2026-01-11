export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
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
                Relationships: []
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
                Relationships: []
            }
            blocks: {
                Row: {
                    created_at: string | null
                    id: string
                    manager_id: string | null
                    name: string
                    society_id: string | null
                    total_floors: number | null
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    manager_id?: string | null
                    name: string
                    society_id?: string | null
                    total_floors?: number | null
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    manager_id?: string | null
                    name?: string
                    society_id?: string | null
                    total_floors?: number | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            guard_shifts: {
                Row: {
                    created_at: string | null
                    guard_id: string | null
                    handed_over_to: string | null
                    handover_notes: string | null
                    id: string
                    shift_end: string | null
                    shift_start: string
                    society_id: string | null
                }
                Insert: {
                    created_at?: string | null
                    guard_id?: string | null
                    handed_over_to?: string | null
                    handover_notes?: string | null
                    id?: string
                    shift_end?: string | null
                    shift_start: string
                    society_id?: string | null
                }
                Update: {
                    created_at?: string | null
                    guard_id?: string | null
                    handed_over_to?: string | null
                    handover_notes?: string | null
                    id?: string
                    shift_end?: string | null
                    shift_start?: string
                    society_id?: string | null
                }
                Relationships: []
            }
            issue_updates: {
                Row: {
                    created_at: string | null
                    id: string
                    issue_id: string | null
                    message: string
                    new_status: Database["public"]["Enums"]["issue_status"] | null
                    user_id: string | null
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    issue_id?: string | null
                    message: string
                    new_status?: Database["public"]["Enums"]["issue_status"] | null
                    user_id?: string | null
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    issue_id?: string | null
                    message?: string
                    new_status?: Database["public"]["Enums"]["issue_status"] | null
                    user_id?: string | null
                }
                Relationships: []
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
                        foreignKeyName: "issues_unit_id_fkey"
                        columns: ["unit_id"]
                        isOneToOne: false
                        referencedRelation: "units"
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
                        foreignKeyName: "issues_society_id_fkey"
                        columns: ["society_id"]
                        isOneToOne: false
                        referencedRelation: "societies"
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
                    created_by: string | null
                    id: string
                    name: string
                    pincode: string | null
                    settings: Json | null
                    state: string | null
                    total_units: number | null
                    updated_at: string | null
                }
                Insert: {
                    address?: string | null
                    city?: string | null
                    created_at?: string | null
                    created_by?: string | null
                    id?: string
                    name: string
                    pincode?: string | null
                    settings?: Json | null
                    state?: string | null
                    total_units?: number | null
                    updated_at?: string | null
                }
                Update: {
                    address?: string | null
                    city?: string | null
                    created_at?: string | null
                    created_by?: string | null
                    id?: string
                    name?: string
                    pincode?: string | null
                    settings?: Json | null
                    state?: string | null
                    total_units?: number | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            unit_residents: {
                Row: {
                    id: string
                    is_primary: boolean | null
                    joined_at: string | null
                    left_at: string | null
                    resident_type: string | null
                    unit_id: string | null
                    user_id: string | null
                }
                Insert: {
                    id?: string
                    is_primary?: boolean | null
                    joined_at?: string | null
                    left_at?: string | null
                    resident_type?: string | null
                    unit_id?: string | null
                    user_id?: string | null
                }
                Update: {
                    id?: string
                    is_primary?: boolean | null
                    joined_at?: string | null
                    left_at?: string | null
                    resident_type?: string | null
                    unit_id?: string | null
                    user_id?: string | null
                }
                Relationships: []
            }
            units: {
                Row: {
                    area_sqft: number | null
                    block_id: string | null
                    created_at: string | null
                    floor: number | null
                    id: string
                    is_occupied: boolean | null
                    owner_id: string | null
                    society_id: string | null
                    type: string | null
                    unit_number: string
                    updated_at: string | null
                }
                Insert: {
                    area_sqft?: number | null
                    block_id?: string | null
                    created_at?: string | null
                    floor?: number | null
                    id?: string
                    is_occupied?: boolean | null
                    owner_id?: string | null
                    society_id?: string | null
                    type?: string | null
                    unit_number: string
                    updated_at?: string | null
                }
                Update: {
                    area_sqft?: number | null
                    block_id?: string | null
                    created_at?: string | null
                    floor?: number | null
                    id?: string
                    is_occupied?: boolean | null
                    owner_id?: string | null
                    society_id?: string | null
                    type?: string | null
                    unit_number?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
            user_roles: {
                Row: {
                    assigned_at: string | null
                    assigned_by: string | null
                    id: string
                    is_active: boolean | null
                    role: Database["public"]["Enums"]["user_role"]
                    society_id: string | null
                    unit_id: string | null
                    user_id: string | null
                }
                Insert: {
                    assigned_at?: string | null
                    assigned_by?: string | null
                    id?: string
                    is_active?: boolean | null
                    role: Database["public"]["Enums"]["user_role"]
                    society_id?: string | null
                    unit_id?: string | null
                    user_id?: string | null
                }
                Update: {
                    assigned_at?: string | null
                    assigned_by?: string | null
                    id?: string
                    is_active?: boolean | null
                    role?: Database["public"]["Enums"]["user_role"]
                    society_id?: string | null
                    unit_id?: string | null
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
                    is_recurring: boolean | null
                    otp: string | null
                    otp_expires_at: string | null
                    purpose: string | null
                    qr_code: string | null
                    recurrence_pattern: string | null
                    society_id: string | null
                    status: Database["public"]["Enums"]["visitor_status"]
                    unit_id: string | null
                    updated_at: string | null
                    valid_until: string | null
                    vehicle_number: string | null
                    visitor_name: string
                    visitor_phone: string | null
                    visitor_photo_url: string | null
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
                    is_recurring?: boolean | null
                    otp?: string | null
                    otp_expires_at?: string | null
                    purpose?: string | null
                    qr_code?: string | null
                    recurrence_pattern?: string | null
                    society_id?: string | null
                    status?: Database["public"]["Enums"]["visitor_status"]
                    unit_id?: string | null
                    updated_at?: string | null
                    valid_until?: string | null
                    vehicle_number?: string | null
                    visitor_name: string
                    visitor_phone?: string | null
                    visitor_photo_url?: string | null
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
                    is_recurring?: boolean | null
                    otp?: string | null
                    otp_expires_at?: string | null
                    purpose?: string | null
                    qr_code?: string | null
                    recurrence_pattern?: string | null
                    society_id?: string | null
                    status?: Database["public"]["Enums"]["visitor_status"]
                    unit_id?: string | null
                    updated_at?: string | null
                    valid_until?: string | null
                    vehicle_number?: string | null
                    visitor_name?: string
                    visitor_phone?: string | null
                    visitor_photo_url?: string | null
                    visitor_type?: Database["public"]["Enums"]["visitor_type"]
                }
                Relationships: [
                    {
                        foreignKeyName: "visitors_unit_id_fkey"
                        columns: ["unit_id"]
                        isOneToOne: false
                        referencedRelation: "units"
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
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never