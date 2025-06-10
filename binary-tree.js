const { getVisualTreeString } = require("./tree-visualizer");

/** Modern class syntax instead of function constructors and prototypes */
/**
 * Represents a node in a binary tree.
 * Each node holds a value and can have references to a left and a right child node.
 */
class BinaryTreeNode {
  /**
   * Creates a new instance of a tree node.
   * @param {*} value - The data to be stored in the node.
   * @param {BinaryTreeNode | null} leftChild - The left child of this node. Defaults to null if not provided.
   * @param {BinaryTreeNode | null} rightChild - The right child of this node. Defaults to null if not provided.
   */
  constructor(value, leftChild = null, rightChild = null) {
    this.value = value; // The data stored at this node.
    this.left = leftChild; // Reference to the left child node.
    this.right = rightChild; // Reference to the right child node.
  }
}

/**
 * Represents a binary tree structure.
 * A binary tree is a collection of nodes, starting from a single 'root' node.
 * Each node can have at most two children: a left child and a right child.
 */
class BinaryTree {
  /**
   * The root node of the binary tree.
   * This field is private to ensure controlled access from within the class.
   */
  #root;

  /**
   * Creates a new binary tree.
   * @param {BinaryTreeNode | null} rootNode - The root node of the tree. Defaults to null for an empty tree.
   */
  constructor(rootNode = null) {
    // Assigns rootNode if provided and not null/undefined, otherwise defaults to null.
    this.#root = rootNode ?? null;
  }

  /**
   * A private helper method for traversing the tree using Breadth-First Search (BFS).
   * BFS explores the tree level by level.
   * Intended for internal use by other methods within the BinaryTree class.
   *
   * @param {function} callback - A function to be executed for each node visited during traversal.
   *                              This callback function receives an object containing:
   *                              { node: BinaryTreeNode, depth: number, parent: BinaryTreeNode | null }.
   */
  #traverse(callback) {
    // If the tree is empty, there's nothing to traverse.
    if (!this.#root) return;

    // We use a queue to keep track of nodes to visit for BFS.
    // Each item stores the node, its depth, and its parent.
    const queue = [
      {
        node: this.#root, // Start traversal with the root node.
        depth: 1, // The depth of the root node is conventionally 1.
        parent: null, // The root node has no parent.
      },
    ];

    // Continue the traversal as long as there are nodes in the queue to visit.
    while (queue.length > 0) {
      // Dequeue and extract node, depth, and parent from the next item.
      const { node, depth, parent } = queue.shift();

      // Execute the provided callback function with the current node's information.
      callback({ node, depth, parent });

      // If the current node has a left child, add it to the queue.
      if (node.left) {
        queue.push({
          node: node.left,
          depth: depth + 1, // The child's depth is one more than its parent's.
          parent: node, // The current node is the parent of its left child.
        });
      }

      // If the current node has a right child, add it to the queue.
      if (node.right) {
        queue.push({
          node: node.right,
          depth: depth + 1,
          parent: node,
        });
      }
    }
  }

