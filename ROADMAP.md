# Roadmap

This document outlines the features and progress of the theming system powered by **Colorus.js**.

## Features Implemented

- [x] **Type-Safe Design Tokens and Color Formats**

  - Ensures that design tokens follow a strict format and validates color formats (hex, RGB, RGBA, HSL, HSLA).

- [x] **String Transformation for Tokens**

  - TokenFormatter for consistent token formatting.
  - Prefix and suffix injection to handle token formatting needs.

- [x] **Color Manipulation and Variant Creation**

  - Supports color transformations like lighten, darken, and custom variants.
  - Automatically generates color variants (lighter, darker, etc.) based on base colors.

- [x] **Color Conversion and Serialization**

  - Converts colors to different formats (RGB, hex, CSS variables).
  - Supports customizable serializers for various output formats.

- [x] **Flexible Plugin System for Color Transformations**

  - Allows custom plugins for additional color manipulation functions, leveraging the Colorus.js plugin system.
  - Built-in support for custom plugins like `grayscale`, `invert`, and more.

- [x] **Logging and Error Handling**

  - Custom logger with support for warnings and errors.
  - Strict mode to enforce error handling instead of warnings.

- [x] **Color Schema Building**

  - Dynamically builds a color schema with transformations and variants.
  - Provides type-safe access to colors and variants.

- [x] **Flexible Theme Management**

  - Central management of colors, variants, tokens, and serializers.
  - Configurable via constructor options to suit various needs.

- [x] **Theme Parsing**

  - Ability to parse and process theme data from JSON configurations.

- [x] **Scoping for Color Contexts**

  - Supports scoped tokens for different design areas (e.g., `bg`, `fg`, `foreground`, `background`).

- [x] **Multi-Format Color Parsing with Custom Parsers**
  - Supports various color formats including HEX, RGB, HSL, HSV, CMYK. Uses Colorus.js built-in parsers such as `hexParser`, `rgbParser`, `hslParser`, `hsvParser`, and `cmykParser`.

## Future Considerations

### Optional Variant Skipping

Introduce a feature to optionally skip the generation of variants (e.g., `lighter`, `darker`) for certain schemas. This will give users more control over their themes generation and prevent unnecessary processing.

### Theme Exporters

Develop exporters to allow the generated theme schema to be easily converted to different formats (e.g., JSON, CSS variables, SCSS variables). This would help users export the theme to integrate it with other systems or frameworks.

### Token Composition Improvements

Enhance the token composition system to support more advanced scenarios, such as conditional composition or better handling of tokens. This could improve flexibility when defining complex design systems.

### Developer Utilities

Create a set of utilities to aid developers working with the theme system. This could include tools for generating tokens, previewing color schemes, or checking theme consistency. Such utilities would streamline the development workflow.

### WCAG Contrast Check

Integrate features to check color contrast against WCAG accessibility guidelines. This would ensure that generated themes meet accessibility standards and are visually readable for all users, especially those with visual impairments.

### Accessibility-Optimized Color Variants

Generate color variants specifically designed for users with visual impairments, such as those with color blindness or low vision. These variants could include high-contrast color schemes or colorblind-friendly palettes, ensuring that the theme is inclusive for a wider audience. Possible names for these variants could be `accessible`, `colorblind`, or `highContrast`.

### Improved Variant Configuration with Type Inference

Imagine configuring variants with fine-tuned control over which tokens get transformed and how—like this:

```ts
const theme = new ThemeManager({
  variants: {
    darker: {
      scope: ["bg", "background"],
      fn: (c) => c.darken(0.2),
    },
  },
})
```

- **Why This Matters:**

  - This would allow developers to define exactly which tokens are affected by which transformations (like darkening or adjusting contrast). It’s great for building more customizable and accessible themes that apply transformations to tokens like `.bg` (background).

- **The Catch:**
  - The tricky part? Getting TypeScript to properly infer all these types. With such flexibility, we'd need to ensure TypeScript knows exactly what transformations apply to what tokens, which would be a fun challenge for type inference! But if done right, it would provide a highly type-safe, yet flexible, developer experience.
