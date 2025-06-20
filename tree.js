/** TreeNode: node for a general tree. */
class TreeNode {
  constructor(val, children = []) {
    this.val = val;
    this.children = children;
  }
}

class Tree {
  #root = null; // Use private field for root

  constructor(root = null) {
    this.#root = root;
  }

  /** sumValues(): add up all of the values in the tree. */
  sumValues() {
    if (!this.#root) {
      return 0;
    }

    let total = 0;
    let toSum = [this.#root];
    const allNodes = new Set();

    while (toSum.length > 0) {
      let node = toSum.pop();
      total += node.val;
      allNodes.add(node);
      for (let child of node.children) {
        toSum.push(child);
      }
    }
    return total;
  }

  /** countEvens(): count all of the nodes in the tree with even values. */
  countEvens() {
    if (!this.#root) {
      return 0;
    }

    let count = 0;
    let toCount = [this.#root];
    const evenNodes = new Set();

    while (toCount.length > 0) {
      let node = toCount.pop();
      if (node.val % 2 === 0) {
        count++;
        evenNodes.add(node);
      }
      for (let child of node.children) {
        toCount.push(child);
      }
    }
    return count;
  }

  /** numGreater(lowerBound): return a count of the number of nodes
   * whose value is greater than lowerBound. */
  numGreater(lowerBound) {
    if (!this.#root) {
      return 0;
    }

    let count = 0;
    let toCount = [this.#root];
    const greaterNodes = new Set();

    while (toCount.length > 0) {
      let node = toCount.pop();
      if (node.val > lowerBound) {
        count++;
        greaterNodes.add(node);
      }
      for (let child of node.children) {
        toCount.push(child);
      }
    }
    return count;
  }
}

module.exports = { Tree, TreeNode };
