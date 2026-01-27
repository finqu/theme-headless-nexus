import { type ComponentConfig } from '@finqu/storefront-sdk';
import { GetStartedBlock } from './get-started-block';

interface GetStartedProps {
  badgeText?: string;
  badgeLink?: string;
  title: string;
  description: string;
  commandName?: string;
  gradientBorderTop?: boolean;
  gradientBorderBottom?: boolean;
}

export const category = 'Marketing';

export const config: ComponentConfig<GetStartedProps> = {
  label: 'Get Started',
  fields: {
    badgeText: {
      type: 'text',
      label: 'Badge Text (optional)',
    },
    badgeLink: {
      type: 'text',
      label: 'Badge Link (optional)',
    },
    title: {
      type: 'text',
      label: 'Title',
    },
    description: {
      type: 'textarea',
      label: 'Description',
    },
    commandName: {
      type: 'text',
      label: 'Command Name (optional)',
    },
    gradientBorderTop: {
      type: 'radio',
      label: 'Gradient Border Top',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
    gradientBorderBottom: {
      type: 'radio',
      label: 'Gradient Border Bottom',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
  },
  defaultProps: {
    badgeText: 'Shipped new features!',
    title: 'Get Started with Headless Commerce',
    description: 'Start building your storefront in minutes with our powerful headless commerce solution.',
    commandName: 'my-storefront',
    gradientBorderTop: false,
    gradientBorderBottom: false,
  },
  render: ({
    badgeText,
    badgeLink,
    title,
    description,
    commandName = 'my-storefront',
    gradientBorderTop,
    gradientBorderBottom,
  }) => (
    <GetStartedBlock
      badgeText={badgeText}
      badgeLink={badgeLink}
      title={title}
      description={description}
      commandName={commandName}
      gradientBorderTop={gradientBorderTop}
      gradientBorderBottom={gradientBorderBottom}
    />
  ),
};
