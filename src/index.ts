import {
  cmykParser,
  Colors,
  Colorus,
  darken,
  Dye,
  hexParser,
  hslParser,
  hsvParser,
  lighten,
  rgbParser,
} from "colorus-js"

/**
 * Represents the fundamental color context in a design system.
 * Includes background and foreground designations in both short and full forms.
 */
type ColorScope = "bg" | "fg" | "foreground" | "background" | "accent" | "primary" | "secondary"

/**
 * A color token with scope as prefix (e.g., "bg.primary", "fg.accent").
 * Used to explicitly define whether a color is for background or foreground.
 */
type ScopedColorToken = `${ColorScope}.${string}`

/**
 * A color token with namespace as prefix and scope as suffix (e.g., "button.bg", "card.fg").
 * Used to group related colors by component or element name.
 */
type NamespacedColorToken = `${string}.${ColorScope}`

/**
 * Represents any valid theme token, including scoped and namespaced variants.
 * General format is "namespace.name" with special handling for scope-specific tokens.
 */
type ThemeToken = `${string}.${string}` | ScopedColorToken | NamespacedColorToken

/**
 * Supported color value formats that can be processed by the theming system.
 * Includes hex, RGB(A), and HSL(A) formats with proper type definitions.
 */
type ColorFormat =
  | `#${string}`
  | `rgb(${number}, ${number}, ${number})`
  | `rgba(${number}, ${number}, ${number}, ${number})`
  | `hsl(${number}, ${number}%, ${number}%)`
  | `hsla(${number}, ${number}%, ${number}%, ${number})`
type Divider<T> = T extends "." ? never : T

/**
 * Highly flexible, but type-safe way to enforce a key format.
 *
 * Has safety checks to avoid infinite recursions.
 * Also ensure that the format is not applied twice, or formatted incorrectly.
 *
 * @param T The string to replace the divider in.
 * @param D The divider to replace.
 * @param R The string to replace the divider with.
 * @param P The prefix to add to the string.
 * @returns The modified string with the divider replaced and the prefix added.
 * @example
 * ```ts
 * TokenFormatter<"foo.bar.baz", ".", "-", "--", "dark"> // '--foo-bar-baz-dark'
 * ```
 */
type TokenFormatter<
  T extends string,
  D extends string = ".",
  R extends string = "-",
  P extends string = "",
  S extends string = "",
> = R extends "."
  ? SuffixInjector<S, R, PrefixInjector<P, T>>
  : D extends ""
    ? D extends R
      ? SuffixInjector<S, R, PrefixInjector<P, T>>
      : SuffixInjector<S, R, PrefixInjector<P, T>>
    : T extends `${infer Prefix}${D}${infer Suffix}`
      ? TokenFormatter<`${Prefix}${R}${Suffix}`, D, R, P, S>
      : SuffixInjector<S, R, PrefixInjector<P, T>>

/**
 * Appends a prefix to a string if it doesn't already start with that prefix.
 *
 * Has a safety check to ensure that the prefix is not empty.
 * Also checks if the string already starts with the prefix.
 *
 * @param P The prefix to add.
 * @param T The string to append the prefix to.
 * @returns The modified string with the prefix added.
 * @example
 * ```ts
 * PrefixInjector<"--", "bar", "@"> // '--bar@'
 */
type PrefixInjector<P extends string, T extends string> = P extends "" ? T : T extends `${P}${string}` ? T : `${P}${T}`
type SuffixInjector<S extends string, R extends string, T extends string> = S extends ""
  ? T
  : T extends `${string}${R}${S}`
    ? T
    : `${T}${R}${S}`

const defaultPlugins = {
  /** Lighten the color by an amount */
  lighten,
  /** Darken the color by an amount */
  darken,
} as const

type DefaultPlugins = typeof defaultPlugins

type AnyPlugins = Record<string, Dye.PluginFunction>

type BuiltinVariants = "lighter" | "darker"

type VariantFn<P extends AnyPlugins> = (color: Dye.Instance<P>, token: string) => Dye.Instance<P>

