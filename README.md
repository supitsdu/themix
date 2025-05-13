# Themix

**Themix** is a type-safe utility for scalable and maintainable color theme systems, built on top of **Colorus.js**.

Managing multiple themes in an application can quickly become complex. Ensuring all themes follow the same standards and patterns—such as creating consistent dark and light variations—often becomes a cumbersome task. Themix simplifies these challenges by offering a powerful configuration-based approach with full type inference.

---

## Installation

```bash
npm install themix
```

## Quick Start

Create strongly typed, customizable themes easily:

```javascript
import { ThemeManager, toHex, saturate, lighten, darken } from "themix"

const theme = new ThemeManager({
  colors: {
    "button.bg": "#3366ff",
    "button.shadow": "#99aabb",
    "text.fg": "#333333",
  },
  plugins: { toHex, saturate, lighten, darken },
  variants: {
    lighter: (c) => c.lighten(0.12),
    darker: (c) => c.darken(0.12).saturate(0.2),
    vibrant: (c) => c.saturate(0.3),
  },
  scope: ["bg", "fg"],
  output: { prefix: "--", divider: "-", serializer: (c) => c.toHex() },
  strict: true,
})

// Generate fully typed theme:
const baseTheme = theme.generateTheme()
// const baseTheme: Record<"--button-bg" | "--button-shadow" | "--text-fg" | "--button-bg-lighter" | "--button-bg-darker" | "--button-bg-vibrant" | "--text-fg-lighter" | "--text-fg-darker" | "--text-fg-vibrant", string>
```

**Note**: `theme.generateTheme()` _does not automatically inject styles into your application_. Instead, it returns a type-safe color schema object that you can integrate with your preferred framework or tooling to expose as CSS variables or theme tokens.

For example, in a `CSS-in-JS` setup or during a build step, you could take the generated object and inject it into a style block or export it to a CSS file. Which allows you to use then like:

```css
button {
  background-color: var(--button-bg);
  box-shadow: 0 4px 8px var(--button-shadow);
}
```

---

## Why Themix?

Themix promotes the use of **flat tokens** (e.g., `element.scope.context`) over deeply nested theme objects. This encourages consistency, simplifies access, and improves tooling compatibility—particularly in design systems and CSS frameworks.

- Ensures reliable and predictable theming.
- Easily extend functionality with your custom plugins.
- Dynamically adjust colors through variants.
- Automate variant applications based on token scope.
- Proactively catch issues with color definitions.

---

## API Reference

### `ThemeManager(options)`

Create a new theme manager.

- **colors**: Define base colors.
- **plugins**: Use or create custom color plugins.
- **variants**: Name and apply transformations.
- **scope**: Target specific color tokens for variants.
- **output**: Customize output format.
- **strict**: Enable rigorous validation.

### `.generateTheme(colors?)`

Generate base theme or extend it:

```javascript
const darkTheme = theme.generateTheme({
  "button.bg": "#000000",
})
```

### `.parseFromJson(json)`

Load and validate theme definitions from JSON:

```javascript
const customTheme = theme.parseFromJson('{"button.bg":"#ff0000","button.shadow":"#00ff00"}')
```

---

## Resources

- [Changelog](https://github.com/supitsdu/themix/releases)
- [Roadmap](ROADMAP.md)
- [GitHub Discussions](https://github.com/supitsdu/themix/discussions)

---

## License

MIT License. See [LICENSE](LICENSE).
