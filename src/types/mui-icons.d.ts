/**
 * Typed shim for @mui/icons-material deep imports.
 *
 * The package ships its declarations at the package root, but with
 * `moduleResolution: bundler` its `exports` map resolves to the untyped `esm/`
 * folder. A wildcard module declaration restores types for icon imports like
 * `import MenuIcon from "@mui/icons-material/Menu"`.
 */
declare module "@mui/icons-material/*" {
  import type { ComponentType, SVGProps } from "react";
  const Icon: ComponentType<SVGProps<SVGSVGElement>>;
  export default Icon;
}