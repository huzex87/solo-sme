# SOLO SME — Institutional Commerce Platform

## Technical White Paper & Specification

### Revision: March 2026 (v6.0 - Institutional Launch Standard)

---

## 1. Executive Summary

SOLO SME is a world-class, institutional-grade commerce engine designed specifically for the next generation of African SMEs. Built on a "Digital First, Institutional Standard" philosophy, SOLO enables merchants to transition from fragmented social selling to a unified, scalable, and automated digital presence in under 30 seconds.

## 2. Platform Philosophy

SOLO is not just a storefront builder; it is a **Vertical Operating System for SMEs**.

- **Institutional Standard**: Every component is designed to feel high-fidelity, professional, and reliable.
- **AI-Agentic Onboarding**: Automated catalog and branding generation using modern LLM agents.
- **Status Standard V3 UI/UX**: A hyper-neutral Zinc palette, Linear-style sidebar precision, and Stripe-style data density for a world-class professional presence.
- **Merchant Simplicity**: Pure, jargon-free interfaces designed for immediate merchant comprehension.

## 3. Architecture Overview

### 3.1 Tech Stack

The platform leverages a cutting-edge, high-performance stack:

- **Frontend**: Next.js 16+ (App Router) with React 19, built for speed and SEO.
- **Styling**: Vanilla CSS with modern Design Tokens for "Status Standard" effects.
- **Backend-as-a-Service**: Supabase (PostgreSQL, Auth, Storage, Edge Functions).
- **Communication Layer**: Hybrid WhatsApp Orchestration (SOLO Managed + Sovereign Merchant Sync).
- **AI Engine**: Gemini 2.0 Flash for sales assistance and RAG engine grounding.

### 3.2 Tenant Architecture

SOLO uses a **Schema-Driven Multi-Tenancy** approach:

- Each merchant exists as a `tenant` in the institutional schema.
- Data is isolated using PostgreSQL **Row Level Security (RLS)**.
- Custom domain and subdomain routing is handled at the middleware layer.
- **Server-Safe Services**: Decoupled service architecture using dynamic imports to ensure build stability across Server/Client boundaries.

## 4. Security & Compliance

### 4.1 Data Hardening

- **Row Level Security (RLS)**: Mandatory on all tables. Data access is strictly compartmentalized by tenant ID.
- **Sovereign Encryption**: Metadata and critical identifiers are protected via platform-level encryption protocols.
- **Institutional RBAC**: Multi-tenant Role-Based Access Control enforced at the component level for granular staff permissions.

### 4.2 Authentication

- **Institutional Auth**: Multi-modal authentication supporting Email/Password, Google OAuth, and Phone OTP.
- **V3.0 Access Control**: Hardened middleware ensuring only authorized sovereign actors can access the orchestration dashboard.

## 5. Design System: Status Standard (Institutional V3.0)

The **Status Standard** design system is the visual manifestation of institutional power and crystalline clarity.

- **Status Standard V3**: Hyper-neutral Zinc palette with subtle, ambient depth and high-precision spacing.
- **Precision Typography**: Rigorous 13px baseline with -0.03em tracking for all primary headers and labels.
- **Merchant Clarity**: Removal of all technical jargon (e.g., "API Keys" -> "Business Connector Keys") for a clean, cool, and premium experience.
- **Fluid Micro-interactions**: Haptic-responsive feedback and smooth layout transitions for a premium "living" interface.
- **Offline Resilience**: POS state persistence and local transaction queuing for uninterrupted institutional commerce.

## 6. Institutional Feature Layers

### 6.1 Data-Driven SME Insights

SOLO provides real-time ecosystem oversight through the **Tenant Directory** and **Analytics Engine**.

- **Real-time Stats**: Active vs. Setup Pending tracking based on business configuration (e.g., Paystack status).
- **Growth Deltas**: Automated period-over-period comparison for Revenue, Orders, and Customer Retention.
- **Dynamic Filtering**: Real-time business discovery and metadata management for platform administrators.

### 6.2 AI-Marketing & Automation Orchestration

The **AI Campaign Studio** and **Automation Lab** allow merchants to scale their business with zero technical friction.

- **Multi-Channel Precision**: Automated generation of Email, WhatsApp, SMS, and Social content.
- **Agentic Proactivity**: Naira-aware WhatsApp abandoned cart nudges and stock health alerts.
- **Hybrid Messaging**: SOLO-managed numbers for instant start, with optional merchant-sovereign keys for T2 scaling.

## 7. Implementation Milestones

- **Phase 90**: Public Launch Hardening (SMS integration, POS offline state persistence, Institutional RBAC enforcement, Secure Signup Bootstrapping, Gemini 2.0 cutover).
- **Phase 91**: AI Sales Agent Hardening (Amina AI Tenant-Aware RAG Engine, Glassmorphism UI Polish).
- **Phase 92**: Proactive Commerce Automation (Naira-aware WhatsApp Abandoned Cart Nudges, Multi-tenant Credential Orchestration, Simplicity UI Refinement, Build Stability/Server-Safe Service Hardening [COMPLETED]).
- **Phase 93**: Sovereign WhatsApp Integration (Merchant-owned Meta App configuration guidance, credential persistence hardening, and Amina AI handover [COMPLETED]).

---
*This document is a living specification and is updated with every architectural modification.*

--- WhatsApp Business API ---
WHATSAPP_API_BASE=<https://graph.facebook.com/v20.0>
WHATSAPP_ACCESS_TOKEN=your_whatsapp_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_id
WABA_ID=your_waba_id
WHATSAPP_APP_SECRET=your_app_secret
WHATSAPP_WEBHOOK_VERIFY_TOKEN=solo_sme_webhook_secret_2026