  /**
   * Finds the minimum depth of the tree.
   * The minimum depth is the length of the shortest path from the root node to any leaf node.
   * A leaf node is a node that has no children.
   * This method uses Breadth-First Search (BFS).
   *
   * @returns {number} The minimum depth of the tree. Returns 0 if the tree is empty.
   */
  minDepth() {
    let visualString;
    if (!this.#root) {
      visualString = getVisualTreeString(
        // Use imported function
        this.#root, // Pass this.#root
        "minDepth - result (empty tree)"
      );
      console.log(visualString);
      return 0;
    }

    const queue = [{ node: this.#root, depth: 1, path: [this.#root] }];
    let resultPath = [];
    let minDepthValue = 0;

    while (queue.length > 0) {
      const { node, depth, path } = queue.shift();
      if (!node.left && !node.right) {
        minDepthValue = depth;
        resultPath = path;
        break; // Found the shortest path to a leaf
      }
      if (node.left) {
        queue.push({
          node: node.left,
          depth: depth + 1,
          path: [...path, node.left],
        });
      }
      if (node.right) {
        queue.push({
          node: node.right,
          depth: depth + 1,
          path: [...path, node.right],
        });
      }
    }
    visualString = getVisualTreeString(
      // Use imported function
      this.#root, // Pass this.#root
      `minDepth - result (depth: ${minDepthValue})`,
      new Set(resultPath)
    );
    console.log(visualString);
    return minDepthValue;
  }

  /**
   * Finds the maximum depth of the tree.
   * The maximum depth is the length of the longest path from the root node to any leaf node.
   * This method utilizes the private #traverse (BFS) helper method.
   *
   * @returns {number} The maximum depth of the tree. Returns 0 if the tree is empty.
   */
  maxDepth() {
    let visualString;
    if (!this.#root) {
      visualString = getVisualTreeString(
        // Use imported function
        this.#root, // Pass this.#root
        "maxDepth - result (empty tree)"
      );
      console.log(visualString);
      return 0;
    }

    let maxDepthValue = 0;
    const nodesAtMaxDepth = new Set();

    this.#traverse(({ node, depth }) => {
      if (depth > maxDepthValue) {
        maxDepthValue = depth;
        nodesAtMaxDepth.clear();
        nodesAtMaxDepth.add(node);
      } else if (depth === maxDepthValue) {
        nodesAtMaxDepth.add(node);
      }
    });
    visualString = getVisualTreeString(
      // Use imported function
      this.#root, // Pass this.#root
      `maxDepth - result (depth: ${maxDepthValue})`,
      nodesAtMaxDepth
    );
    console.log(visualString);
    return maxDepthValue;
  }

