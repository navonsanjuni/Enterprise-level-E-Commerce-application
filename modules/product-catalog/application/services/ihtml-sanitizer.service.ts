// Application-layer port for HTML sanitization. Implementations live in infra.
//
// Sanitizers RETURN cleaned content rather than throwing. This matches the
// editorial-content use case: trusted internal authors should not see their
// submission rejected because of a stray attribute — clean it and persist.
// Validation-style throws (length limits, structural rules) belong in the
// entity layer, not the sanitizer.
export interface IHtmlSanitizer {
  /**
   * Sanitize a plain-text title — strips ALL HTML tags and dangerous protocols,
   * returning safe display text.
   */
  sanitizeTitle(title: string): string;

  /**
   * Sanitize editorial HTML — allows a curated set of formatting tags and
   * attributes, strips everything else (scripts, iframes, dangerous protocols,
   * event handlers, style/CSS attacks).
   */
  sanitize(html: string): string;
}
