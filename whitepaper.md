# SOLO SME — Institutional Commerce Platform

## Technical White Paper & Specification

### Revision: March 2026 (v7.1 - Security Hardening & Pre-Launch Polish)

---

## 1. Executive Summary

SOLO SME is a world-class, institutional-grade commerce engine designed specifically for the next generation of African SMEs. Built on a "Digital First, Institutional Standard" philosophy, SOLO enables merchants to transition from fragmented social selling to a unified, scalable, and automated digital presence in under 30 seconds.

**v7.0** introduces a paradigm shift: merchants can now connect their Instagram Business and WhatsApp Business accounts to automatically sync products, pricing, and catalog data from their existing social media stores into SOLO — eliminating the cold-start problem entirely. Paired with a new Store Health Score, Express Checkout, Smart Reorder, and Revenue Goal system, the platform is now a complete merchant operating system.

## 2. Platform Philosophy

SOLO is not just a storefront builder; it is a **Vertical Operating System for SMEs**.

- **Institutional Standard**: Every component is designed to feel high-fidelity, professional, and reliable.
- **AI-Agentic Onboarding**: Automated catalog and branding generation using modern LLM agents.
- **Social Commerce Native**: Direct integration with Instagram Business and WhatsApp Business catalogs for zero-friction product import.
- **Status Standard V3 UI/UX**: A hyper-neutral Zinc palette, Linear-style sidebar precision, and Stripe-style data density for a world-class professional presence.
- **Merchant Simplicity**: Pure, jargon-free interfaces designed for immediate merchant comprehension.
- **Growth Intelligence**: Store Health Scoring, Revenue Goal Tracking, and Predictive Inventory to guide merchant success.

## 3. Architecture Overview

### 3.1 Tech Stack

The platform leverages a cutting-edge, high-performance stack:

- **Frontend**: Next.js 16+ (App Router) with React 19, built for speed and SEO.
- **Styling**: Tailwind CSS + Vanilla CSS with modern Design Tokens for "Status Standard" effects.
- **Backend-as-a-Service**: Supabase (PostgreSQL, Auth, Storage, Edge Functions).
- **Communication Layer**: Hybrid WhatsApp Orchestration (SOLO Managed + Sovereign Merchant Sync).
- **AI Engine**: Gemini 2.5 Flash for sales assistance, product extraction, and RAG engine grounding.
- **Social Commerce APIs**: Meta Graph API v19.0 (Instagram Business, WhatsApp Business, Commerce API).
- **Payment Processing**: Paystack + Flutterwave dual-provider architecture.
- **Observability**: Sentry (error tracking), PostHog (product analytics), Microsoft Clarity (session replay).

### 3.2 Tenant Architecture

SOLO uses a **Schema-Driven Multi-Tenancy** approach:

- Each merchant exists as a `tenant` in the institutional schema.
- Data is isolated using PostgreSQL **Row Level Security (RLS)**.
- Custom domain and subdomain routing is handled at the middleware layer.
- **Server-Safe Services**: Decoupled service architecture using dynamic imports to ensure build stability across Server/Client boundaries.
- **Social Account Bindings**: Each tenant can connect multiple social accounts (Instagram, WhatsApp Business) via the `social_accounts` table, enabling cross-platform product synchronization.

### 3.3 Service Architecture

The platform comprises 40+ specialized service modules:

| Layer | Services |
|-------|----------|
| **Core Commerce** | ProductService, OrderService, InventoryService, LedgerService, InvoiceService |
| **Customer Intelligence** | CustomerService, LoyaltyService, SegmentationService |
| **AI & Automation** | AminaIntelligence, AIContentService, AIAnalyticsService, IntentEngine, AutomationService |
| **Social Commerce** | SocialImportService, OnboardingService, WhatsAppService, WhatsAppCommandService |
| **Merchant Tools** | StoreHealthService, CampaignService, ReportService, FeedbackService |
| **Platform Infrastructure** | TenantService, AuthService, AuditService, DomainService, StorageService |
| **Payments & Finance** | PaymentService, FinanceService, TaxService, CurrencyService |
| **Logistics** | LogisticsService, DriverService, POSQueueService |