  /**
   * Finds the smallest value in the tree that is strictly larger than a given 'lowerBound'.
   * This method performs a Breadth-First Search (BFS).
   *
   * @param {number} lowerBound - The value to compare against.
   * @returns {number | null} The smallest value found that is greater than 'lowerBound', or null if none exists.
   */
  nextLarger(lowerBound) {
    let visualString;
    if (!this.#root) {
      visualString = getVisualTreeString(
        // Use imported function
        this.#root, // Pass this.#root
        `nextLarger - result for ${lowerBound} (empty tree)`
      );
      console.log(visualString);
      return null;
    }

    let smallestLargerNode = null;
    const queue = [this.#root];

    while (queue.length > 0) {
      const node = queue.shift();
      if (node.value > lowerBound) {
        if (
          smallestLargerNode === null ||
          node.value < smallestLargerNode.value
        ) {
          smallestLargerNode = node;
        }
      }
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    const highlights = new Set();
    if (smallestLargerNode) highlights.add(smallestLargerNode);
    const resultValue = smallestLargerNode ? smallestLargerNode.value : null;
    visualString = getVisualTreeString(
      // Use imported function
      this.#root, // Pass this.#root
      `nextLarger - result for ${lowerBound} (found: ${resultValue})`,
      highlights
    );
    console.log(visualString);
    return resultValue;
  }

  /**
   * Finds the maximum sum of a path in the binary tree.
   * A "path" can start and end at any node. It can "turn" at a node
   * (e.g., left child -> node -> right child).
   * Uses iterative post-order traversal.
   * Post-order (Left, Right, Node) is chosen because when evaluating a node,
   * max path sums from its children (needed for calculation) are already computed.
   *
   * @returns {number} The maximum path sum. Returns 0 if empty.
   *                   If all nodes are negative, returns the largest (least negative) node value.
   */
  maxSum() {
    let visualString;
    if (!this.#root) {
      visualString = getVisualTreeString(
        this.#root,
        "maxSum - result (empty tree)"
      ); // Use imported function
      console.log(visualString);
      return 0;
    }

    // sums stores { sum: max path sum ending at this node and going downwards }
    const sums = new WeakMap();
    let overallMaxSum = -Infinity;
    // bestPathInfo stores details about the path that currently yields overallMaxSum
    let bestPathInfo = {
      peakNode: null, // The "highest" node in the max sum path, or the node where the path "turns"
      leftPathSum: 0, // The sum of the path extending leftwards from peakNode (if positive)
      rightPathSum: 0, // The sum of the path extending rightwards from peakNode (if positive)
    };

    const phases = { visitLeft: 0, visitRight: 1, processNode: 2 };
    const stack = [{ node: this.#root, phase: phases.visitLeft }];

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const node = current.node;
      if (current.phase === phases.visitLeft) {
        current.phase = phases.visitRight;
        if (node.left) stack.push({ node: node.left, phase: phases.visitLeft });
      } else if (current.phase === phases.visitRight) {
        current.phase = phases.processNode;
        if (node.right)
          stack.push({ node: node.right, phase: phases.visitLeft });
      } else {
        stack.pop();
        const leftData = node.left ? sums.get(node.left) : null;
        const rightData = node.right ? sums.get(node.right) : null;

        // Max sum of a path ending at node.left/right and going downwards
        const leftDownwardSum = leftData ? leftData.sum : 0;
        const rightDownwardSum = rightData ? rightData.sum : 0;

        // Max sum of a path that "turns" at `node`
        const sumThroughNode =
          node.value +
          Math.max(0, leftDownwardSum) +
          Math.max(0, rightDownwardSum);

        if (sumThroughNode > overallMaxSum) {
          overallMaxSum = sumThroughNode;
          bestPathInfo = {
            peakNode: node,
            leftPathSum: Math.max(0, leftDownwardSum),
            rightPathSum: Math.max(0, rightDownwardSum),
          };
        }

        // Handle cases where all nodes are negative; overallMaxSum should be the largest single node value.
        // This check ensures that if sumThroughNode is less than a single node's value (e.g. all negative tree),
        // the single node value is considered.
        if (node.value > overallMaxSum) {
          overallMaxSum = node.value;
          bestPathInfo = { peakNode: node, leftPathSum: 0, rightPathSum: 0 };
        }

        // Max sum of a path ending at `node` (and going downwards, for parent's calculation)
        const sumForParent =
          node.value + Math.max(0, leftDownwardSum, rightDownwardSum);
        sums.set(node, { sum: sumForParent });
      }
    }

    const highlightedPathNodes = new Set();
    if (bestPathInfo.peakNode) {
      highlightedPathNodes.add(bestPathInfo.peakNode);

      // Helper to trace a single downward path that contributes positively
      const traceSingleDownwardPath = (nodeToStartTrace, pathSet) => {
        let current = nodeToStartTrace;
        while (current) {
          pathSet.add(current);
          const nodeData = sums.get(current);
          // nodeData.sum is current.value + max(0, best_grandchild_branch_L, best_grandchild_branch_R)

          // If nodeData.sum is just current.value, it means no positive children path
          if (!nodeData || nodeData.sum <= current.value) {
            break;
          }

          const leftChild = current.left;
          const rightChild = current.right;
          // Get the sum of the best downward path starting from leftChild/rightChild
          const leftChildBranchSum =
            leftChild && sums.has(leftChild)
              ? sums.get(leftChild).sum
              : -Infinity; // Use -Infinity to correctly compare
          const rightChildBranchSum =
            rightChild && sums.has(rightChild)
              ? sums.get(rightChild).sum
              : -Infinity;

          // We need to choose the child that contributed to nodeData.sum
          // nodeData.sum = current.value + Math.max(0, leftChildBranchSum, rightChildBranchSum)
          // So, if leftChildBranchSum was chosen and > 0:
          if (
            leftChildBranchSum > 0 &&
            leftChildBranchSum >= rightChildBranchSum
          ) {
            current = leftChild;
          } else if (rightChildBranchSum > 0) {
            // If rightChildBranchSum was chosen and > 0
            current = rightChild;
          } else {
            break; // No positive child branch contributed
          }
        }
      };

      // If leftPathSum (which is max(0, leftDownwardSum from peak's left child)) is > 0,
      // it means the left child and its best downward path contributed.
      if (bestPathInfo.leftPathSum > 0 && bestPathInfo.peakNode.left) {
        traceSingleDownwardPath(
          bestPathInfo.peakNode.left,
          highlightedPathNodes
        );
      }
      // Similarly for the right path
      if (bestPathInfo.rightPathSum > 0 && bestPathInfo.peakNode.right) {
        traceSingleDownwardPath(
          bestPathInfo.peakNode.right,
          highlightedPathNodes
        );
      }
    }

    visualString = getVisualTreeString(
      // Use imported function
      this.#root, // Pass this.#root
      `maxSum - result (sum: ${overallMaxSum})`,
      highlightedPathNodes
    );
    console.log(visualString);
    return overallMaxSum;
  }

  /**
   * Checks if two nodes in the tree are "cousins".
   * Cousin nodes are at the same depth but have different parents.
   *
   * @param {BinaryTreeNode} node1 - The first node.
   * @param {BinaryTreeNode} node2 - The second node.
   * @returns {boolean} True if cousins, false otherwise.
   */
  areCousins(node1, node2) {
    const highlights = new Set();
    if (node1) highlights.add(node1);
    if (node2) highlights.add(node2);
    let visualString;
    if (
      !this.#root ||
      node1 === this.#root ||
      node2 === this.#root ||
      node1 === node2
    ) {
      visualString = getVisualTreeString(
        // Use imported function
        this.#root, // Pass this.#root
        "areCousins - result (false due to basic checks)",
        highlights
      );
      console.log(visualString);
      return false;
    }
    const info = { depth1: null, parent1: null, depth2: null, parent2: null };
    this.#traverse(({ node, depth, parent }) => {
      if (node === node1) {
        info.depth1 = depth;
        info.parent1 = parent;
      } else if (node === node2) {
        info.depth2 = depth;
        info.parent2 = parent;
      }
    });
    const areTheyCousins =
      info.depth1 !== null &&
      info.depth2 !== null &&
      info.depth1 === info.depth2 &&
      info.parent1 !== info.parent2;
    visualString = getVisualTreeString(
      // Use imported function
      this.#root, // Pass this.#root
      `areCousins - result (${areTheyCousins})`,
      highlights
    );
    console.log(visualString);
    return areTheyCousins;
  }

  /**
   * Finds the Lowest Common Ancestor (LCA) of two given nodes.
   * The LCA is the deepest node that has both node1 and node2 as descendants.
   *
   * @param {BinaryTreeNode} node1 - The first node.
   * @param {BinaryTreeNode} node2 - The second node.
   * @returns {BinaryTreeNode | null} The LCA node, or null if not found or nodes are not in the tree.
   */
  lowestCommonAncestor(node1, node2) {
    const findPath = (targetNode) => {
      if (!this.#root) return null;
      const queue = [{ node: this.#root, path: [this.#root] }];

      while (queue.length > 0) {
        const { node, path } = queue.shift();
        if (node === targetNode) return path;
        if (node.left)
          queue.push({ node: node.left, path: [...path, node.left] });
        if (node.right)
          queue.push({ node: node.right, path: [...path, node.right] });
      }
      return null;
    };

    const pathToNode1 = findPath(node1);
    const pathToNode2 = findPath(node2);

    const highlights = new Set();
    if (pathToNode1) pathToNode1.forEach((node) => highlights.add(node));
    if (pathToNode2) pathToNode2.forEach((node) => highlights.add(node));

    let visualString;
    if (!pathToNode1 || !pathToNode2) {
      visualString = getVisualTreeString(
        // Use imported function
        this.#root, // Pass this.#root
        "lowestCommonAncestor - result (one or both nodes not found)",
        highlights
      );
      console.log(visualString);
      return null;
    }

    let lcaNode = null;
    for (let i = 0; i < Math.min(pathToNode1.length, pathToNode2.length); i++) {
      if (pathToNode1[i] === pathToNode2[i]) {
        lcaNode = pathToNode1[i];
      } else {
        break;
      }
    }

    const lcaValue = lcaNode ? lcaNode.value : null;
    visualString = getVisualTreeString(
      // Use imported function
      this.#root, // Pass this.#root
      `lowestCommonAncestor - result (LCA: ${lcaValue})`,
      highlights
    );
    console.log(visualString);
    return lcaNode;
  }

  /**
   * Converts the binary tree into a plain object representation.
   * The resulting object mirrors the structure of the tree, with each node represented as an object
   * containing its value and references to its left and right children (if any).
   *
   * @returns {Object} The plain object representation of the binary tree.
   */
  toObject() {
    if (!this.#root) return null;
    const result = {};
    this.#_buildObjectRecursive(this.#root, result, "root");
    return result;
  }

  /**
   * @private
   * A recursive helper method for `toObject`.
   * Builds the object representation of the tree by traversing it and adding each node's data
   * to the provided result object.
   *
   * @param {BinaryTreeNode} node - The current node being visited.
   * @param {Object} result - The object where the tree's data is being accumulated.
   * @param {string} nodeName - The name/key for the current node in the result object.
   */
  #_buildObjectRecursive(node, result, nodeName) {
    if (!node) return;
    result[nodeName] = { value: node.value };
    if (node.left || node.right) {
      result[nodeName].children = {};
      if (node.left) {
        this.#_buildObjectRecursive(
          node.left,
          result[nodeName].children,
          "left"
        );
      }
      if (node.right) {
        this.#_buildObjectRecursive(
          node.right,
          result[nodeName].children,
          "right"
        );
      }
    }
  }

  /**
   * Visualizes the tree structure in the console using the centered-slash style.
   */
  visualize() {
    const visualString = getVisualTreeString(this.#root, "Visualization"); // Use imported function
    console.log(visualString);
  }

  /**
   * Serializes (converts) the binary tree into a string format.
   * Uses level-order traversal (BFS). Null nodes are represented as 'null'.
   *
   * @param {BinaryTree} tree - The binary tree to be serialized.
   * @returns {string} The serialized string representation of the tree.
   */
  static serialize(tree) {
    if (tree && tree.#root) {
      // Check if tree and root exist
      console.log(getVisualTreeString(tree.#root, "serialize - input tree"));
    } else {
      console.log("\n--- serialize - input tree ---");
      console.log(
        !tree || !(tree instanceof BinaryTree) || !tree.#root // More robust check
          ? "<empty tree or invalid tree object>"
          : "Tree object provided, but _getVisualTreeString not available." // This message might be obsolete
      );
      console.log("------------------------------------------");
    }
    if (!tree || !tree.#root) return "[]";
    const result = [];
    const queue = [tree.#root];

    while (queue.length > 0) {
      const node = queue.shift();
      if (node) {
        result.push(node.value);
        queue.push(node.left);
        queue.push(node.right);
      } else {
        result.push(null);
      }
    }

    // Remove trailing nulls for a cleaner output
    while (result.length > 0 && result[result.length - 1] === null) {
      result.pop();
    }

    const serializedString = JSON.stringify(result);
    console.log(`--- serialize - output string: ${serializedString} ---`);
    return serializedString;
  }

  /**
   * Rebuilds (deserializes) a binary tree from its string representation.
   * Expects format from `serialize` (level-order with 'null' for missing children).
   *
   * @param {string} serialized - The serialized string representation of the tree.
   * @returns {BinaryTree} The deserialized binary tree.
   */
  static deserialize(serialized) {
    console.log(`\n--- Deserializing input: ${serialized} ---`);
    if (serialized === "[]") return new BinaryTree();
    const contentWithoutBrackets = serialized.slice(1, -1);
    const stringValuesArray = contentWithoutBrackets.split(",");
    const values = stringValuesArray.map((valueStr) => {
      if (valueStr === "null" || valueStr === "") return null;
      return Number(valueStr);
    });
    if (values.length === 0 || values[0] === null) return new BinaryTree();
    const rootNode = new BinaryTreeNode(values[0]);
    const tree = new BinaryTree(rootNode);
    const buildQueue = [rootNode];
    let parentIdx = 0,
      valueIdx = 1;
    const numValuesToProcess = values.length;
    while (valueIdx < numValuesToProcess && parentIdx < buildQueue.length) {
      const parentNode = buildQueue[parentIdx++];
      if (valueIdx < numValuesToProcess) {
        const leftVal = values[valueIdx++];
        if (leftVal !== null) {
          parentNode.left = new BinaryTreeNode(leftVal);
          buildQueue.push(parentNode.left);
        }
      }
      if (valueIdx < numValuesToProcess) {
        const rightVal = values[valueIdx++];
        if (rightVal !== null) {
          parentNode.right = new BinaryTreeNode(rightVal);
          buildQueue.push(parentNode.right);
        }
      }
    }
    if (tree.#root) {
      // Check if tree and root exist
      console.log(getVisualTreeString(tree.#root, "deserialize - output tree"));
    }
    return tree;
  }
}

module.exports = { BinaryTree, BinaryTreeNode };
