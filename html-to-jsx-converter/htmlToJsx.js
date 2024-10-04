import { DomHandler, Parser } from "htmlparser2";

/**
 * Escape special characters for JSX.
 * @param {string} text - Text to escape.
 * @returns {string} - Escaped text.
 */
function escapeJsx(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Convert an attribute object to JSX attributes.
 * @param {object} attribs - Attributes object.
 * @returns {string} - JSX attributes string.
 */
function convertAttributes(attribs) {
  const attributesString = Object.entries(attribs || {})
    .map(([key, value]) => {
      switch (key) {
        case "class":
          key = "className";
          break;
        case "for":
          key = "htmlFor";
          break;
        default:
          break;
      }
      return value !== undefined ? `${key}="${escapeJsx(value)}"` : "";
    })
    .filter(Boolean)
    .join(" ");

  // Return attributes properly formatted, no leading space if empty
  return attributesString.length > 0 ? ` ${attributesString}` : "";
}

/**
 * Convert HTML to JSX.
 * @param {string} html - HTML string to convert to JSX.
 * @returns {string} - JSX string.
 */
function htmlToJsx(html) {
  const handler = new DomHandler();
  const parser = new Parser(handler, { lowerCaseAttributeNames: false });

  parser.write(html);
  parser.end();

  const traverseDom = (node) => {
    if (node.type === "text") {
      return escapeJsx(node.data.trim());
    }

    const attributes = convertAttributes(node.attribs);
    const children = node.children
      ? node.children.map(traverseDom).filter(Boolean).join("")
      : "";

    // Handle self-closing tags properly
    if (
      node.children.length === 0 &&
      ["br", "img", "input", "hr", "meta", "link"].includes(node.name)
    ) {
      return `<${node.name}${attributes} />`;
    }

    // Properly handle non-self-closing tags
    return `<${node.name}${attributes}>${children}</${node.name}>`;
  };

  return handler.dom.map(traverseDom).join("");
}

export default htmlToJsx;
