/** Node class for Binary Tree - each node has a value and up to two children */
class BinaryTreeNode {
  constructor(val, left = null, right = null) {
    this.val = val; // Value stored in the node
    this.left = left; // Left child reference (null if no left child)
    this.right = right; // Right child reference (null if no right child)
  }
}

/** Binary Tree class - a data structure with a root node and child nodes arranged in a tree */
class BinaryTree {
  constructor(root = null) {
    this.root = root; // Root node of the tree (null for empty tree)
  }

  /** Helper method that performs Breadth-First Search traversal
   * BFS visits nodes level by level, from left to right
   * fn is a callback function that processes each node */
  _traverse(fn) {
    if (!this.root) return null; // Empty tree case
    // Queue to track nodes to visit, starting with root
    const queue = [
      {
        node: this.root, // Current node
        depth: 1, // Level in tree (root is level 1)
        parent: null, // Parent node reference
      },
    ];
    let result = null;

    // Process nodes while queue has entries
    while (queue.length) {
      const current = queue.shift(); // Get next node from front of queue
      const fnResult = fn(current); // Process current node
      if (fnResult !== undefined) result = fnResult;

      // Add any children to queue for later processing
      ["left", "right"].forEach((dir) => {
        const child = current.node[dir];
        if (child) {
          queue.push({
            node: child,
            depth: current.depth + 1, // Child is one level deeper
            parent: current.node, // Keep track of parent
          });
        }
      });
    }
    return result;
  }

  /** Find shortest path from root to any leaf node
   * A leaf node is one with no children */
  minDepth() {
    if (!this.root) return 0; // Empty tree has depth 0
    const queue = [{ node: this.root, depth: 1 }];

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
    if (!this.root) return 0;
    let max = 0;
    // Track maximum depth seen during traversal
    this._traverse(({ depth }) => void (max = Math.max(max, depth)));
    return max;
  }

  /** Find smallest value in tree that is larger than x */
  nextLarger(x) {
    if (!this.root) return null;
    let result = null;
    const queue = [this.root];

    while (queue.length) {
      const node = queue.shift();
      // Update result if we find a smaller value that's still bigger than x
      if (node.val > x && (!result || node.val < result)) {
        result = node.val;
      }
      // Add children to continue search
      node.left && queue.push(node.left);
      node.right && queue.push(node.right);
    }
    return result;
  }

  /** Find path through tree with largest sum of node values */
  maxSum() {
    if (!this.root) return 0;
    let maxSum = -Infinity;
    // Use stack for depth-first traversal
    const stack = [{ node: this.root, phase: 0, sum: 0 }];
    const sums = new Map(); // Track sums for subtrees

    while (stack.length) {
      const { node, phase } = stack[stack.length - 1];

      // Process node in phases: left child, right child, node itself
      if (phase === 0) {
        // Process left subtree
        stack[stack.length - 1].phase = 1;
        node.left && stack.push({ node: node.left, phase: 0, sum: 0 });
      } else if (phase === 1) {
        // Process right subtree
        stack[stack.length - 1].phase = 2;
        node.right && stack.push({ node: node.right, phase: 0, sum: 0 });
      } else {
        // Process current node
        const current = stack.pop();
        // Get sums from children
        const leftSum = node.left ? sums.get(node.left) : 0;
        const rightSum = node.right ? sums.get(node.right) : 0;
        // Calculate sums including current node
        const totalSum = node.val + Math.max(0, leftSum, rightSum);
        const pathSum = node.val + Math.max(0, leftSum + rightSum);

        sums.set(node, totalSum);
        maxSum = Math.max(maxSum, pathSum);
      }
    }
    return Math.max(maxSum, this.root.val);
  }

  /** Check if two nodes are cousins (same depth but different parents) */
  areCousins(n1, n2) {
    let d1, d2, p1, p2;
    // Find depth and parent for both nodes
    this._traverse(({ node, depth, parent }) => {
      if (node === n1) [d1, p1] = [depth, parent];
      if (node === n2) [d2, p2] = [depth, parent];
    });
    // Cousins: same depth, different parents
    return d1 === d2 && p1 !== p2;
  }

  /** Find lowest common ancestor of two nodes
   * LCA is the deepest node that has both nodes in its subtrees */
  lowestCommonAncestor(n1, n2) {
    // Helper to find path from root to node
    const findPath = (node) => {
      const stack = [this.root];
      const paths = new Map([[this.root, [this.root]]]);

      while (stack.length) {
        const curr = stack.pop();
        if (curr === node) return paths.get(curr);

        // Try to find node in subtrees
        for (const child of [curr.right, curr.left]) {
          if (child) {
            paths.set(child, [...paths.get(curr), child]);
            stack.push(child);
          }
        }
      }
      return null;
    };

    // Get paths from root to both nodes
    const path1 = findPath(n1);
    const path2 = findPath(n2);

    // Find where paths diverge - node before is LCA
    for (let i = 0; i < Math.min(path1.length, path2.length); i++) {
      if (path1[i] !== path2[i]) return path1[i - 1];
    }
    return path1[path1.length - 1]; // One node is ancestor of other
  }

  /** Convert tree to string for storage/transmission */
  static serialize(tree) {
    if (!tree.root) return "[]";
    const vals = [],
      queue = [tree.root];

    // BFS traversal to get node values in level order
    while (queue.length) {
      const node = queue.shift();
      vals.push(node ? node.val : null); // null for missing nodes
      node && queue.push(node.left, node.right);
    }

    // Remove trailing nulls to save space
    while (vals[vals.length - 1] === null) vals.pop();
    return JSON.stringify(vals);
  }

  /** Recreate tree from serialized string */
  static deserialize(str) {
    const vals = JSON.parse(str);
    if (!vals.length) return new BinaryTree();

    // Create root node
    const root = new BinaryTreeNode(vals[0]);
    const queue = [root];

    // Rebuild tree level by level
    for (let i = 1; i < vals.length; i += 2) {
      const curr = queue.shift();
      // Create and link left child if exists
      if (vals[i] !== null) {
        curr.left = new BinaryTreeNode(vals[i]);
        queue.push(curr.left);
      }
      // Create and link right child if exists
      if (i + 1 < vals.length && vals[i + 1] !== null) {
        curr.right = new BinaryTreeNode(vals[i + 1]);
        queue.push(curr.right);
      }
    }
    return new BinaryTree(root);
  }
}

module.exports = { BinaryTree, BinaryTreeNode };
