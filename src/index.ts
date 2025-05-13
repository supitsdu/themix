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
type DefaultColorScope = "bg" | "fg" | "foreground" | "background" | "accent" | "primary" | "secondary"

/**
 * Represents any valid theme token, including scoped and namespaced variants.
 * General format is "namespace.name" with special handling for scope-specific tokens.
 */
type TokenName = `${string}.${string}`

/**
 * Supported color value formats that can be processed by the theming system.
 * Includes hex, RGB(A), and HSL(A) formats with proper type definitions.
 */
type ColorValue =
  | `#${string}`
  | `rgb(${number}, ${number}, ${number})`
  | `rgba(${number}, ${number}, ${number}, ${number})`
  | `hsl(${number}, ${number}%, ${number}%)`
  | `hsla(${number}, ${number}%, ${number}%, ${number})`
  | `hsv(${number}, ${number}%, ${number}%)`
  | `hsva(${number}, ${number}%, ${number}%, ${number})`
  | `cmyk(${number}, ${number}%, ${number}%, ${number}%)`
  | `cmyka(${number}, ${number}%, ${number}%, ${number}%, ${number})`

/**
 * Formats a token string by replacing dividers, adding prefix/suffix, and
 * ensuring no double-formatting.
 *
 * @template T     - Original token name (e.g. "button.primary")
 * @template Del   - Original divider (default ".")
 * @template Rep   - Replacement character (default "-")
 * @template Pre   - Prefix to add (e.g. "--")
 * @template Suf   - Suffix to add after formatting
 * @template Scope - Color scopes (e.g. "bg", "fg")
 */
type FormatToken<
  T extends string,
  Del extends string = ".",
  Rep extends string = "-",
  Pre extends string = "",
  Suf extends string = "",
  Scope extends string = DefaultColorScope,
> = Rep extends "."
  ? InjectSuffix<InjectPrefix<T, Pre>, Suf, Rep, Scope>
  : Del extends ""
    ? Del extends Rep
      ? InjectSuffix<InjectPrefix<T, Pre>, Suf, Rep, Del, Scope>
      : InjectSuffix<InjectPrefix<T, Pre>, Suf, Rep, Del, Scope>
    : T extends `${infer Prefix}${Del}${infer Suffix}`
      ? FormatToken<`${Prefix}${Rep}${Suffix}`, Del, Rep, Pre, Suf, Scope>
      : InjectSuffix<InjectPrefix<T, Pre>, Suf, Rep, Del, Scope>

/**
 * Injects a prefix into a string if it doesn't already start with it.
 *
 * @template T - The target string
 * @template Pre - The prefix to inject
 * @returns The target string with the prefix injected if necessary
 */
type InjectPrefix<T extends string, Pre extends string> = T extends ""
  ? T
  : Pre extends ""
    ? T
    : T extends `${Pre}${string}`
      ? T
      : `${Pre}${T}`

/**
 * Injects a suffix into a string if it doesn't already end with it.
 *
 * @template S - The suffix to inject
 * @template R - The replacement character
 * @template T - The target string
 * @template D - The delimiter (default ".")
 * @template Scope - The color scope (default "bg" | "fg" | "foreground" | "background")
 * @returns The target string with the suffix injected if necessary
 */
type InjectSuffix<
  T extends string,
  Suf extends string,
  Rep extends string,
  Del extends string = ".",
  Scope extends string = DefaultColorScope,
> = T extends "" ? T : Suf extends "" ? T : T extends `${string}${Del | Rep}${Scope}` ? `${T}${Rep}${Suf}` | T : T

const defaultPlugins = {
  /** Lighten the color by an amount */
  lighten,
  /** Darken the color by an amount */
  darken,
} as const

type BasePlugins = typeof defaultPlugins
type AnyPlugins = Record<string, Dye.PluginFunction>
type BuiltinVariants = "lighter" | "darker"
type VariantFn<P extends AnyPlugins> = (color: Dye.Instance<P>, token: string) => Dye.Instance<P>

