import { type PuckComponentConfig } from '@finqu/storefront-sdk';

interface HeroProps {
    title: string;
    subtitle: string;
}

export const category = 'Marketing';

export const config: PuckComponentConfig<HeroProps> = {
    label: 'Hero Banner',
    fields: {
        title: {
            type: 'text',
            label: 'Title',
        },
        subtitle: {
            type: 'textarea',
            label: 'Subtitle',
        },
    },
    defaultProps: {
        title: 'Welcome',
        subtitle: 'Add your subtitle here',
    },
    render: ({ title, subtitle }) => (
        <section
            style={{
                padding: '4rem 2rem',
                textAlign: 'center',
                backgroundColor: '#f5f5f5',
            }}
        >
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{title}</h1>
            <p style={{ fontSize: '1.25rem', color: '#666' }}>{subtitle}</p>
        </section>
    ),
};
