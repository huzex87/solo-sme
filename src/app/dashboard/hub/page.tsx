import Hub from '@/components/dashboard/Hub';

export const metadata = {
    title: 'Omnichannel Hub | SOLO',
    description: 'Manage all your customer conversations in one unified inbox.',
};

export default function HubPage() {
    return (
        <div style={{ height: 'calc(100vh - var(--topbar-height) - var(--space-2xl) * 2)' }}>
            <Hub />
        </div>
    );
}
