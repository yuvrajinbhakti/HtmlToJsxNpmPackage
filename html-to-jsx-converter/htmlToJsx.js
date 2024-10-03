const htmlparser2 = require('htmlparser2');

/**
 * Escape special characters for JSX.
 * @param {string} text - Text to escape.
 * @returns {string} - Escaped text.
 */
function escapeJsx(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Convert an attribute object to JSX attributes.
 * @param {object} attribs - Attributes object.
 * @returns {string} - JSX attributes string.
 */
function convertAttributes(attribs) {
  return Object.entries(attribs || {}).map(([key, value]) => {
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
    return value !== undefined ? `${key}="${escapeJsx(value)}"` : '';
  }).filter(Boolean).join(" ");
}

/**
 * Convert HTML to JSX.
 * @param {string} html - HTML string to convert to JSX.
 * @returns {string} - JSX string.
 */
function htmlToJsx(html) {
  const handler = new htmlparser2.DomHandler();
  const parser = new htmlparser2.Parser(handler, { lowerCaseAttributeNames: false });
  
  parser.write(html);
  parser.end();

  const traverseDom = (node) => {
    if (node.type === "text") {
      return escapeJsx(node.data.trim());
    }

    const attributes = convertAttributes(node.attribs);
    const children = node.children ? node.children.map(traverseDom).filter(Boolean).join("") : "";

    // Handle self-closing tags
    if (node.children.length === 0 && !['br', 'img', 'input', 'hr', 'meta', 'link'].includes(node.name)) {
      return `<${node.name} ${attributes} />`;
    }

    return `<${node.name} ${attributes}>${children}</${node.name}>`;
  };

  return handler.dom.map(traverseDom).join("");
}

module.exports = htmlToJsx;
