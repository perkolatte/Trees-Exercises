/** Modern class syntax instead of function constructors and prototypes */
class BinaryTreeNode {
  /** Default parameters eliminate need for undefined checks */
  constructor(value, leftChild = null, rightChild = null) {
    this.value = value;
    this.left = leftChild;
    this.right = rightChild;
  }
}

class BinaryTree {
  /** Private class field using # prefix (ES2019+) */
  #root;

  /** Nullish coalescing operator ?? (ES2020+) only falls back on null/undefined
   * More precise than || which falls back on any falsy value */
  constructor(root = null) {
    this.#root = root ?? null;
  }

  /** Private method using # prefix (ES2019+)
   * Encapsulates internal traversal logic */
  #traverse(callback) {
    if (!this.#root) return null;

    const queue = [
      {
        node: this.#root,
        depth: 1,
        parent: null,
      },
    ];

    let maxDepth = 1;

    while (queue.length) {
      // Object destructuring in parameters and variable declarations
      const { node, depth, parent } = queue.shift();
      // Call callback with current node info
      const result = callback({ node, depth, parent });
      if (result !== undefined) {
        maxDepth = Math.max(maxDepth, depth);
      }

      // Add children to queue if they exist
      if (node.left) {
        queue.push({
          node: node.left,
          depth: depth + 1,
          parent: node,
        });
      }
      if (node.right) {
        queue.push({
          node: node.right,
          depth: depth + 1,
          parent: node,
        });
      }
    }

    return maxDepth;
  }

