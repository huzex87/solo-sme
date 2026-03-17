# SOLO SME — Institutional Commerce Platform

## Technical White Paper & Specification

### Revision: March 2026 (v5.0 - Closed Beta Audit Standard)

---

## 1. Executive Summary

SOLO SME is a world-class, institutional-grade commerce engine designed specifically for the next generation of African SMEs. Built on a "Digital First, Institutional Standard" philosophy, SOLO enables merchants to transition from fragmented social selling to a unified, scalable, and automated digital presence in under 30 seconds.

## 2. Platform Philosophy

SOLO is not just a storefront builder; it is a **Vertical Operating System for SMEs**.

- **Institutional Standard**: Every component is designed to feel high-fidelity, professional, and reliable.
- **AI-Agentic Onboarding**: Automated catalog and branding generation using modern LLM agents.
- **Status Standard V2 UI/UX**: A hyper-neutral Zinc palette, Linear-style sidebar precision, and Stripe-style data density for a world-class professional presence.

## 3. Architecture Overview

### 3.1 Tech Stack

The platform leverages a cutting-edge, high-performance stack:

- **Frontend**: Next.js 15+ (App Router) with React 19, built for speed and SEO.
- **Styling**: Tailwind CSS with modern Design Tokens for "Status Standard" effects.
- **Backend-as-a-Service**: Supabase (PostgreSQL, Auth, Storage, Edge Functions).
- **Communication Layer**: Real-time Webhook orchestration for WhatsApp AI nodes.
- **AI Engine**: Gemini 2.0 Flash for sales assistance and RAG engine grounding.

### 3.2 Tenant Architecture

SOLO uses a **Schema-Driven Multi-Tenancy** approach:

- Each merchant exists as a `tenant` in the institutional schema.
- Data is isolated using PostgreSQL **Row Level Security (RLS)**.
- Custom domain and subdomain routing is handled at the middleware layer.

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

- **Status Standard V2**: Hyper-neutral Zinc palette with subtle, ambient depth and high-precision spacing.
- **Precision Typography**: Rigorous 13px baseline with -0.03em tracking for all primary headers and labels.
- **Status Standard Navigation**: 16px icons and Zinc 950 active states for a focused, utility-first professional feel.
- **Fluid Micro-interactions**: Haptic-responsive feedback and smooth layout transitions for a premium "living" interface.
- **Offline Resilience**: POS state persistence and local transaction queuing for uninterrupted institutional commerce.

## 6. Institutional Feature Layers

### 6.1 Data-Driven SME Insights

SOLO provides real-time ecosystem oversight through the **Tenant Directory** and **Analytics Engine**.

- **Real-time Stats**: Active vs. Setup Pending tracking based on business configuration (e.g., Paystack status).
- **Growth Deltas**: Automated period-over-period comparison for Revenue, Orders, and Customer Retention.
- **Dynamic Filtering**: Real-time business discovery and metadata management for platform administrators.

### 6.2 AI-Marketing Orchestration

The **AI Campaign Studio** allows merchants to generate and broadcast world-class marketing content in seconds.

- **Multi-Channel Precision**: Automated generation of Email, WhatsApp, SMS, and Social content.
- **High-Fidelity Previews**: A premium WhatsApp-native preview shell ensuring merchants see exactly what their customers see.
- **Agentic Formatting**: AI-driven formatting (bolding, emojis) tailored for high-conversion WhatsApp broadcasts.

## 7. Implementation Milestones (Status Standard Launch)

- **Phase 61**: Closed Beta Dashboard Refinement (Official brand colors, terminology cleanup).
- **Phase 62**: Real-time Ecosystem Oversight & Analytics (Dynamic Tenant Directory, hardcoded value removal).
- **Phase 63**: AI Marketing Studio Enhancement (WhatsApp high-fidelity preview, channel-specific orchestration).
- **Phase 88**: Automated Logistics & Financial Sovereignty (Courier Webhooks, Institutional Refund flow, Ledger integration).
- **Phase 89**: Proactive Onboarding Wizard (Amina AI Empty State detection, guided store setup).
- **Phase 90**: Public Launch Hardening (SMS integration, POS offline state persistence [COMPLETED], Institutional RBAC enforcement [COMPLETED], Secure Signup Bootstrapping [COMPLETED], Gemini 2.0 cutover).
- **Phase 91**: AI Sales Agent Hardening (Amina AI Tenant-Aware RAG Engine, Glassmorphism UI Polish [COMPLETED]).
- **Phase 92**: Proactive Commerce Automation (Naira-aware WhatsApp Abandoned Cart Nudges, Multi-tenant Credential Orchestration [COMPLETED]).

---
*This document is a living specification and is updated with every architectural modification.*
