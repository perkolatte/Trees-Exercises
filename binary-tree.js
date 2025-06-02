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

  /** Helper function to add children to data structure with updated properties */
  _addChildren(node, properties, dataStructure) {
    const children = [node.left, node.right];
    for (let child of children) {
      if (child) {
        dataStructure.push({ node: child, ...properties });
      }
    }
  }

  /** minDepth(): return the minimum depth of the tree -- that is,
   * the length of the shortest path from the root to a leaf. */

  minDepth() {
    if (!this.root) return 0;

    let queue = [{ node: this.root, depth: 1 }];

    while (queue.length > 0) {
      let { node, depth } = queue.shift();

      // If we reach a leaf node, return its depth
      if (!node.left && !node.right) return depth;

      // Use the helper function to add children to the queue
      this._addChildren(node, { depth: depth + 1 }, queue);
    }
  }

  /** maxDepth(): return the maximum depth of the tree -- that is,
   * the length of the longest path from the root to a leaf. */

  maxDepth() {
    if (!this.root) return 0;

    let queue = [{ node: this.root, depth: 1 }];
    let maxDepth = 0;

    while (queue.length > 0) {
      let { node, depth } = queue.shift();

      // Update maxDepth to current depth if it's greater
      maxDepth = Math.max(maxDepth, depth);

      // Use the helper function to add children to the queue
      this._addChildren(node, { depth: depth + 1 }, queue);
    }

    return maxDepth;
  }

  /** Helper to track node's path sums during traversal */
  _createPathTracker(node) {
    return {
      node,
      visitState: "visiting", // States: visiting -> left -> right -> done
      leftSum: 0,
      rightSum: 0,
    };
  }

  /** Calculate maximum path sum through current node */
  _calculateNodePathSum(tracker) {
    const { node, leftSum, rightSum } = tracker;
    return node.val + leftSum + rightSum;
  }

  /** Update parent's path sums when child is done */
  _updateParentSum(stack) {
    if (stack.length < 2) return;

    const child = stack[stack.length - 1];
    const parent = stack[stack.length - 2];
    const childBestPath = Math.max(child.leftSum, child.rightSum);
    const newPathSum = Math.max(0, child.node.val + childBestPath);

    // Update appropriate parent path
    if (parent.visitState === "left") {
      parent.leftSum = newPathSum;
    } else {
      parent.rightSum = newPathSum;
    }
  }

  /** maxSum(): return the maximum sum you can obtain by traveling along a path in the tree.
   * The path can start and end at any node, but no node can be visited more than once. */
  maxSum() {
    if (!this.root) return 0;

    let maxSum = -Infinity;
    let stack = [this._createPathTracker(this.root)];

    while (stack.length > 0) {
      let current = stack[stack.length - 1];

      switch (current.visitState) {
        case "visiting":
          current.visitState = "left";
          if (current.node.left) {
            stack.push(this._createPathTracker(current.node.left));
          }
          break;

        case "left":
          current.visitState = "right";
          if (current.node.right) {
            stack.push(this._createPathTracker(current.node.right));
          }
          break;

        case "right":
          maxSum = Math.max(maxSum, this._calculateNodePathSum(current));
          this._updateParentSum(stack);
          stack.pop();
          break;
      }
    }

    return maxSum;
  }

  /** nextLarger(lowerBound): return the smallest value in the tree
   * which is larger than lowerBound. Return null if no such value exists. */

  nextLarger(lowerBound) {
    if (!this.root) return null;

    let nextLargest = null;
    let stack = [{ node: this.root }];

    while (stack.length) {
      let { node } = stack.pop();

      // Update nextLargest if current value qualifies
      if (node.val > lowerBound && (!nextLargest || node.val < nextLargest)) {
        nextLargest = node.val;
      }

      // Use existing helper to add children to stack
      this._addChildren(node, {}, stack);
    }

    return nextLargest;
  }

  /** Further study!
   * areCousins(node1, node2): determine whether two nodes are cousins
   * (i.e. are at the same level but have different parents. ) */

  /** Helper to find node info at a given depth */
  _findNodeInfo(targetNode) {
    if (!this.root || !targetNode) return null;

    let queue = [{ node: this.root, parent: null, depth: 0 }];

    while (queue.length) {
      let { node, parent, depth } = queue.shift();

      if (node === targetNode) {
        return { parent, depth };
      }

      this._addChildren(node, { parent: node, depth: depth + 1 }, queue);
    }

    return null;
  }

  /** Check if two nodes are cousins (same depth, different parents) */
  areCousins(node1, node2) {
    const node1Info = this._findNodeInfo(node1);
    const node2Info = this._findNodeInfo(node2);

    return !!(
      node1Info &&
      node2Info &&
      node1Info.depth === node2Info.depth &&
      node1Info.parent !== node2Info.parent
    );
  }

  /** Further study!
   * serialize(tree): serialize the BinaryTree object tree into a string. */

  /** Helper for serialization to process node and add children */
  static _processNodeForSerialization(node, values, queue) {
    if (node) {
      values.push(node.val);
      queue.push(node.left);
      queue.push(node.right);
    } else {
      values.push(null);
    }
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

  static serialize(tree) {
    if (!tree || !tree.root) return "[]";

    const values = [];
    const queue = [tree.root];

    while (queue.length) {
      const node = queue.shift();
      this._processNodeForSerialization(node, values, queue);
    }

    // Remove trailing nulls
    while (values[values.length - 1] === null) {
      values.pop();
    }

    return JSON.stringify(values);
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

  /** Helper to find path from root to node using iteration */
  _findNodePath(target) {
    if (!this.root || !target) return null;

    let stack = [
      {
        node: this.root,
        path: [this.root],
      },
    ];

    while (stack.length) {
      let { node, path } = stack.pop();

      // Compare node values instead of references
      if (node.val === target.val) return path;

      // Add children with their paths, reverse order for DFS
      if (node.right) {
        stack.push({
          node: node.right,
          path: [...path, node.right],
        });
      }
      if (node.left) {
        stack.push({
          node: node.left,
          path: [...path, node.left],
        });
      }
    }

    return null;
  }

  /** Find lowest common ancestor of two nodes */
  lowestCommonAncestor(node1, node2) {
    // Get paths to both nodes
    const path1 = this._findNodePath(node1);
    const path2 = this._findNodePath(node2);

    if (!path1 || !path2) return null;

    // Find where paths diverge
    let lastCommon = null;
    let i = 0;

    while (i < path1.length && i < path2.length) {
      // Compare node values instead of references
      if (path1[i].val !== path2[i].val) break;
      lastCommon = path1[i];
      i++;
    }

    return lastCommon;
  }
}

module.exports = { BinaryTree, BinaryTreeNode };
