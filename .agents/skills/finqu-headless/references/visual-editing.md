# Visual Editing

Finqu storefronts support visual page editing via the Puck editor, enabling drag-and-drop page building with real-time preview.

## How It Works

1. Pages in the storefront can be marked as visually editable
2. The Finqu admin provides a visual editor interface powered by Puck
3. Merchants drag and drop components to build pages
4. Changes are saved and rendered by the storefront

## Defining Components

Use the SDK's `defineComponent` helper to create Puck-compatible components:

```typescript
import { defineComponent } from '@finqu/storefront-sdk';

export const TextBlock = defineComponent({
  name: 'TextBlock',
  fields: {
    content: { type: 'textarea', label: 'Content' },
    alignment: {
      type: 'select',
      label: 'Alignment',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
  },
  defaultProps: {
    content: 'Enter your text here',
    alignment: 'left',
  },
  render: ({ content, alignment }) => (
    <div style={{ textAlign: alignment }}>
      <p>{content}</p>
    </div>
  ),
});
```

## Component Best Practices

- Keep components self-contained with all needed props
- Provide meaningful defaults via `defaultProps`
- Use descriptive labels for editor fields
- Support responsive design in render output
- Test components in both edit mode and published mode

## Full Reference

- [Storefront SDK](https://developers.finqu.com/build-with-finqu/storefront/storefront-sdk.md.txt)
