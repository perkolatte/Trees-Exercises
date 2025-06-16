// Helper functions for DOM traversal

/**
 * Recursively searches for an element by id.
 * @param {string} id - The id to search for.
 * @returns {Element|null} The found element or null.
 */
function getElementById(id) {
  let found = null;
  function search(element) {
    if (element.id === id) {
      found = element;
      return;
    }
    for (let child of element.children) {
      if (!found) search(child);
    }
  }
  search(document.body);
  return found;
}

/**
 * Recursively collects all elements with the given tag name.
 * @param {string} tagName - The tag name to search for.
 * @returns {Element[]} Array of matching elements.
 */
function getElementsByTagName(tagName) {
  const result = [];
  function search(element) {
    if (
      element.tagName &&
      element.tagName.toLowerCase() === tagName.toLowerCase()
    ) {
      result.push(element);
    }
    for (let child of element.children) {
      search(child);
    }
  }
  search(document.body);
  return result;
}

/**
 * Recursively collects all elements with the given class name.
 * @param {string} className - The class name to search for.
 * @returns {Element[]} Array of matching elements.
 */
function getElementsByClassName(className) {
  const result = [];
  function search(element) {
    if (element.classList && element.classList.contains(className)) {
      result.push(element);
    }
    for (let child of element.children) {
      search(child);
    }
  }
  search(document.body);
  return result;
}

module.exports = {
  getElementById,
  getElementsByTagName,
  getElementsByClassName,
};
