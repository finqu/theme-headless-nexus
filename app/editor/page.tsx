'use client';

import { Puck, type Data } from '@puckeditor/core';
import { config } from '@/.storefront/puck.config';
import '@puckeditor/puck/puck.css';

const initialData: Data = {
    root: {},
    content: [],
};

export default function EditorPage() {
    const handlePublish = async (data: Data) => {
        // TODO: Save to your backend/CMS
        console.log('Publishing:', data);
    };

    return <Puck config={config} data={initialData} onPublish={handlePublish} />;
}
