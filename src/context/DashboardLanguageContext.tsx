'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ha';

interface DashboardLanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const DashboardLanguageContext = createContext<DashboardLanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
    en: {
        // Sidebar / Navigation Group Labels
        "My Shop": "My Shop",
        "Growth": "Growth",
        "System": "System Settings",
        "Public Store": "Public Store",
        "View Store": "View Store",
        "Free Plan": "Free Plan",

        // Sidebar Items
        "WhatsApp AI": "WhatsApp AI Assistant",
        "Social Import": "Social Import",
        "Overview": "Overview",
        "Products": "Products",
        "Orders": "Orders",
        "Point of Sale (POS)": "POS Sale",
        "Reports": "Analytics Reports",
        "Marketing Hub": "Marketing Hub",
        "Customers": "Customers",
        "Settings": "Settings",
        "Help Center": "Help Center",
        "Log Out": "Log Out",

        // Topbar
        "Account Settings": "Account Settings",
        "Preferences": "Preferences",
        "Sign Out": "Sign Out",
        "Signing out...": "Signing out...",

        // Overview / Dashboard Main Page
        "welcome_back": "Welcome back",
        "sales_summary": "Here's what is happening with your store today.",
        "Good morning": "Good morning",
        "Good afternoon": "Good afternoon",
        "Good evening": "Good evening",
        "Total Sales": "Total Sales",
        "Total Orders": "Total Orders",
        "Active Customers": "Active Customers",
        "Low Stock Items": "Low Stock Items",
        "Recent Orders": "Recent Orders",
        "Avg. Order": "Avg. Order",
        "Retention": "Retention",
        "view_all": "View All",
        "Sales Over Time": "Sales Over Time",
        "Customer Growth": "Customer Growth",
        "Quick Actions": "Quick Actions",
        "Add Product": "Add Product",
        "Record Sale": "Record POS Sale",
        "Low Stock Alerts": "Low Stock Alerts",
        "items": "items",
        "order": "order",
        "orders": "orders",
        "amount": "amount",
        "status": "status",
        "customer": "customer",
        "date": "date",

        // POS
        "Access Denied": "Access Denied",
        "Pay & Finish": "Pay & Finish",
        "Processing...": "Processing...",
        "Search Products": "Search Products...",
        "payment_method": "PAYMENT METHOD",
        "CASH": "CASH",
        "CARD": "CARD",
        "BANK": "BANK",
        "Total": "Total",
        "Sales Tax": "Sales Tax",
        "Loyalty Discount": "Loyalty Discount",
        "Sale Complete!": "Sale Complete!",
        "Receipt": "Receipt",

        // General
        "submit": "Submit",
        "cancel": "Cancel",
        "loading": "Loading...",
        "search": "Search...",
        "no_data": "No records found"
    },
    ha: {
        // Sidebar / Navigation Group Labels
        "My Shop": "Gudanar da Shago",
        "Growth": "Bunƙasa Kasuwanci",
        "System": "Tsarukan Shago",
        "Public Store": "Shagon Intanet",
        "View Store": "Duba Shago",
        "Free Plan": "Tsarin Kyauta",

        // Sidebar Items
        "WhatsApp AI": "Mataimakin WhatsApp AI",
        "Social Import": "Shigo da Kaya",
        "Overview": "Bayanin Shafi",
        "Products": "Kayayyaki",
        "Orders": "Ododi",
        "Point of Sale (POS)": "Siyar POS",
        "Reports": "Kidayar Rahoto",
        "Marketing Hub": "Cibiyar Talla",
        "Customers": "Abokan Ciniki",
        "Settings": "Saituna",
        "Help Center": "Taimako",
        "Log Out": "Fita",

        // Topbar
        "Account Settings": "Saitunana",
        "Preferences": "Zabuka",
        "Sign Out": "Fita Shafi",
        "Signing out...": "Ana fita...",

        // Overview / Dashboard Main Page
        "welcome_back": "Barka da dawowa",
        "sales_summary": "Ga abubuwan da ke faruwa a shagonka yau.",
        "Good morning": "Ina kwana",
        "Good afternoon": "Barka da rana",
        "Good evening": "Barka da yamma",
        "Total Sales": "Jimillar Siyarwa",
        "Total Orders": "Jimillar Ododi",
        "Active Customers": "Abokan Ciniki Masu Mu'amala",
        "Low Stock Items": "Kayan da Suka Rage",
        "Recent Orders": "Ododi na Kusa",
        "Avg. Order": "Matsakaicin Siyarwa",
        "Retention": "Abokan Ciniki Masu Dawowa",
        "view_all": "Duba Duka",
        "Sales Over Time": "Siyarwa a Hankali",
        "Customer Growth": "Ƙaruwar Abokan Ciniki",
        "Quick Actions": "Ayyuka na Sauri",
        "Add Product": "Ƙara Kaya",
        "Record Sale": "Rikodi Siyarwa",
        "Low Stock Alerts": "Gargaɗin Kayan da Suka Rage",
        "items": "kayayyaki",
        "order": "oda",
        "orders": "ododi",
        "amount": "adadi",
        "status": "yanayi",
        "customer": "abokin ciniki",
        "date": "kwanan wata",

        // POS
        "Access Denied": "Babu Izini",
        "Pay & Finish": "Biya & Kammala",
        "Processing...": "Ana kan yi...",
        "Search Products": "Nemi Kaya...",
        "payment_method": "HANYAR BIYA",
        "CASH": "TSARI TSABA",
        "CARD": "KATI",
        "BANK": "TURAWA",
        "Total": "Jimla",
        "Sales Tax": "Kudin Haraji",
        "Loyalty Discount": "Rauki na Points",
        "Sale Complete!": "An Kammala Siyarwa!",
        "Receipt": "Rasit",

        // General
        "submit": "Tura",
        "cancel": "Soke",
        "loading": "Ana kan yi...",
        "search": "Nemo...",
        "no_data": "Babu bayanai da aka samu"
    }
};

export function DashboardLanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('dashboard-lang') as Language;
            if (saved === 'en' || saved === 'ha') {
                setLanguageState(saved);
            }
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        if (typeof window !== 'undefined') {
            localStorage.setItem('dashboard-lang', lang);
        }
    };

    const t = (key: string): string => {
        const langPack = translations[language];
        return langPack[key] || translations['en'][key] || key;
    };

    return (
        <DashboardLanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </DashboardLanguageContext.Provider>
    );
}

export function useDashboardLanguage() {
    const context = useContext(DashboardLanguageContext);
    if (!context) {
        throw new Error('useDashboardLanguage must be used within a DashboardLanguageProvider');
    }
    return context;
}
