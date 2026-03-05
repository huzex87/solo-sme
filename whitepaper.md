# SOLO SME — Institutional Commerce Platform

## Technical White Paper & Specification

### Revision: March 2026 (v2.0)

---

## 1. Executive Summary

SOLO SME is a world-class, institutional-grade commerce engine designed specifically for the next generation of African SMEs. Built on a "Digital First, Institutional Standard" philosophy, SOLO enables merchants to transition from fragmented social selling (WhatsApp, Instagram) to a unified, scalable, and automated digital presence in under 30 seconds.

## 2. Platform Philosophy

SOLO is not just a storefront builder; it is a **Vertical Operating System for SMEs**.

- **Institutional Standard**: Every component is designed to feel high-fidelity, professional, and reliable.
- **AI-Agentic Onboarding**: Automated catalog and branding generation using modern LLM agents.
- **Omnichannel Core**: Unified inventory and orders across Web, POS, and Social Messaging.

## 3. Architecture Overview

### 3.1 Tech Stack

The platform leverages a cutting-edge, high-performance stack:

- **Frontend**: Next.js (App Router) with React, built for speed and SEO.
- **Backend-as-a-Service**: Supabase (PostgreSQL, Auth, Storage, Edge Functions).
- **Communication Layer**: Real-time subscriptions for order syncing and inventory updates.
- **AI Engine**: Proprietary integration for social media catalog extraction and sales assistance.

### 3.2 Tenant Architecture

SOLO uses a **Schema-Driven Multi-Tenancy** approach:

- Each merchant exists as a `tenant` in the institutional schema.
- Data is isolated using PostgreSQL **Row Level Security (RLS)**.
- Custom domain and subdomain routing is handled at the middleware layer.

## 4. Security & Compliance

### 4.1 Data Hardening

- **Row Level Security (RLS)**: Mandatory on all tables. Developers cannot query data without a valid session corresponding to the tenant.
- **Schema Granularity**: High-precision GRANT/REVOKE policies ensure that even the `authenticated` role has the minimum necessary privileges.

### 4.2 Authentication

- **Institutional Auth**: Multi-modal authentication supporting Email/Password, Google OAuth, and Phone OTP (Secure SMS).
- **Token Management**: JWT-based session handling with secure cookie storage.

## 5. Design System: Sovereignty 2026

The **Sovereign** design system is the visual manifestation of institutional power.

- **Atmosphere**: Deep Obsidian surfaces, glassmorphism, and high-contrast typography (Outfit/Inter).
- **Interaction**: Smooth micro-animations, nebula-inspired background effects, and intuitive state transitions.
- **Accessibility**: High-legibility contrast ratios and responsive layouts across all device classes.

## 6. Implementation Milestones (Recent)

- **Phase 12**: DB Permission Hardening & Security Audit.
- **Phase 13**: Institutional Social Authentication (Google OAuth + Secure Phone OTP).
- **Phase 14**: AI Social Media Catalog Import (Direct Instagram/Web Extraction).
- **Phase 15**: Global Design System Pass (Sovereign Radiant Glow + Nebula Backgrounds).
- **Phase 16**: Real-time Settings Preview & Multi-device Layout Hardening.
- **Phase 17**: Institutional Growth Engine (Exit-Intent Popups & Marketing Lead Infrastructure).

---
*This document is a living specification and is updated with every architectural modification.*
