# 🎨 Themix

> Type-safe theming without the headache! Mix, match, and manage your design tokens with ease.

## 🌈 What's This Magic?

Themix is a modern, type-safe theming system created out of frustration with existing solutions that either lacked type safety or were too rigid. It helps you create, manage, and transform design tokens with confidence, all while providing excellent TypeScript support.

Born from countless hours of battling CSS variables and theme tokens across different projects, Themix aims to make theming delightful rather than dreadful.

## ✨ Features

- **Type-safe from the ground up** - No more typos in your color tokens!
- **Smart variant generation** - Automatically create light/dark variants of your colors
- **Flexible token formatting** - Configure separators and prefixes to match your naming convention
- **Blend mode** - Mix and match different theme variants with ease
- **Compatible with any styling solution** - Use with CSS variables, styled-components, emotion, you name it!

## 📦 Installation

```bash
npm install @colorus-js/themix
```

## 🚀 Quick Start

```typescript
import { ThemeManager } from "@colorus-js/themix"

// Create your theme with base colors
const theme = new ThemeManager({
  colors: {
    "primary.bg": "#3498db",
    "primary.fg": "#ffffff",
    "secondary.bg": "#2ecc71",
    "secondary.fg": "#ffffff",
    "accent.bg": "#e74c3c",
    "accent.fg": "#ffffff",
  },
  output: {
    divider: "-",
    suffix: "--",
  },
})

console.log(theme.palette) // { "--primary-bg": "#3498DB", "--primary-fg": "#FFFFFF", ... }
```

## 🌙 Creating Variants (Dark Mode, Anyone?)

```typescript
// Create a dark mode variant
const darkTheme = theme.createVariant({
  colors: {
    "primary.bg": "#1a5276",
    "secondary.bg": "#186a3b",
    "accent.bg": "#922b21",
  },
})

// Blend it with the base theme
const finalDarkTheme = theme.blend(darkTheme)
```

## 🧩 Use Cases

Themix is perfect for:

- Design systems that need to support multiple themes
- Applications with light/dark mode
- Projects where you want to maintain consistent color relationships
- Anywhere you need type-safe theme management
- Component libraries with themeable components

## 🛠️ How It Works

Themix works by taking your base color definitions and:

1. Transforming them into standard formats
2. Automatically generating variants (light/lighter/lightest and dark/darker/darkest)
3. Formatting tokens according to your preferences
4. Providing a type-safe API for working with color tokens

## ⚠️ Current Limitations

Currently, Themix comes with built-in variants (light, lighter, lightest, dark, darker, darkest) that are applied automatically to tokens ending with `.fg` or `.bg` suffixes. Customizing these variants is planned for a future release.

## 🗺️ Roadmap

- Generate custom color output format (HSV, HSL, and etc)
- Custom variant transformers
- Import/export themes from design tools
- Support for non-color tokens (spacing, typography, etc.)
- Theme transition utilities
- Enhanced validation and error reporting

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit PRs.

## 📝 License

Released under [MIT]
