/** BinaryTreeNode: node for a general tree. */
class BinaryTreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

class BinaryTree {
  constructor(root = null) {
    this.root = root;
  }

  /** Traverse tree with configurable options
   * @param {Object} options - Configuration options
   * @param {boolean} options.useStack - Use stack (DFS) instead of queue (BFS)
   * @param {boolean} options.trackPath - Track path from root to current node
   * @param {boolean} options.trackParent - Track parent references
   * @param {boolean} options.trackDepth - Track node depths
   * @param {Function} options.processor - Node processing callback
   * @param {Object} options.initialState - Additional state to track
   * @return {*} Result from processor if any
   */
  _traverse(options = {}) {
    // Destructure with meaningful defaults
    const traversalConfig = {
      useStack: false, // BFS by default
      trackPath: false, // Don't track paths by default
      trackParent: false, // Don't track parents by default
      trackDepth: false, // Don't track depth by default
      processor: null, // No processing by default
      initialState: {}, // No initial state by default
      ...options,
    };

    const {
      useStack,
      trackPath,
      trackParent,
      trackDepth,
      processor,
      initialState,
    } = traversalConfig;

    if (!this.root) return null;

    const collection = [
      {
        node: this.root,
        path: trackPath ? [this.root] : undefined,
        parent: null,
        depth: trackDepth ? 1 : undefined,
        ...initialState,
      },
    ];

    while (collection.length) {
      const current = useStack ? collection.pop() : collection.shift();

      // Process current node if callback provided
      if (processor) {
        const result = processor(current, collection);
        if (result !== undefined) return result;
      }

      // Add children in correct order
      const children = useStack ? ["right", "left"] : ["left", "right"];
      for (const dir of children) {
        const child = current.node[dir];
        if (child) {
          collection.push({
            node: child,
            path: trackPath ? [...current.path, child] : undefined,
            parent: trackParent ? current.node : undefined,
            depth: trackDepth ? current.depth + 1 : undefined,
            ...initialState,
          });
        }
      }
    }

    return null;
  }

  /** Add children to collection with additional properties
   * @param {BinaryTreeNode} node - Parent node
   * @param {Object} properties - Properties to add to children
   * @param {Array} collection - Collection to add children to
   */
  _addChildren(node, properties = {}, collection) {
    ["left", "right"].forEach((dir) => {
      const child = node[dir];
      if (child) {
        collection.push({ node: child, ...properties });
      }
    });
  }

  /** Return minimum depth from root to nearest leaf
   * @return {number} Minimum depth
   */
  minDepth() {
    return (
      this._traverse({
        trackDepth: true,
        processor: ({ node, depth }) =>
          !node.left && !node.right ? depth : undefined,
      }) || 0
    );
  }

  /** Return maximum depth from root to farthest leaf
   * @return {number} Maximum depth
   */
  maxDepth() {
    let max = 0;
    this._traverse({
      trackDepth: true,
      processor: ({ depth }) => {
        max = Math.max(max, depth);
      },
    });
    return max;
  }

  /** Create tracker object for node path sums
   * @param {BinaryTreeNode} node - Node to track
   * @return {Object} Tracker object
   */
  _createPathTracker(node) {
    return {
      node,
      visitState: "visiting",
      leftSum: 0,
      rightSum: 0,
      visited: new Set(),
      sums: [0, 0], // Add this line to initialize sums array
    };
  }

  /** Update parent node's path sums based on child
   * @param {Array} stack - Stack of nodes being processed
   */
  _updateParentSum(stack) {
    if (stack.length < 2) return;
    const child = stack.at(-1);
    const parent = stack.at(-2);

    // Calculate best path through child
    const childVal = child.node.val;
    const bestChildPath = Math.max(
      0,
      childVal + Math.max(child.leftSum, child.rightSum)
    );

    // Update parent's appropriate sum
    if (parent.visitState === "left") {
      parent.leftSum = bestChildPath;
    } else if (parent.visitState === "right") {
      parent.rightSum = bestChildPath;
    }
  }

  /** Calculate maximum path sum through given node
   * @param {Object} tracker - Node tracker object
   * @return {number} Maximum path sum
   */
  _calculateNodePathSum(tracker) {
    const { node, leftSum, rightSum } = tracker;

    const combinedPathSum = leftSum + rightSum;
    const bestSinglePath = Math.max(leftSum, rightSum);
    const bestPathOption = Math.max(0, combinedPathSum, bestSinglePath);

    return node.val + bestPathOption;
  }

  /** Process path sums for a node
   * @param {BinaryTreeNode} node - Current node
   * @param {number} leftSum - Left subtree sum
   * @param {number} rightSum - Right subtree sum
   * @return {Object} Path sum results
   */
  _processPathSums(node, leftSum = 0, rightSum = 0) {
    const val = node.val;
    return {
      pathSum: val + Math.max(0, leftSum + rightSum, leftSum, rightSum),
      bestChildSum: Math.max(0, val + Math.max(leftSum, rightSum)),
    };
  }

