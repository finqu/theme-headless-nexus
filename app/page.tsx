import { Render } from '@puckeditor/core';
import { config } from '@/.storefront/puck.config';

// Example: In a real app, this would come from your CMS/database
const exampleData = {
    root: {},
    content: [
        {
            type: 'Hero',
            props: {
                id: 'hero-1',
                title: 'Welcome to your storefront',
                subtitle: 'Built with Finqu SDK, Puck, and Next.js',
            },
        },
    ],
};

export default function HomePage() {
    return <Render config={config} data={exampleData} />;
}
