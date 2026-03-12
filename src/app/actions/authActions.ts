'use server';

import { AuthService } from '@/services/authService';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export async function signInAction(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'Email and password are required.' };
    }

    try {
        // We use the existing AuthService logic, which includes rate limiting
        // Since this runs on the server, Upstash environment variables are available
        const { data, error } = await AuthService.signIn(email, password);

        if (error) {
            return { error: error.message };
        }

        return { success: true, user: data.user };
    } catch (err: any) {
        return { error: err.message || 'An unexpected error occurred.' };
    }
}

export async function signUpAction(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const businessName = formData.get('businessName') as string;
    const subdomain = formData.get('subdomain') as string;
    const fullName = formData.get('fullName') as string;

    if (!email || !password || !businessName || !subdomain || !fullName) {
        return { error: 'All fields are required.' };
    }

    try {
        const { data, error } = await AuthService.signUp(
            email,
            password,
            businessName,
            subdomain,
            fullName
        );

        if (error) {
            return { error: error.message };
        }

        return { success: true, user: data.user, tenant_id: data.tenant_id };
    } catch (err: any) {
        return { error: err.message || 'An unexpected error occurred.' };
    }
}