type VariantTransformers<K extends string, P extends AnyPlugins = typeof defaultPlugins> = Record<K, VariantFn<P>>

const builtinVariants: VariantTransformers<BuiltinVariants> = {
  lighter: (c) => c.lighten(0.12),
  darker: (c) => c.darken(0.12),
}

// type Serializer = (c: Dye.Instance<typeof defaultPlugins>, token: string) => string
type Serializer<P extends AnyPlugins = typeof defaultPlugins, R extends Colors.Any | string = Colors.Rgb> = (
  c: Dye.Instance<P>,
  token: string,
) => R

const defaultSerializer: Serializer = (c) => c.rgb

const defaultLogger = {
  warn: (message: string) => console.warn(message),
  error: (message: string) => console.error(message),
}

type Logger = typeof defaultLogger

/**
 * A modern, type-safe theming system for creating and managing design tokens.
 * Handles color transformations, variant generation, and format standardization.
 *
 * @template TKey - The base theme token type
 * @template TPrefix - String prefix to apply to all generated tokens
 * @template TDivider - Character used to separate token parts
 * @template TEnforcedKey - Variant-enhanced tokens with proper structure
 * @template TFormattedKey - Final formatted token with applied prefix and divider
 */
class ThemeManager<
  TKey extends ThemeToken = ThemeToken,
  TPrefix extends string = "",
  TDivider extends string = "-",
  TPlugins extends Dye.Plugins = Dye.Plugins,
  TVariantsKeys extends string = BuiltinVariants,
  TColorFormat extends Colors.Any | string = Colors.Rgb,
  TVariants extends VariantTransformers<TVariantsKeys, TPlugins> = VariantTransformers<TVariantsKeys, TPlugins>,
  TSerializer extends Serializer<TPlugins, TColorFormat> = Serializer<TPlugins, TColorFormat>,
