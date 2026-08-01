/**
 * Hand-maintained database types mirroring supabase/migrations. Regenerate with
 * `supabase gen types typescript` once the Supabase CLI is wired into CI; until
 * then keep this in sync with the SQL migrations.
 */

export type AppLocale = "en" | "fr";
export type CurrencyCode = "CAD" | "USD" | "EUR";
export type VatMode = "ht" | "ttc";
export type WorkspacePlan = "trialing" | "pro" | "studio" | "locked";
export type MembershipRole = "owner" | "member";
export type BaseUnit = "g" | "ml" | "unit";
export type RecipeType = "dish" | "sub_recipe";
export type RecipeCostStatus = "green" | "orange" | "red" | "no_price";
export type PriceSource = "manual" | "csv_import";
export type ExportKind = "recipe_book" | "profitability" | "catalog" | "tech_sheet_pdf";
export type ExportStatus = "pending" | "processing" | "ready" | "failed";
export type TicketStatus = "open" | "pending" | "resolved";
export type TicketPriority = "low" | "normal" | "high" | "urgent";
export type TicketAuthor = "user" | "admin";
export type AnnouncementLevel = "info" | "warning";

interface Table<Row, Insert = Partial<Row>, Update = Partial<Row>> {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
}

export type ProfileRow = {
  id: string;
  full_name: string | null;
  locale: AppLocale;
  is_platform_admin: boolean;
  created_at: string;
}

export type WorkspaceRow = {
  id: string;
  name: string;
  currency: CurrencyCode;
  locale: AppLocale;
  target_food_cost_pct: number;
  vat_mode: VatMode;
  trial_ends_at: string;
  plan: WorkspacePlan;
  owner_id: string;
  created_at: string;
  deleted_at: string | null;
}

export type MembershipRow = {
  workspace_id: string;
  user_id: string;
  role: MembershipRole;
  created_at: string;
}

export type IngredientRow = {
  id: string;
  workspace_id: string;
  name: string;
  supplier_name: string | null;
  purchase_qty: number;
  purchase_unit: string;
  purchase_price_cents: number;
  base_unit: BaseUnit;
  density_or_unit_weight: number | null;
  yield_pct: number;
  allergens: string[];
  is_sample: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export type RecipeRow = {
  id: string;
  workspace_id: string;
  name: string;
  category: string | null;
  type: RecipeType;
  portions: number;
  menu_price_cents: number | null;
  photo_url: string | null;
  prep_steps: unknown;
  yield_qty: number | null;
  yield_unit: string | null;
  yield_base_unit: BaseUnit | null;
  is_sample: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export type IngredientPriceHistoryRow = {
  id: string;
  ingredient_id: string;
  price_cents: number;
  recorded_at: string;
  source: PriceSource;
}

export type RecipeItemRow = {
  id: string;
  recipe_id: string;
  ingredient_id: string | null;
  sub_recipe_id: string | null;
  qty: number;
  unit: string;
  position: number;
}

export type RecipeCostCacheRow = {
  recipe_id: string;
  total_cost_cents: number;
  cost_per_portion_cents: number;
  food_cost_pct: number | null;
  margin_cents: number | null;
  status: RecipeCostStatus;
  computed_at: string;
}

export type SubscriptionRow = {
  workspace_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string | null;
  price_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  updated_at: string;
}

export type MarketingLeadRow = {
  id: string;
  email: string;
  source: string;
  locale: AppLocale;
  created_at: string;
}

export type AlertRow = {
  id: string;
  workspace_id: string;
  recipe_id: string;
  type: "threshold_crossed";
  old_pct: number | null;
  new_pct: number | null;
  triggered_by_ingredient_id: string | null;
  created_at: string;
  acknowledged_at: string | null;
}

export type ExportsLogRow = {
  id: string;
  workspace_id: string;
  user_id: string | null;
  kind: ExportKind;
  file_path: string | null;
  status: ExportStatus;
  created_at: string;
}

export type StripeWebhookEventRow = {
  id: string;
  type: string;
  processed_at: string;
  payload: unknown;
}

export type SupportTicketRow = {
  id: string;
  workspace_id: string | null;
  user_id: string | null;
  email: string;
  subject: string;
  body: string;
  category: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  assigned_admin_id: string | null;
  product_gap: boolean;
  created_at: string;
  updated_at: string;
}

export type SupportMessageRow = {
  id: string;
  ticket_id: string;
  author: TicketAuthor;
  admin_id: string | null;
  body: string;
  created_at: string;
}

export type AuditLogRow = {
  id: string;
  actor_user_id: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  meta: Record<string, unknown>;
  created_at: string;
}

export type AnnouncementRow = {
  id: string;
  title: string;
  body: string;
  level: AnnouncementLevel;
  active: boolean;
  locale: AppLocale | null;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

export type OpsCronRunRow = {
  id: string;
  last_run_at: string;
  last_status: string;
  last_meta: Record<string, unknown>;
}

export interface Database {
  public: {
    Tables: {
      profiles: Table<ProfileRow>;
      workspaces: Table<WorkspaceRow>;
      memberships: Table<MembershipRow>;
      ingredients: Table<IngredientRow>;
      ingredient_price_history: Table<IngredientPriceHistoryRow>;
      recipes: Table<RecipeRow>;
      recipe_items: Table<RecipeItemRow>;
      recipe_cost_cache: Table<RecipeCostCacheRow>;
      subscriptions: Table<SubscriptionRow>;
      marketing_leads: Table<MarketingLeadRow>;
      alerts: Table<AlertRow>;
      exports_log: Table<ExportsLogRow>;
      stripe_webhook_events: Table<StripeWebhookEventRow>;
      support_tickets: Table<SupportTicketRow>;
      support_messages: Table<SupportMessageRow>;
      audit_log: Table<AuditLogRow>;
      announcements: Table<AnnouncementRow>;
      ops_cron_runs: Table<OpsCronRunRow>;
    };
    // Empty object types (not Record<string, never>): an index signature here
    // would intersect with Tables and collapse every table type to `never`.
    Views: NonNullable<unknown>;
    Functions: NonNullable<unknown>;
    Enums: NonNullable<unknown>;
    CompositeTypes: NonNullable<unknown>;
  };
}
