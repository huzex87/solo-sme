import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    fullName: z.string().min(2, 'Full name is too short'),
    businessName: z.string().min(2, 'Business name is too short'),
});

export const productSchema = z.object({
    name: z.string().min(2, 'Product name is too short'),
    description: z.string().optional(),
    price: z.number().min(0, 'Price cannot be negative'),
    category: z.string().min(1, 'Category is required'),
    stock_quantity: z.number().int().min(0, 'Stock cannot be negative'),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    weight: z.number().min(0, 'Weight cannot be negative').optional(),
    is_featured: z.boolean().default(false),
});

export const settingsSchema = z.object({
    fullName: z.string().min(2, 'Full name is too short'),
    email: z.string().email('Invalid email address'),
    paystackPublicKey: z.string().startsWith('pk_', 'Invalid Paystack Public Key').optional().or(z.literal('')),
    paystackSecretKey: z.string().startsWith('sk_', 'Invalid Paystack Secret Key').optional().or(z.literal('')),
});