  /** Handle visiting a node in traversal
   * @param {BinaryTreeNode} node - Node to visit
   * @param {Set} visited - Set of visited directions
   * @param {string} direction - Direction being visited
   * @return {boolean} Whether visit was processed
   */
  _handleNodeVisit(node, visited, direction) {
    if (!visited.has(direction) && node[direction]) {
      visited.add(direction);
      return true;
    }
    return false;
  }

  /** Generic visit state handler */
  _processVisit(node, visited, stack, type) {
    if (this._handleNodeVisit(node, visited, type)) {
      stack.push({
        node: node[type],
        visited: new Set(),
        sums: [0, 0],
      });
      return true;
    }
    return false;
  }

  /** Calculate path sums for a node and its subtrees
   * @param {BinaryTreeNode} node - Current node
   * @param {Function} updateMax - Callback to update max sum
   * @return {number} Maximum path sum through this node
   */
  _calculatePathSums(node, updateMax) {
    if (!node) return 0;

    const leftPathSum = Math.max(
      0,
      this._calculatePathSums(node.left, updateMax)
    );
    const rightPathSum = Math.max(
      0,
      this._calculatePathSums(node.right, updateMax)
    );
    const totalPathSum = node.val + leftPathSum + rightPathSum;

    updateMax(totalPathSum);
    return node.val + Math.max(leftPathSum, rightPathSum);
  }

  /** Return maximum sum you can obtain by traveling along a path in the tree
   * @return {number} Maximum path sum
   */
  maxSum() {
    if (!this.root) return 0;
    let maxSum = -Infinity;

    this._calculatePathSums(this.root, (sum) => {
      maxSum = Math.max(maxSum, sum);
    });

    return Math.max(0, maxSum);
  }

  /** nextLarger(lowerBound): return the smallest value in the tree
   * which is larger than lowerBound. Return null if no such value exists. */

  nextLarger(lowerBound) {
    if (!this.root) return null;

    let smallest = null;
    this._traverse({
      processor: ({ node }) => {
        if (node.val > lowerBound) {
          if (smallest === null || node.val < smallest) {
            smallest = node.val;
          }
        }
      },
    });

    return smallest;
  }

  /** Further study!
   * areCousins(node1, node2): determine whether two nodes are cousins
   * (i.e. are at the same level but have different parents. ) */

  /** Check if two nodes are cousins (same depth, different parents) */
  areCousins(node1, node2) {
    if (!this.root) return false;

    const queue = [
      {
        node: this.root,
        parent: null,
        depth: 0,
      },
    ];

    let info1 = null;
    let info2 = null;

    while (queue.length && (!info1 || !info2)) {
      const current = queue.shift();

      if (current.node === node1) {
        info1 = { parent: current.parent, depth: current.depth };
      }
      if (current.node === node2) {
        info2 = { parent: current.parent, depth: current.depth };
      }

      if (current.node.left) {
        queue.push({
          node: current.node.left,
          parent: current.node,
          depth: current.depth + 1,
        });
      }
      if (current.node.right) {
        queue.push({
          node: current.node.right,
          parent: current.node,
          depth: current.depth + 1,
        });
      }
    }

    return !!(
      info1 &&
      info2 &&
      info1.depth === info2.depth &&
      info1.parent !== info2.parent
    );
  }

  /** Further study!
   * serialize(tree): serialize the BinaryTree object tree into a string. */

  /** Helper for serialization to process node and add children */
  static _processNode(node, values, queue) {
    values.push(node?.val ?? null);
    node && queue.push(node.left, node.right);
  }

  static serialize(tree) {
    if (!tree?.root) return "[]";

    const values = [];
    const queue = [tree.root];

    while (queue.length) {
      const node = queue.shift();
      values.push(node?.val ?? null);
      if (node) {
        queue.push(node.left, node.right);
      }
    }

    while (values.at(-1) === null) values.pop();
    return JSON.stringify(values);
  }

  /** Helper for deserialization to add child nodes */
  static _addChildNodes(current, values, i, queue) {
    // Add left child
    if (i < values.length && values[i] !== null) {
      current.left = new BinaryTreeNode(values[i]);
      queue.push(current.left);
    }
    i++;

    // Add right child
    if (i < values.length && values[i] !== null) {
      current.right = new BinaryTreeNode(values[i]);
      queue.push(current.right);
    }
    i++;

    return i;
  }

  static deserialize(str) {
    if (str === "[]") return new BinaryTree();

    const values = JSON.parse(str);
    if (!values.length) return new BinaryTree();

    const root = new BinaryTreeNode(values[0]);
    const queue = [root];
    let i = 1;

    while (queue.length && i < values.length) {
      const current = queue.shift();
      i = this._addChildNodes(current, values, i, queue);
    }

    return new BinaryTree(root);
  }

  /** Further study!
   * lowestCommonAncestor(node1, node2): find the lowest common ancestor
   * of two nodes in a binary tree. */

  /** Compare nodes by reference or value */
  _compareNodes(node1, node2, compareValues = true) {
    return node1 === node2 || (compareValues && node1?.val === node2?.val);
  }

  /** Helper to find path from root to target */
  _findNodePath(target) {
    return this._findInTree(target, { returnPath: true });
  }