> extends Colorus<DefaultPlugins | TPlugins> {
  /**
   * Registry of all valid token keys.
   */
  readonly tokens: Set<TKey>

  readonly colors: Record<TKey, ColorFormat>

  readonly variants: TVariants

  readonly serializer: TSerializer

  /**
   * Prefix applied to all generated tokens (e.g., "--" for CSS variables).
   */
  readonly prefix: TPrefix

  /**
   * Character used to separate parts of token names (e.g., "-" or "_").
   */
  readonly divider: TDivider

  /**
   * Logger for outputting messages and errors.
   */
  readonly logger: Logger

  /**
   * Creates a new theme instance with the specified colors and formatting options.
   *
   * @param options - Configuration object
   * @param options.colors - Base color definitions using token keys
   * @param options.output - Formatting options for the generated tokens
   * @param options.output.prefix - Prefix to apply to all tokens (e.g., "--" for CSS variables)
   * @param options.output.divider - Character to use between token parts (default: ".")
   */
  constructor(options: {
    logger?: Logger
    strict?: boolean
    colors: Record<TKey, ColorFormat>
    plugins?: Partial<DefaultPlugins> | Partial<TPlugins>
    serializer?: Serializer<TPlugins, TColorFormat>
    variants?: Record<TVariantsKeys, VariantFn<TPlugins>>
    output?: {
      prefix?: TPrefix
      divider?: TDivider
    }
  }) {
    const { colors, output, strict } = options
    super({
      plugins: { ...defaultPlugins, ...options.plugins } as DefaultPlugins & TPlugins,
      parsers: [hexParser, rgbParser, hslParser, hsvParser, cmykParser],
    })
    this.tokens = new Set(Object.keys(colors)) as Set<TKey>
    this.colors = colors
    this.serializer = (options.serializer || defaultSerializer) as TSerializer
    this.variants = (options.variants || builtinVariants) as unknown as TVariants
    this.prefix = output?.prefix || ("" as TPrefix)
    this.divider = output?.divider || ("." as TDivider)
    this.logger = this.createLogger(options.logger || defaultLogger, strict || false)
  }

  createLogger(logger: Logger, strict: boolean) {
    if (!strict) {
      return logger
    }

    const res = {} as Logger
    for (const [key, _] of Object.entries(defaultLogger)) {
      res[key as unknown as keyof Logger] = (message: string) => {
        throw new Error(`[Theme-Manager]: ${message.replace("Skipping...", "")}`)
      }
    }
    return res
  }

  /**
   * Builds the complete color schema by processing all input colors,
   * applying transformations, and generating variants.
   *
   * @param colors - Raw color definitions
   * @returns Complete schema with processed colors and variants
   * @private
   */
  buildSchema<
    SVariantsKeys extends string = TVariantsKeys,
    SKeys extends string = TKey,
    TFormattedKey extends TokenFormatter<SKeys, ".", TDivider, TPrefix, SVariantsKeys> = TokenFormatter<
      SKeys,
      ".",
      TDivider,
      TPrefix,
      SVariantsKeys
    >,
  >(colors?: Record<SKeys, ColorFormat>): Record<TFormattedKey, TColorFormat> {
    const serializer = this.serializer
    const variants = this.variants!
    const tokens = this.tokens
    let schemaColors = colors as unknown as Record<TKey, ColorFormat>

    if (!colors) {
      schemaColors = this.colors
    }

    const colorKeys = Object.keys(schemaColors) as TKey[]
    const colorKeysSet = new Set(colorKeys)

    const schema = {} as Record<TFormattedKey, TColorFormat>

    for (const colorKey of colorKeysSet) {
      if (!tokens.has(colorKey as TKey)) {
        this.logger.warn(`Token ${String(colorKey)} is not in the registry.  Skipping...`)
        continue
      }

      const color = schemaColors[colorKey as TKey] as ColorFormat

      if (!color) {
        this.logger.warn(`Token ${String(colorKey)} has no color.  Skipping...`)
        continue
      }

      const processedColor = this.dye(color) as Dye.Instance<DefaultPlugins & TPlugins>
      if (processedColor) {
        const formattedColor = serializer(processedColor, colorKey)
        const key = `${this.prefix}${colorKey.replace(/\./g, this.divider)}` as TFormattedKey

        schema[key] = formattedColor as TColorFormat
      }

      if ((colorKey as TKey)?.match(/\.(fg|bg|foreground|background)$/)) {
        for (const variantKey of Object.keys(variants)) {
          const transformer = variants[variantKey as keyof typeof variants] as VariantFn<DefaultPlugins & TPlugins>

          const processedColor = this.dye(color) as Dye.Instance<DefaultPlugins & TPlugins>
          const variantColor = transformer(processedColor, variantKey)

          if (!variantColor.source.isValid) {
            this.logger.warn(`Token ${String(colorKey)} has no color.  Skipping...`)
            continue
          }

          const key =
            `${this.prefix}${colorKey.replace(/\./g, this.divider)}${this.divider}${variantKey}` as TFormattedKey
          schema[key] = serializer(variantColor, variantKey) as TColorFormat
        }
      }
    }

    return schema as unknown as Record<TFormattedKey, TColorFormat>
  }
}

const internals = { builtinVariants, defaultLogger }

export { internals, ThemeManager }

export type {
  BuiltinVariants,
  ColorFormat,
  Logger,
  NamespacedColorToken,
  PrefixInjector,
  ScopedColorToken,
  ThemeToken,
  TokenFormatter,
}

// Usage example

const theme = new ThemeManager({
  colors: {
    "accent.fg": "hsl(11, 100%, 60%)",
    "primary.bg": "#581845",
  },
})

const dv = theme.divider

const generatedPalette = theme.buildSchema()

const variant = theme.buildSchema({
  "accent.fg": "hsl(11, 20%, 60%)",
})

console.debug({ generatedPalette, variant })

/**
{
  generatedPalette: {
    "accent-fg": "hsl(11, 100%, 60%)",
    "accent-fg-ligthest": "hsl(11, 20%, 60%)",
    "accent-fg-brighter": "hsl(11, 100%, 68%)",
    "primary-bg": "hsl(318, 57%, 22%)",
    "primary-bg-ligthest": "hsl(318, 11%, 22%)",
    "primary-bg-brighter": "hsl(318, 69%, 25%)",
  },
}
*/