  /** Find shortest path from root to any leaf node
   * A leaf node is one with no children */
  minDepth() {
    if (!this.#root) return 0; // Empty tree has depth 0
    const queue = [{ node: this.#root, depth: 1, parent: null, metadata: {} }];

    while (queue.length) {
      const { node, depth } = queue.shift();
      // If we find a leaf node, we've found shortest path
      if (!node.left && !node.right) return depth;
      // Add non-null children to queue
      node.left && queue.push({ node: node.left, depth: depth + 1 });
      node.right && queue.push({ node: node.right, depth: depth + 1 });
    }
    return 1; // Tree with only root
  }

  /** Find longest path from root to any leaf node */
  maxDepth() {
    if (!this.#root) return 0;
    // Arrow function with implicit return
    return this.#traverse(({ depth }) => depth);
  }

  /** Find smallest value in tree that is larger than given value */
  nextLarger(lowerBound) {
    if (!this.#root) return null;
    let smallestLarger = null;
    const queue = [this.#root];

    while (queue.length) {
      const node = queue.shift();
      if (
        node.value > lowerBound &&
        (smallestLarger === null || node.value < smallestLarger)
      ) {
        smallestLarger = node.value;
      }
      // Optional chaining operator ?. (ES2020+) safely accesses nested properties
      // Replaces node && node.left pattern
      node?.left && queue.push(node.left);
      node?.right && queue.push(node.right);
    }
    return smallestLarger;
  }

  /** Find path through tree with largest sum of node values */
  maxSum() {
    if (!this.#root) return 0;

    // Use WeakMap to allow garbage collection of nodes
    const sums = new WeakMap();
    let maxSum = -Infinity;

    // Define traversal phases
    const phases = {
      visitLeft: 0, // Need to process left subtree
      visitRight: 1, // Need to process right subtree
      processNode: 2, // Ready to process current node
    };

    // Initialize stack with root node
    const stack = [
      {
        node: this.#root,
        phase: phases.visitLeft,
      },
    ];

    while (stack.length) {
      const current = stack[stack.length - 1];

      if (current.phase === phases.visitLeft) {
        // Visit left child first
        current.phase = phases.visitRight;
        if (current.node.left) {
          stack.push({
            node: current.node.left,
            phase: phases.visitLeft,
          });
        }
      } else if (current.phase === phases.visitRight) {
        // Visit right child next
        current.phase = phases.processNode;
        if (current.node.right) {
          stack.push({
            node: current.node.right,
            phase: phases.visitLeft,
          });
        }
      } else {
        // Process current node after both children
        stack.pop();
        const node = current.node;

        // Get sums from children (0 if no child exists)
        const leftSum = node.left ? sums.get(node.left) : 0;
        const rightSum = node.right ? sums.get(node.right) : 0;

        // Calculate max path including current node and best child paths
        const pathSum = node.value + Math.max(0, leftSum + rightSum);
        maxSum = Math.max(maxSum, pathSum);

        // Store best single path for parent nodes
        sums.set(node, node.value + Math.max(0, leftSum, rightSum));
      }
    }

    // Handle case where root might be best path by itself
    return Math.max(maxSum, this.#root.value);
  }

  /** Check if two nodes are cousins (same depth but different parents) */
  areCousins(node1, node2) {
    if (!this.#root) return false;
    if (node1 === this.#root || node2 === this.#root) return false;
    if (node1 === node2) return false;

    const info = {
      depth1: null,
      depth2: null,
      parent1: null,
      parent2: null,
    };

    this.#traverse(({ node, depth, parent }) => {
      if (node === node1) {
        info.depth1 = depth;
        info.parent1 = parent;
      } else if (node === node2) {
        info.depth2 = depth;
        info.parent2 = parent;
      }
    });

    return (
      info.depth1 === info.depth2 &&
      info.parent1 !== info.parent2 &&
      info.depth1 !== null &&
      info.parent1 !== null
    );
  }

  /** Find lowest common ancestor of two nodes */
  lowestCommonAncestor(node1, node2) {
    const findPath = (targetNode) => {
      const stack = [this.#root];
      const paths = new Map([[this.#root, [this.#root]]]);

      while (stack.length) {
        const node = stack.pop();
        if (node === targetNode) return paths.get(node);

        for (const child of [node.right, node.left]) {
          if (child) {
            // Array destructuring and spread operator ... (ES2015+)
            paths.set(child, [...paths.get(node), child]);
            stack.push(child);
          }
        }
      }
      return null;
    };

    // Get paths from root to both nodes
    const pathToNode1 = findPath(node1);
    const pathToNode2 = findPath(node2);

    // Find where paths diverge - node before is LCA
    for (let i = 0; i < Math.min(pathToNode1.length, pathToNode2.length); i++) {
      if (pathToNode1[i] !== pathToNode2[i]) return pathToNode1[i - 1];
    }
    return pathToNode1[pathToNode1.length - 1]; // One node is ancestor of other
  }

  /** Convert tree to string for storage/transmission */
  static serialize(tree) {
    if (!tree.#root) return "[]";
    const values = [];
    const queue = [tree.#root];

    while (queue.length) {
      const node = queue.shift();
      values.push(node?.value ?? null);
      if (node?.left || node?.right) {
        queue.push(node.left);
        queue.push(node.right);
      }
    }
    /** Template literals for string interpolation (ES2015+) */
    return `[${values.join(",")}]`;
  }

  /** Rebuild tree from serialized string */
  static deserialize(serialized) {
    if (serialized === "[]") return new BinaryTree();

    const values = serialized
      .slice(1, -1)
      .split(",")
      .map((value) => (value === "null" ? null : Number(value)));

    // Create root node
    const root = new BinaryTreeNode(values[0]);
    const queue = [root];
    let index = 1;

    while (queue.length && index < values.length) {
      const node = queue.shift();

      // Attach left child
      if (values[index] !== null) {
        node.left = new BinaryTreeNode(values[index]);
        queue.push(node.left);
      }
      index++;

      // Attach right child
      if (index < values.length && values[index] !== null) {
        node.right = new BinaryTreeNode(values[index]);
        queue.push(node.right);
      }
      index++;
    }

    return new BinaryTree(root);
  }
}

/** ES modules export syntax (ES2015+) */
module.exports = { BinaryTree, BinaryTreeNode };
