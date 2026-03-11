# SOLO SME — Institutional Commerce Platform

## Technical White Paper & Specification

### Revision: March 2026 (v3.0 - Status Standard)

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

### 4.2 Authentication

- **Institutional Auth**: Multi-modal authentication supporting Email/Password, Google OAuth, and Phone OTP.
- **V3.0 Access Control**: Hardened middleware ensuring only authorized sovereign actors can access the orchestration dashboard.

## 5. Design System: Status Standard (Institutional V3.0)

The **Status Standard** design system is the visual manifestation of institutional power and crystalline clarity.

- **Status Standard V2**: Hyper-neutral Zinc palette with subtle, ambient depth and high-precision spacing.
- **Precision Typography**: Rigorous 13px baseline with -0.03em tracking for all primary headers and labels.
- **Status Standard Navigation**: 16px icons and Zinc 950 active states for a focused, utility-first professional feel.
- **Fluid Micro-interactions**: Haptic-responsive feedback and smooth layout transitions for a premium "living" interface.

## 6. Implementation Milestones (Status Standard Launch)

- **Phase 58**: Minimalist SaaS Redesign (Cleanup and consolidation).
- **Phase 59**: Status Standard UI Refinement (V2 polish, Zinc palette, high-density data views).

---
*This document is a living specification and is updated with every architectural modification.*