## 4. Security & Compliance

### 4.1 Data Hardening

- **Row Level Security (RLS)**: Mandatory on all tables. Data access is strictly compartmentalized by tenant ID.
- **Sovereign Encryption**: Metadata and critical identifiers are protected via platform-level encryption protocols.
- **Institutional RBAC**: Multi-tenant Role-Based Access Control enforced at the component level for granular staff permissions (owner, admin, manager, cashier, dispatcher, staff, analyst).
- **Content Security Policy**: Comprehensive CSP headers with strict default-src, script-src, and connect-src directives.
- **Security Headers**: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy enforced in middleware.

### 4.2 Authentication

- **Institutional Auth**: Multi-modal authentication supporting Email/Password, Google OAuth, and Phone OTP.
- **V3.0 Access Control**: Hardened middleware ensuring only authorized sovereign actors can access the orchestration dashboard.
- **Super Admin Isolation**: Middleware-level profile check for `/admin` routes ensuring `is_superadmin` flag verification.
- **OAuth Token Lifecycle**: Long-lived token exchange for Meta social account connections (60-day refresh cycle).

## 5. Design System: Status Standard (Institutional V3.0)

The **Status Standard** design system is the visual manifestation of institutional power and crystalline clarity.

- **Status Standard V3**: Hyper-neutral Zinc palette with subtle, ambient depth and high-precision spacing.
- **Precision Typography**: Rigorous 13px baseline with -0.03em tracking for all primary headers and labels. Outfit + Inter font stack.
- **Merchant Clarity**: Removal of all technical jargon (e.g., "API Keys" -> "Business Connector Keys") for a clean, cool, and premium experience.
- **Fluid Micro-interactions**: Haptic-responsive feedback and smooth layout transitions for a premium "living" interface.
- **Offline Resilience**: POS state persistence and local transaction queuing for uninterrupted institutional commerce.
- **32px Corner Radius System**: Card-level rounding at 32px for premium container feel, nested elements at 24px/16px/12px.
- **Shadow Hierarchy**: Three-tier shadow system (soft-sm, soft-md, premium) for depth without visual noise.

## 6. Institutional Feature Layers

### 6.1 Social Commerce Import Engine (NEW - v7.0)

The most significant addition to the platform. Merchants can now import their entire product catalog from social media in minutes.

#### 6.1.1 Instagram Business Integration

- **OAuth Flow**: Full Meta Graph API v19.0 OAuth with `instagram_basic`, `instagram_manage_insights`, `pages_show_list`, `catalog_management`, and `business_management` scopes.
- **Media Scraping**: Fetches recent Instagram posts (IMAGE + CAROUSEL_ALBUM) via the Instagram Graph API.
- **AI Product Extraction**: Each post is analyzed by Gemini 2.5 Flash to determine if it contains a product listing. The AI extracts: product name, description, price (NGN-aware), category, and confidence score.
- **Caption Fallback Parser**: Regex-based extraction for Nigerian price patterns (₦, NGN, N, naira, "15k") when AI is unavailable.
- **Category Detection**: Hashtag analysis against 7 category mappings (Fashion, Beauty, Electronics, Food, Home, Accessories, Health) with Nigerian commerce-specific keywords (ankara, adire, agbada, etc.).

#### 6.1.2 WhatsApp Business Catalog Import

- **WABA Integration**: Connects to WhatsApp Business Accounts via `whatsapp_business_management` and `whatsapp_business_messaging` scopes.
- **Commerce API**: Pulls product catalog items with name, description, price, currency, image URL, and availability status.
- **Automatic Mapping**: WhatsApp catalog `availability` maps to stock quantity (in_stock = 20, out_of_stock = 0).

#### 6.1.3 AI Magic Import (URL-based)

- **Universal Link Support**: Accepts Instagram, Facebook, TikTok, Twitter/X, or any website URL.
- **Gemini-Powered Generation**: AI infers brand niche from social handle and generates 4 diverse products with realistic Nigerian pricing, professional descriptions, and complementary branding colors.
- **Instant Store Scaffolding**: Generates business name, subdomain, branding palette, and product catalog in a single API call.