/**
 * Factory for creating color variants.
 *
 * @template K - The variant name (e.g., "lighter", "darker")
 * @template P - The plugins available to the color instance
 * @template R - The return type (RGB object, hex string, etc.)
 */
type VariantFactory<K extends string, P extends AnyPlugins = BasePlugins> = Record<K, VariantFn<P>>

const defaultVariants: VariantFactory<BuiltinVariants> = {
  lighter: (c) => c.lighten(0.12),
  darker: (c) => c.darken(0.12),
}

/**
 * Color serializer function type. Used to generate standardized colors
 *
 * @example
 * ```ts
 * // RGB ColorSerializer (default)
 * const rgbColorSerializer: ColorSerializer = (c) => c.rgb;
 *
 * // Hex string ColorSerializer
 * const hexColorSerializer: ColorSerializer<BasePlugins, string> =
 *   (c) => c.toHex();
 *
 * // CSS variable ColorSerializer
 * const cssColorSerializer: ColorSerializer<BasePlugins, string> =
 *   (c, token) => `var(${token})`;
 * ```
 */
type ColorSerializer<P extends AnyPlugins = BasePlugins, R extends Colors.Any | string = Colors.Rgb> = (
  c: Dye.Instance<P>,
  token: string,
) => R

const defaultColorSerializer: ColorSerializer = (c) => c.rgb

/**
 * Logger interface for the theming system.
 *
 * @example
 * ```ts
 * // Custom logger using a logging library
 * const myLogger: Logger = {
 *   warn: (msg) => logLib.warning(`[Theme] ${msg}`),
 *   error: (msg) => logLib.error(`[Theme] ${msg}`)
 * }
 *
 * // Silent logger
 * const silentLogger: Logger = {
 *   warn: () => {},
 *   error: () => {}
 * }
 * ```
 */
type Logger = typeof consoleLogger

const consoleLogger = {
  warn: (message: string) => console.warn(message),
  error: (message: string) => console.error(message),
}

/**
 * A modern, type-safe theming system that orchestrates colors, variants,
 * and tokens to create cohesive design themes. It handles transformations,
 * variants, and formatting with precision and flair.
 *
 * @template TKey The token format (e.g., "button.primary", "text.color")
 * @template TPrefix Prefix for generated tokens (e.g., "--" for CSS vars)
 * @template TDivider Character for token parts (e.g., "-" or "_")
 * @template TPlugins Color manipulation plugins available to the manager
 * @template TVariantsKeys Names of color variants (e.g., "lighter", "darker")
 * @template TColorValue Output format for colors (RGB, hex string, etc.)
 * @template TVariants Color variants and their transformations
 * @template TColorSerializer Color serializer for output format
 * @template TScopedColorToken Scoped color tokens (e.g., "bg", "fg")
 */
class ThemeManager<
  TKey extends TokenName = TokenName,
  TPrefix extends string = "",
  TDivider extends string = ".",
  TScopedColorToken extends string = DefaultColorScope,
  TPlugins extends Dye.Plugins = Dye.Plugins,
  TVariantsKeys extends string = BuiltinVariants,
  TColorValue extends Colors.Any | string = Colors.Rgb,
  TVariants extends VariantFactory<TVariantsKeys, TPlugins> = VariantFactory<TVariantsKeys, TPlugins>,
  TColorSerializer extends ColorSerializer<TPlugins, TColorValue> = ColorSerializer<TPlugins, TColorValue>,
