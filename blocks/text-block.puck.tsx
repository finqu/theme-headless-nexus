import { type ComponentConfig } from '@finqu/storefront-sdk';

interface TextBlockProps {
  content: string;
  alignment: 'left' | 'center' | 'right';
}

export const category = 'Content';

export const config: ComponentConfig<TextBlockProps> = {
  label: 'Text Block',
  fields: {
    content: {
      type: 'textarea',
      label: 'Content',
    },
    alignment: {
      type: 'radio',
      label: 'Alignment',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
  },
  defaultProps: {
    content: 'Add your text here...',
    alignment: 'left',
  },
  render: ({ content, alignment }) => (
    <div className="container mx-auto px-4 py-12">
      <p>{content}</p>
    </div>
  ),
};
