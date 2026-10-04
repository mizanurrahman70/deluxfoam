# Skeleton Theme Agent Guide

A minimal Shopify theme that defines page structure directly in Liquid. This
file lists the repository conventions that aren't obvious from an individual
file. The code is the source of truth.

## Non-negotiables when editing this theme

- **No sections:** no `sections/` folder, no `{% section %}`/`{% sections %}`
  tags, no JSON templates, no schema `presets`.
- **No Liquid-embedded assets:** no `{% stylesheet %}`, no `{% javascript %}`.
  All CSS and JavaScript live in `assets/`.
- **Direct Liquid templates:** templates render page content from
  snippets and inline markup. Don't introduce a section for markup that is
  used by only one page.
- **Standard Liquid only:** don't use the preview `{% block %}` or
  `{% partial %}` tags — stores without the developer preview reject them
  with `Unknown tag`. Compose with `{% render %}` snippets instead.
- **Template-owned containers:** each `templates/*.liquid` file captures its
  page markup and renders it through the `container` snippet
  (`{% capture page_content %}…{% endcapture %}` then
  `{% render 'container', content: page_content %}`). `layout/theme.liquid`
  wraps only the `header` and `footer` snippets in containers and renders
  `content_for_layout` in a plain `<main>`. `gift_card.liquid`
  (`{% layout none %}`) manages its own document structure.
- **Whitespace matters:** include whitespace between an HTML tag name and a
  following Liquid delimiter (`<li {% ... %}`, not `<li{% ... %}`).
- **Translated UI only:** every user-facing string uses a literal
  `{{ 'key' | t }}` call.
- **Shopify routes for storefront URLs:** use Liquid `routes.*` for every
  storefront path; never hardcode `/cart`, `/search`, or `/collections`.

## Page structure

```
layout/theme.liquid    → render 'container' (header) + <main> content_for_layout + render 'container' (footer)
layout/password.liquid → <main> content_for_layout
templates/*.liquid     → capture markup → render 'container', content: …
```

## Snippets

- Start every snippet with a `{% doc %}` header documenting each parameter,
  including `content` when the snippet renders caller-captured markup.
- `{% render %}` can't take a body or inline arrays: capture markup into a
  variable and pass it as `content`, and build arrays with `| split: ','`.
- Merchant-editable header/footer options live in `config/settings_schema.json`
  (`settings.header_menu`, `settings.footer_menu`, …), not in `{% schema %}`.

Skeleton keeps `.theme-check.yml` as a pristine
`extends: theme-check:recommended` with **zero overrides**. Fix Theme Check
errors in the Liquid instead of adding configuration exceptions.

## Theme map

```
templates/            *.liquid page structure (no JSON templates)
layout/               theme.liquid document shell: header/footer containers + <main>
snippets/             container, header, footer, hello-world, liquid-tips,
                      css-variables, image, meta-tags
assets/               CSS, JavaScript, and other static assets
```