#### 6.1.4 Import Pipeline

```
Connect Account → OAuth Token Exchange → Long-lived Token →
Fetch Media/Catalog → AI Analysis → Product Extraction →
Merchant Review (editable) → Deduplication Check → Bulk Insert → Audit Log
```

- **Deduplication**: Name-based matching against existing catalog to prevent duplicates.
- **Multi-step Wizard UI**: Connect → Scanning (animated progress) → Review (inline editing) → Import → Complete.
- **Audit Trail**: Every import is logged with source, count, and timestamp.

### 6.2 Store Health Score (NEW - v7.0)

A comprehensive, real-time assessment of store readiness and optimization.

#### Scoring System

| Check | Weight | Pass Criteria |
|-------|--------|---------------|
| Payment Gateway | 3x | Paystack or Flutterwave secret key configured |
| Product Catalog | 3x | 3+ active products listed |
| Store Branding | 2x | Custom theme or logo configured |
| WhatsApp AI | 2x | AI sales assistant enabled |
| Sales Traction | 2x | 5+ orders received |
| Customer Base | 1x | 10+ customers acquired |
| SEO & Description | 1x | Meta title or store description set |
| Inventory Health | 1x | No low-stock alerts |

- **Weighted Score**: 0-100 calculated as `sum(score * weight) / sum(weights)`.
- **Letter Grade**: A+ (95+), A (85+), B (70+), C (55+), D (40+), F (<40).
- **Priority Action**: The highest-weight failing check is surfaced as the top recommendation with a direct action link.
- **Visual Indicators**: Animated score ring, color-coded grade badge, per-check pass/warn/fail icons.

### 6.3 Revenue Goal Tracker (NEW - v7.0)

Gamified revenue tracking to drive merchant engagement and retention.

- **7 Milestone Tiers**: First Sale (₦10K) → Rising Star (₦50K) → 100K Club → Half Million → Millionaire → Empire Builder (₦5M) → Legend (₦10M).
- **Custom Goals**: Merchants can set custom revenue targets with quick-set buttons (100K, 500K, 1M).
- **Celebration System**: Full-screen animated overlay when a milestone is achieved, with emoji, title, and amount.
- **Persistent State**: Goals and milestone progress stored in localStorage per-tenant.
- **Progress Visualization**: Animated progress bar with color transitions (blue → green → gold) based on completion percentage.

### 6.4 Express Checkout (NEW - v7.0)

Returning customer acceleration for higher conversion rates on repeat purchases.

- **Customer Memory**: After a successful checkout, customer name, email, phone, and delivery address are saved to localStorage (per-store subdomain).
- **One-Tap Apply**: Returning customers see a banner at checkout with "Use My Info" button that auto-fills all contact and delivery fields.
- **Privacy Controls**: Clear saved info button for data removal. No server-side PII storage.
- **Per-Store Isolation**: Data is scoped to each store's subdomain, preventing cross-store leakage.

### 6.5 Smart Reorder System (NEW - v7.0)

Intelligent repeat purchase suggestions to increase customer lifetime value.

- **Order History Memory**: After checkout, order items (name, price, quantity, image) are saved to localStorage.
- **Reorder Widget**: Appears on the cart page when a returning customer has past order history.
- **Granular Control**: "Reorder All" button for full previous order, plus individual item "+" buttons.
- **Order Context**: Shows last order date and total amount for reference.
- **Dismissible**: Customers can dismiss the widget if not interested.

### 6.6 Quick Actions Dashboard (NEW - v7.0)

Streamlined merchant workflow acceleration.

- **6 Core Actions**: Add Product, Import Store (social), Share Store, New Invoice, Campaign, Reports.
- **Smart Share**: Copies store URL to clipboard with toast notification. Uses Web Share API on mobile for native sharing.
- **Responsive Grid**: 3-column on mobile, 6-column on desktop. Each action has a branded icon with hover scale animation.

### 6.7 Data-Driven SME Insights