  _findNodeInfo(target) {
    return this._findInTree(target, { returnParent: true });
  }

  /** Unified helper for finding nodes and paths */
  _findInTree(target, options = {}) {
    const {
      returnPath = false,
      returnParent = false,
      customCompare = (n) => n === target,
    } = options;

    const queue = [
      {
        node: this.root,
        path: returnPath ? [this.root] : undefined,
        parent: null,
        depth: 0,
      },
    ];

    while (queue.length) {
      const current = queue.shift();

      if (customCompare(current.node)) {
        if (returnPath) return current.path;
        if (returnParent)
          return { parent: current.parent, depth: current.depth };
        return current.node;
      }

      for (const childKey of ["left", "right"]) {
        const child = current.node[childKey];
        if (child) {
          queue.push({
            node: child,
            path: returnPath ? [...current.path, child] : undefined,
            parent: current.node,
            depth: current.depth + 1,
          });
        }
      }
    }

    return null;
  }

  /** Track search state for finding nodes and paths
   * @param {BinaryTreeNode} node1 - First target node
   * @param {BinaryTreeNode} node2 - Second target node
   * @return {Object} Search state object
   */
  _createSearchState(node1, node2) {
    return {
      path1: null,
      path2: null,
      hasFoundBoth() {
        return this.path1 && this.path2;
      },
    };
  }

  /** Create initial queue item for node search
   * @return {Object} Queue item with root node info
   */
  _createInitialQueueItem() {
    return {
      node: this.root,
      path: [this.root],
    };
  }

  /** Update paths when target node is found
   * @param {Object} current - Current node info
   * @param {Object} targets - Target nodes to find
   * @param {Object} state - Current search state
   */
  _updateFoundPaths(current, { node1, node2 }, state) {
    if (current.node === node1) state.path1 = current.path;
    if (current.node === node2) state.path2 = current.path;
  }

  /** Add child nodes to search queue
   * @param {Object} parent - Parent node info
   * @param {Array} queue - Search queue
   */
  _enqueueChildNodes(parent, queue) {
    ["left", "right"].forEach((direction) => {
      const child = parent.node[direction];
      if (child) {
        queue.push({
          node: child,
          path: [...parent.path, child],
        });
      }
    });
  }

  /** Find paths from root to two target nodes
   * @param {BinaryTreeNode} node1 - First target node
   * @param {BinaryTreeNode} node2 - Second target node
   * @return {Object} Paths to both nodes
   */
  _findNodePaths(node1, node2) {
    if (!this.root) return { path1: null, path2: null };

    const searchState = this._createSearchState(node1, node2);
    const queue = [this._createInitialQueueItem()];

    while (queue.length && !searchState.hasFoundBoth()) {
      const current = queue.shift();
      this._updateFoundPaths(current, { node1, node2 }, searchState);
      this._enqueueChildNodes(current, queue);
    }

    return searchState;
  }

  /** Find lowest common ancestor from two paths
   * @param {Array} path1 - Path to first node
   * @param {Array} path2 - Path to second node
   * @return {BinaryTreeNode} Lowest common ancestor
   */
  _findCommonAncestor(path1, path2) {
    if (!path1 || !path2) return null;

    const maxCommonLength = Math.min(path1.length, path2.length);
    let lastCommonNode = null;

    for (let i = 0; i < maxCommonLength; i++) {
      if (this._compareNodes(path1[i], path2[i])) {
        lastCommonNode = path1[i];
      } else {
        break;
      }
    }

    return lastCommonNode;
  }

  /** Find lowest common ancestor of two nodes */
  lowestCommonAncestor(node1, node2) {
    // Find paths from root to each node
    const { path1, path2 } = this._findNodePaths(node1, node2);

    // Find and return lowest common ancestor
    return this._findCommonAncestor(path1, path2);
  }

  /** Process node queue with path tracking */
  _processNodeQueue(processNode, initialState = {}) {
    if (!this.root) return null;

    const queue = [
      {
        node: this.root,
        path: initialState.trackPath ? [this.root] : undefined,
        parent: null,
        depth: 0,
        ...initialState,
      },
    ];

    while (queue.length) {
      const current = queue.shift();
      const result = processNode(current);
      if (result !== undefined) return result;

      // Add children to queue with tracking
      this._addChildren(
        current.node,
        this._trackNodePath(current, current.node.left, initialState),
        queue
      );
      this._addChildren(
        current.node,
        this._trackNodePath(current, current.node.right, initialState),
        queue
      );
    }

    return null;
  }

  /** Track path information for a node
   * @param {Object} current - Current node information
   * @param {BinaryTreeNode} childNode - Child node to track
   * @param {Object} config - Tracking configuration
   * @return {Object} Path information
   */
  _trackNodePath(current, childNode, config) {
    return {
      node: childNode,
      path: config.trackPath ? [...current.path, childNode] : undefined,
      parent: config.trackParent ? current.node : undefined,
      depth: config.trackDepth ? current.depth + 1 : undefined,
      ...config.initialState,
    };
  }
}

module.exports = { BinaryTree, BinaryTreeNode };