> extends Colorus<BasePlugins | TPlugins> {
  private readonly tokens: Set<TKey>
  private readonly colors: Record<TKey, ColorValue>
  private readonly variants: TVariants
  private readonly colorSerializer: TColorSerializer
  private readonly colorScope: Array<TScopedColorToken>
  private readonly prefix: TPrefix
  private readonly divider: TDivider
  private readonly logger: Logger
  private baseColorSchema?: Record<string, TColorValue>

  /**
   * Creates a new ThemeManager instance.
   *
   * @param options Configuration options for the theme manager
   *
   * @example
   * ```typescript
   * // Basic theme with CSS variable output
   * const theme = new ThemeManager({
   *   colors: {
   *     "button.primary": "#3366ff",
   *     "button.secondary": "#99aabb",
   *     "text.foreground": "#333333"
   *   },
   *   output: {
   *     prefix: "--",
   *     divider: "-"
   *   }
   * });
   *
   * // Type-safe access to your colors
   * const schema = theme.generateTheme();
   * // schema is fully typed! Try schema["--button-primary"]
   *
   * // Custom variants
   * const themePlus = new ThemeManager({
   *   colors: { "accent.primary": "#ff4500" },
   *   variants: {
   *     lighter: c => c.lighten(0.2),
   *     darker: c => c.darken(0.2),
   *     vibrant: c => c.saturate(0.3)
   *   }
   * });
   * // Now you get "accent-primary-vibrant" automatically!
   * ```
   */
  constructor(options: {
    logger?: Logger
    strict?: boolean
    scope?: Array<TScopedColorToken>
    plugins?: Partial<BasePlugins> | Partial<TPlugins>
    variants?: Record<TVariantsKeys, VariantFn<TPlugins>>
    colors: { [key in TKey]: ColorValue }
    output?: { prefix?: TPrefix; divider?: TDivider; serializer?: ColorSerializer<TPlugins, TColorValue> }
  }) {
    const { colors, output, strict } = options
    super({
      plugins: { ...defaultPlugins, ...options.plugins } as BasePlugins & TPlugins,
      parsers: [hexParser, rgbParser, hslParser, hsvParser, cmykParser],
    })
    this.tokens = new Set(Object.keys(colors)) as Set<TKey>
    this.colors = colors
    this.colorScope = options.scope || (["bg", "fg", "foreground", "background"] as Array<TScopedColorToken>)
    this.colorSerializer = (options.output?.serializer || defaultColorSerializer) as TColorSerializer
    this.variants = (options.variants || defaultVariants) as unknown as TVariants
    this.prefix = output?.prefix || ("" as TPrefix)
    this.divider = output?.divider || ("." as TDivider)
    this.logger = ThemeManager.createLogger(options.logger || consoleLogger, strict || false)
  }

  static createLogger(logger: Logger, strict: boolean) {
    if (!strict) {
      return logger
    }

    const res = {} as Logger
    for (const [key, _] of Object.entries(consoleLogger)) {
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
  generateTheme<
    SVariantsKeys extends string = TVariantsKeys,
    TFormattedKey extends FormatToken<TKey, ".", TDivider, TPrefix, SVariantsKeys, TScopedColorToken> = FormatToken<
      TKey,
      ".",
      TDivider,
      TPrefix,
      SVariantsKeys,
      TScopedColorToken
    >,
  >(colors?: {
    [key in TKey]?: ColorValue
  }): Record<TFormattedKey, TColorValue> {
    // If no colors are provided and a base color schema exists, return it
    // This allows for reusing the schema without regenerating it
    if (!colors && this.baseColorSchema) {
      return this.baseColorSchema as Record<TFormattedKey, TColorValue>
    }

    // Initialize core dependencies
    const ColorSerializer = this.colorSerializer
    const variants = this.variants!
    const tokens = this.tokens

    // Determine which color set to use
    const schemaColors = colors || (this.colors as Record<TKey, ColorValue>)
    const colorKeys = Object.keys(schemaColors) as TKey[]

    // Initialize the result schema
    let schema = {} as Record<TFormattedKey, TColorValue>

    // Process each color token
    for (const token of colorKeys) {
      // Validate token exists in registry
      if (!tokens.has(token as TKey)) {
        this.logger.warn(`Token ${String(token)} is not in the registry. Skipping...`)
        continue
      }

      const colorValue = schemaColors[token as TKey] as ColorValue

      // Skip tokens without valid color values
      if (!colorValue) {
        this.logger.warn(`Token ${String(token)} has no color. Skipping...`)
        continue
      }

      // Process base color
      const processedColor = this.dye(colorValue) as Dye.Instance<BasePlugins & TPlugins>
      if (processedColor) {
        // Format token name with prefix and dividers
        const formattedKey = `${this.prefix}${token.replace(/\./g, this.divider)}` as TFormattedKey
        schema[formattedKey] = ColorSerializer(processedColor, token) as TColorValue
      }

      // Process variants for fg/bg tokens
      const isColorScopedToken = this.colorScope.some((scope) => token.endsWith(`.${scope}`))
      if (isColorScopedToken && processedColor) {
        this.appendVariants(token, processedColor, variants, ColorSerializer, schema)
      }
    }

    // If a base color schema is provided, use it to merge with the generated schema
    if (this.baseColorSchema) {
      schema = { ...this.baseColorSchema, ...schema } as Record<TFormattedKey, TColorValue>
    }

    // Cache the schema if this is the first build with no custom colors
    if (!colors && !this.baseColorSchema) {
      this.baseColorSchema = schema
    }

    return schema as unknown as Record<TFormattedKey, TColorValue>
  }

  /**
   * Helper method to generate variants for a color token
   * @private
   */
  private appendVariants<
    TFormattedKey extends string,
    TPluginsType extends Dye.Plugins,
    VVariantsKeys extends string = TVariantsKeys,
  >(
    token: string,
    baseColor: Dye.Instance<TPluginsType>,
    variants: Record<VVariantsKeys, VariantFn<TPluginsType>>,
    ColorSerializer: (c: Dye.Instance<TPluginsType>, token: string) => any,
    schema: Record<TFormattedKey, any>,
  ): void {
    for (const variantKey of Object.keys(variants)) {
      const transformer = variants[variantKey as keyof typeof variants] as VariantFn<TPluginsType>

      // Apply the variant transformation
      const variantColor = transformer(baseColor, variantKey)

      // Skip invalid color results
      if (!variantColor.source.isValid) {
        this.logger.warn(`Variant ${variantKey} for token ${token} produced invalid color. Skipping...`)
        continue
      }

      // Create the formatted variant key: token-variantKey
      const formattedVariantKey =
        `${this.prefix}${token.replace(/\./g, this.divider)}${this.divider}${variantKey}` as TFormattedKey

      // Add to schema
      schema[formattedVariantKey] = ColorSerializer(variantColor, variantKey)
    }
  }

  /**
   * Parses a JSON string and generates a theme schema. Useful for loading themes from external JSON files.
   *
   * @template SVariantsKeys - The variant keys to use for formatting
   * @template TFormattedKey - The formatted key type
   * @param json - The JSON string to parse
   * @returns A record of formatted keys and their corresponding color values
   */
  parseFromJson<
    SVariantsKeys extends string = TVariantsKeys,
    TFormattedKey extends FormatToken<TKey, ".", TDivider, TPrefix, SVariantsKeys, TScopedColorToken> = FormatToken<
      TKey,
      ".",
      TDivider,
      TPrefix,
      SVariantsKeys,
      TScopedColorToken
    >,
  >(json: string): Record<TFormattedKey, TColorValue | undefined> {
    const parsed = JSON.parse(json) as Record<TKey, ColorValue>

    if (!parsed) {
      this.logger.error("Invalid JSON format. Unable to parse theme.")
      return {} as Record<TFormattedKey, TColorValue | undefined>
    }

    // Warns that a basse color schema is recommended for proper validation
    if (!this.baseColorSchema) {
      this.logger.warn(
        "No base color schema provided. Some colors may not be validated correctly. Consider using a base color schema.",
      )
    }

    return this.generateTheme(parsed) as Record<TFormattedKey, TColorValue | undefined>
  }
}

const __internal__ = { defaultVariants, consoleLogger }

export * from "colorus-js"
export { __internal__, ThemeManager }

export type {
  AnyPlugins,
  BasePlugins,
  BuiltinVariants,
  ColorSerializer,
  ColorValue,
  DefaultColorScope,
  FormatToken,
  InjectPrefix,
  Logger,
  TokenName,
  VariantFactory,
  VariantFn,
}