SOLO provides real-time ecosystem oversight through the **Tenant Directory** and **Analytics Engine**.

- **Real-time Stats**: Active vs. Setup Pending tracking based on business configuration (e.g., Paystack status).
- **Growth Deltas**: Automated period-over-period comparison for Revenue, Orders, AOV, and Customer Retention.
- **Predictive Inventory**: Stock runway calculation (days until stockout) with daily velocity analysis and CRITICAL/LOW/STABLE status classification.
- **Channel Performance**: Revenue and order breakdown by channel (online, WhatsApp, POS, marketplace).
- **Multi-format Export**: PDF (jsPDF with autoTable), CSV, and JSON export capabilities.
- **Dynamic Filtering**: Real-time business discovery and metadata management for platform administrators.

### 6.8 AI-Marketing & Automation Orchestration

The **AI Campaign Studio** and **Automation Lab** allow merchants to scale their business with zero technical friction.

- **Multi-Channel Precision**: Automated generation of Email, WhatsApp, SMS, and Social content.
- **Agentic Proactivity**: Naira-aware WhatsApp abandoned cart nudges and stock health alerts.
- **Hybrid Messaging**: SOLO-managed numbers for instant start, with optional merchant-sovereign keys for T2 scaling.
- **AI Content Generator**: SEO copy, product descriptions, and marketing copy powered by Gemini.
- **Campaign Studio**: Audience segmentation, A/B testing, and performance tracking.

### 6.9 Comprehensive Storefront System

- **Sovereign Storefronts**: Each tenant gets a fully branded storefront at `{subdomain}.solosme.ng` with custom domain support.
- **Multi-currency Support**: CurrencyService with real-time conversion (NGN, USD, GBP, EUR, GHS, KES).
- **Multi-language**: i18n support with locale-aware content delivery.
- **Tax Engine**: Configurable tax rules per tenant with automatic calculation at checkout.
- **Delivery System**: Real-time delivery fee calculation with distance-based pricing and multiple pickup locations.
- **Dual Checkout**: Online payment (Paystack/Flutterwave) + WhatsApp checkout for markets preferring chat-based transactions.

## 7. API Surface

### 7.1 REST Endpoints

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/ai/instagram-import` | POST | AI store generation from social URL |
| `/api/ai/social-product-extract` | POST | AI product extraction from social post |
| `/api/ai/store-assistant` | POST | Amina AI sales assistant |
| `/api/ai/content-generator` | POST | AI content generation |
| `/api/ai/copywriter` | POST | AI marketing copy |
| `/api/ai/marketing-campaign` | POST | Campaign generation |
| `/api/ai/recovery-email` | POST | Abandoned cart recovery |
| `/api/ai/rag-context` | POST | RAG-grounded store context |
| `/api/social/callback` | GET | Meta OAuth callback handler |
| `/api/payments/initialize` | POST | Payment session creation |
| `/api/payments/webhook` | POST | Payment confirmation |
| `/api/webhooks/paystack` | POST | Paystack webhook |
| `/api/webhooks/flutterwave` | POST | Flutterwave webhook |
| `/api/webhooks/whatsapp` | POST/GET | WhatsApp webhook (verify + messages) |
| `/api/webhooks/meta-messaging` | POST | Meta unified messaging |
| `/api/webhooks/courier` | POST | Delivery status updates |
| `/api/admin/health` | GET | Platform health check |
| `/api/email` | POST | Transactional email dispatch |
| `/api/chat` | POST | Real-time chat messaging |

### 7.2 Webhook Architecture

```
Meta Platform → /api/webhooks/whatsapp → TenantService.getTenantByMetaId()
    → WhatsAppCommandService (command parsing)
    → IntentEngine (NLP intent classification)
    → AminaIntelligence (RAG-grounded response)
    → WhatsAppService (reply dispatch)
