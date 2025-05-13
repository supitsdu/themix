import { saturate, toHex } from "colorus-js"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ColorSerializer, ThemeManager } from "../src"

const baseColors = {
  "button.bg": "#3366ff",
  "button.shadow": "#99aabb",
  "text.fg": "#333333",
} as const

export const plugins = {
  saturate,
  toHex,
} as const

export type ColorusPlugin = typeof plugins

// Helper: simple hex serializer to string
const hexSerializer: ColorSerializer<ColorusPlugin, string> = (c) => c.toHex() as string

const createThemeManager = () =>
  new ThemeManager({
    colors: baseColors,
    output: { prefix: "--", divider: "-", serializer: hexSerializer },
    plugins,

    strict: true,
  })

// Help to get the return type of the createThemeManager function
type TM = ReturnType<typeof createThemeManager>

describe("ThemeManager", () => {
  let theme: TM

  beforeEach(() => {
    theme = createThemeManager()
  })

  it("should generate basic theme schema with no variants when scope does not match", () => {
    // default scope includes 'bg', 'fg' => variants applied
    const schema = theme.generateTheme()
    // base keys
    expect(schema).toHaveProperty("--button-bg")
    expect(schema).toHaveProperty("--button-shadow")
    expect(schema).toHaveProperty("--text-fg")
    expect(schema["--button-bg"]).toBe(baseColors["button.bg"])
    expect(schema["--button-shadow"]).toBe(baseColors["button.shadow"])
    expect(schema["--text-fg"]).toBe(baseColors["text.fg"])
  })

  it("should apply default variants for scoped tokens", () => {
    const schema = theme.generateTheme()
    // lighter and darker variants for .bg and .fg
    expect(schema).toHaveProperty("--button-bg-lighter")
    expect(schema).toHaveProperty("--button-bg-darker")
    expect(schema).toHaveProperty("--text-fg-lighter")
    expect(schema).toHaveProperty("--text-fg-darker")
    // ensure variant transforms changed value
    const lighter = schema["--button-bg-lighter"]
    const darker = schema["--button-bg-darker"]
    expect(lighter).not.toBe(baseColors["button.bg"])
    expect(darker).not.toBe(baseColors["button.bg"])
  })

  it("should respect custom scope and custom variants", () => {
    const customTheme = new ThemeManager({
      colors: baseColors,
      scope: ["shadow"],
      plugins,
      variants: { custom: (c) => c.saturate(0.5) },
      output: { prefix: "$", divider: ":", serializer: hexSerializer },
    })
    const schema = customTheme.generateTheme()
    expect(schema).toHaveProperty("$button:shadow")
    expect(schema).toHaveProperty("$button:shadow:custom")
    // ensure no .bg or .fg variants
    expect(Object.keys(schema).some((k) => k.includes("-lighter"))).toBe(false)
  })

  it("should allow overriding base colors", () => {
    const schema = theme.generateTheme()
    const overrided = theme.generateTheme({ "button.bg": "#000000" })
    expect(overrided["--button-bg"]).toBe("#000000")
    // other keys unchanged
    expect(overrided["--button-shadow"]).toBe(baseColors["button.shadow"])
    expect(schema["--button-bg"]).toBe(baseColors["button.bg"])
    expect(schema["--button-shadow"]).toBe(baseColors["button.shadow"])
  })

  it("should parse from JSON and generate correct schema", () => {
    const schema = theme.generateTheme()
    const json = JSON.stringify({ "button.bg": "#abcdef" })
    const parsed = theme.parseFromJson(json)
    expect(parsed["--button-bg"]).toBe("#abcdef")
    expect(schema["--button-bg"]).toBe(baseColors["button.bg"])
  })

  it("should warn on invalid tokens in strict=false mode", () => {
    const warnSpy = vi.spyOn(console, "warn")
    const badColors = { "invalid.token": "#123123" }
    const tm = new ThemeManager({ colors: baseColors, strict: false })
    tm.generateTheme(badColors as any)
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })

  it("should throw on invalid tokens in strict=true mode", () => {
    const tm = new ThemeManager({ colors: baseColors, strict: true })
    expect(() => tm.generateTheme({ "invalid.token": "#123123" } as any)).toThrow()
  })

  it("should use defaultColorSerializer when no serializer provided", () => {
    const tm = new ThemeManager({ colors: baseColors })
    const schema = tm.generateTheme()
    expect(schema).toHaveProperty("button.bg")
    expect(typeof schema["button.bg"]).toBe("object")
    expect(typeof schema["button.bg.darker"]).toEqual("object")
  })

  it("should preserve baseColorSchema cache", () => {
    const first = theme.generateTheme()
    // mutate the theme colors and generate again without override
    ;(theme as any).colors["button.bg"] = "#ffffff"
    const second = theme.generateTheme()
    // since baseColorSchema cached, second should equal first
    expect(second).toEqual(first)
  })
})
