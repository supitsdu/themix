import { ThemeManager } from "themix"

// Usage example
const theme = new ThemeManager({
  colors: {
    "accent.fg": "#FF5733",
    "primary.bg": "#581845",
  },
  output: {
    divider: "-",
    suffix: "--",
  },
  strict: false,
})

// The generated base color schema fully typed with intelligent key inference
// const palette: Record<"--accent-fg" | "--primary-bg" | "--accent-fg-light" | "--accent-fg-ligther" | "--accent-fg-ligthest" | "--accent-fg-dark" | "--accent-fg-darker" | "--accent-fg-darkest" | ... 5 more ... | "--primary-bg-darkest", ColorFormat>
const palette = theme.palette

// Generating a new color schema following the base color schema
// (Fully typed with intelligent key inference)
// const variant: Record<"--accent-fg" | "--accent-fg-light" | "--accent-fg-ligther" | "--accent-fg-ligthest" | "--accent-fg-dark" | "--accent-fg-darker" | "--accent-fg-darkest", ColorFormat>
const variant = theme.createVariant({
  colors: {
    "accent.fg": "#20FF57",
  },
})

// Merging the variant with the base color schema (Fully typed with intelligent key inference)
// const merged: Record<"--accent-fg" | "--primary-bg" | "--accent-fg-light" | "--accent-fg-ligther" | "--accent-fg-ligthest" | "--accent-fg-dark" | "--accent-fg-darker" | "--accent-fg-darkest" | ... 5 more ... | "--primary-bg-darkest", ColorFormat>
const merged = theme.blend(variant)

const parsed = theme.parseThemeJson(
  JSON.stringify({
    "accent.fg": "#FF5733",
  }),
)

console.log({ palette })
console.log({ variant })
console.log({ merged })
console.log({ parsed })