```

## 8. Database Schema Overview

### Core Tables

| Table | Purpose | RLS |
|-------|---------|-----|
| `tenants` | Merchant configuration, branding, business settings | Yes |
| `profiles` | User accounts with role and tenant binding | Yes |
| `products` | Product catalog with SKU, barcode, variants | Yes |
| `orders` | Order lifecycle with multi-channel tracking | Yes |
| `customers` | Customer CRM with spend tracking | Yes |
| `social_accounts` | Connected Instagram/WhatsApp Business accounts | Yes |
| `whatsapp_accounts` | Sovereign WhatsApp API credentials | Yes |
| `whatsapp_phone_bindings` | Phone-to-tenant routing | Yes |
| `inventory_movements` | Stock change audit trail | Yes |
| `financial_ledger` | Double-entry financial records | Yes |
| `loyalty_points` | Customer loyalty program | Yes |
| `audit_logs` | Business activity audit trail | Yes |
| `tax_rules` | Per-tenant tax configuration | Yes |
| `store_locations` | Physical pickup locations | Yes |
| `campaigns` | Marketing campaign records | Yes |
| `blog_posts` | Storefront blog content | Yes |

## 9. Implementation Milestones

- **Phase 90**: Public Launch Hardening (SMS integration, POS offline state persistence, Institutional RBAC enforcement, Secure Signup Bootstrapping, Gemini 2.0 cutover).
- **Phase 91**: AI Sales Agent Hardening (Amina AI Tenant-Aware RAG Engine, Glassmorphism UI Polish).
- **Phase 92**: Proactive Commerce Automation (Naira-aware WhatsApp Abandoned Cart Nudges, Multi-tenant Credential Orchestration, Simplicity UI Refinement, Build Stability/Server-Safe Service Hardening [COMPLETED]).
- **Phase 93**: Sovereign WhatsApp Integration (Merchant-owned Meta App configuration guidance, credential persistence hardening, and Amina AI handover [COMPLETED]).
- **Phase 94**: Social Commerce & Merchant Intelligence (Instagram Business import, WhatsApp Business catalog sync, Store Health Score, Express Checkout, Smart Reorder, Revenue Goal Tracker, Quick Actions dashboard [COMPLETED]).
- **Phase 95**: Pre-Launch Hardening (15 critical/high/medium security fixes, CSRF/XSS mitigation, hardened RLS policies, and dependency auditing [COMPLETED]).
- **Phase 96 (Planned)**: Marketplace & Discovery (Cross-tenant product discovery, merchant directory, featured stores, customer reviews and ratings).
- **Phase 96 (Planned)**: Mobile App & PWA (Native-feel PWA with push notifications, offline catalog browsing, barcode scanner, and driver delivery tracking).
- **Phase 97 (Planned)**: Financial Services (Merchant lending, invoice factoring, expense tracking, profit/loss reporting, tax filing assistance).

## 10. Environment Configuration

```env
# --- Supabase ---
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# --- AI Engine ---
GEMINI_API_KEY=your_gemini_api_key

# --- Meta Platform (Instagram & WhatsApp Business) ---
NEXT_PUBLIC_META_APP_ID=your_meta_app_id
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret

# --- WhatsApp Business API ---
WHATSAPP_API_BASE=https://graph.facebook.com/v20.0
WHATSAPP_ACCESS_TOKEN=your_whatsapp_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_id
WABA_ID=your_waba_id
WHATSAPP_APP_SECRET=your_app_secret
WHATSAPP_WEBHOOK_VERIFY_TOKEN=solo_sme_webhook_secret_2026

# --- Payment Providers ---
PAYSTACK_SECRET_KEY=your_paystack_secret
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret
FLUTTERWAVE_SECRET_HASH=your_flutterwave_hash

# --- Observability ---
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# --- Redis (Rate Limiting) ---
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# --- App ---
NEXT_PUBLIC_APP_URL=https://app.solosme.ng
```

## 11. File Count & Codebase Metrics

| Category | Count |
|----------|-------|
| Services | 40+ |
| Pages (Routes) | 35+ |
| Components | 55+ |
| API Routes | 18 |
| Tests | 6 |
| Total Source Files | 180+ |

---

*This document is a living specification and is updated with every architectural modification. Last updated: March 20, 2026, Phase 95 (Security Hardening & Pre-Launch Polish).*
