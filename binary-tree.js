/** Modern class syntax instead of function constructors and prototypes */
/**
 * Represents a node in a binary tree.
 * Each node holds a value and can have references to a left and a right child node.
 * This uses modern JavaScript class syntax (introduced in ES2015/ES6).
 */
class BinaryTreeNode {
  /**
   * Creates a new instance of a tree node.
   * @param {*} value - The data to be stored in the node.
   * @param {BinaryTreeNode | null} leftChild - The left child of this node. Defaults to null if not provided.
   *        (Uses ES2015 default parameter values).
   * @param {BinaryTreeNode | null} rightChild - The right child of this node. Defaults to null if not provided.
   *        (Uses ES2015 default parameter values).
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
   * This is a private class field (an ES2019+ feature, denoted by the # prefix).
   * Private fields can only be accessed and modified from within the BinaryTree class itself,
   * providing encapsulation and preventing accidental external modification.
   */
  #root;

  /**
   * Creates a new binary tree.
   * @param {BinaryTreeNode | null} rootNode - The root node of the tree. Defaults to null for an empty tree.
   *        (Uses ES2015 default parameter values).
   */
  constructor(rootNode = null) {
    // The nullish coalescing operator '??' (an ES2020+ feature) is used here.
    // It means this.#root will be 'rootNode' if 'rootNode' is not null or undefined.
    // Otherwise (if 'rootNode' is null or undefined), this.#root will be assigned null.
    // This is more precise than using '||' (logical OR), which would fall back to null
    // for any "falsy" value of rootNode (like 0, false, '', etc.), not just null/undefined.
    this.#root = rootNode ?? null;
  }

  /**
   * A private helper method for traversing the tree using Breadth-First Search (BFS).
   * BFS explores the tree level by level: it visits all nodes at depth 1,
   * then all nodes at depth 2, and so on.
   * This method is private (ES2019+ feature, denoted by #) and intended for internal use
   * by other methods within the BinaryTree class (like maxDepth, areCousins).
   *
   * @param {function} callback - A function to be executed for each node visited during traversal.
   *                              This callback function receives an object containing:
   *                              { node: BinaryTreeNode, depth: number, parent: BinaryTreeNode | null }.
   */
  #traverse(callback) {
    // If the tree is empty (i.e., #root is null), there's nothing to traverse.
    if (!this.#root) return;

    // We use a queue (first-in, first-out) to keep track of nodes to visit,
    // which is characteristic of BFS.
    // Each item in the queue will be an object storing the node itself,
    // its depth in the tree, and its parent node.
    const queue = [
      {
        node: this.#root, // Start traversal with the root node.
        depth: 1, // The depth of the root node is conventionally 1.
        parent: null, // The root node has no parent.
      },
    ];

    // Continue the traversal as long as there are nodes in the queue to visit.
    while (queue.length > 0) {
      // Dequeue the next item: remove and get the first element from the queue.
      // We use object destructuring (an ES2015 feature) to conveniently extract
      // the node, depth, and parent properties from the dequeued item.
      const { node, depth, parent } = queue.shift();

      // Execute the provided callback function, passing it the information
      // about the currently visited node.
      callback({ node, depth, parent });

      // If the current node has a left child, add it to the queue to be visited later.
      if (node.left) {
        queue.push({
          node: node.left,
          depth: depth + 1, // The child's depth is one more than its parent's.
          parent: node, // The current node is the parent of its left child.
        });
      }

      // If the current node has a right child, add it to the queue as well.
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
   * This method uses Breadth-First Search (BFS) because BFS explores level by level.
   * Therefore, the first leaf node encountered during a BFS traversal will be at the minimum depth.
   *
   * @returns {number} The minimum depth of the tree. Returns 0 if the tree is empty.
   */
  minDepth() {
    // If the tree is empty (no root node), its depth is 0.
    if (!this.#root) return 0;

    // Initialize a queue for BFS. Each item stores a node and its current depth.
    // Start with the root node at depth 1.
    const queue = [{ node: this.#root, depth: 1 }];

    // Continue as long as there are nodes to process in the queue.
    while (queue.length > 0) {
      // Dequeue the current node and its depth.
      // Object destructuring (ES2015) is used for convenience.
      const { node, depth } = queue.shift();

      // Check if the current node is a leaf node (it has no left and no right child).
      if (!node.left && !node.right) {
        // If it's a leaf node, we've found the shortest path to a leaf.
        // Return its depth immediately.
        return depth;
      }

      // If the current node is not a leaf, add its existing children to the queue
      // to be visited in subsequent iterations.
      if (node.left) {
        queue.push({ node: node.left, depth: depth + 1 });
      }
      if (node.right) {
        queue.push({ node: node.right, depth: depth + 1 });
      }
    }
    // This part of the code should ideally not be reached if the tree is valid and non-empty,
    // as a leaf node (and thus a depth) would have been found and returned by the loop above.
    // For instance, a tree with only a root node is a leaf, and its depth (1) would be returned.
    // This line acts as a fallback, though the logic above should cover all valid tree structures.
    return 0; // Should be unreachable for valid non-empty trees.
  }

  /**
   * Finds the maximum depth of the tree.
   * The maximum depth is the length of the longest path from the root node to any leaf node.
   * This method utilizes the private #traverse (BFS) helper method.
   * It keeps track of the largest depth encountered during the traversal.
   *
   * @returns {number} The maximum depth of the tree. Returns 0 if the tree is empty.
   */
  maxDepth() {
    // If the tree is empty, its maximum depth is 0.
    if (!this.#root) return 0;

    let currentMaxDepth = 0; // Variable to store the maximum depth found so far.

    // Call the private #traverse method. For each node visited by #traverse,
    // the provided callback function (an arrow function here - ES2015 feature) is executed.
    // The callback receives an object with a 'depth' property for the current node.
    this.#traverse(({ depth }) => {
      // Update currentMaxDepth if the depth of the current node is greater.
      currentMaxDepth = Math.max(currentMaxDepth, depth);
    });

    // After traversing all nodes, currentMaxDepth will hold the maximum depth.
    return currentMaxDepth;
  }

  /**
   * Finds the smallest value in the tree that is strictly larger than a given 'lowerBound'.
   * This method performs a Breadth-First Search (BFS) to check all nodes in the tree.
   *
   * @param {number} lowerBound - The value to compare against. Nodes with values greater than this
   *                              are considered.
   * @returns {number | null} The smallest value found that is greater than 'lowerBound'.
   *                          Returns null if no such value exists or if the tree is empty.
   */
  nextLarger(lowerBound) {
    // If the tree is empty, no such value can exist.
    if (!this.#root) return null;

    let smallestLarger = null; // Initialize to null. This will store our best find so far.

    // Use a queue for BFS, starting with the root node.
    const queue = [this.#root];

    // Continue as long as there are nodes to visit.
    while (queue.length > 0) {
      const node = queue.shift(); // Get the current node from the front of the queue.

      // Check if the current node's value is greater than the lowerBound.
      if (node.value > lowerBound) {
        // If it is, we need to see if this value is better (smaller) than
        // any previous 'smallestLarger' we've found.
        if (smallestLarger === null || node.value < smallestLarger) {
          // If smallestLarger is still null (this is the first initialized value)
          // OR if the current node's value is smaller than the current smallestLarger,
          // then update smallestLarger to this node's value.
          smallestLarger = node.value;
        }
      }

      // Add existing children to the queue to continue the search.
      if (node.left) {
        queue.push(node.left);
      }
      if (node.right) {
        queue.push(node.right);
      }
    }

    // After checking all nodes, return the smallest value found that was larger than lowerBound.
    // If no such node was found, smallestLarger will still be null.
    return smallestLarger;
  }

  /**
   * Finds the maximum sum of a path in the binary tree.
   * A "path" can start and end at any node in the tree. It does not need to pass
   * through the root. Additionally, a path isn't limited to going only downwards; it can "turn"
   * at a node (e.g., a path could go from a left child, up to the node, then down to its right child).
   * This implementation uses an iterative post-order traversal approach.
   * Post-order traversal (processing Left child, then Right child, then the Node itself) is chosen.
   * This specific order is crucial because it ensures that when we evaluate any given node,
   * the maximum path sums extending downwards from its children have already been computed and are available.
   *
   * @returns {number} The maximum path sum found in the tree. Returns 0 if the tree is empty.
   *                   If all node values are negative, it returns the value of the single node
   *                   that is least negative (i.e., the largest value among the negative numbers).
   */
  maxSum() {
    // If the tree is empty, the maximum sum is 0.
    if (!this.#root) return 0;

    // 'sums' will store the maximum sum of a path starting at a particular node
    // and extending downwards into *at most one* of its subtrees.
    // A WeakMap (ES2015 feature) is used. WeakMaps allow keys (nodes, in this case)
    // to be garbage-collected if they are no longer referenced elsewhere, which can be
    // beneficial for memory management with objects.
    const sums = new WeakMap();

    // Initialize maxSum to negative infinity. This helps correctly find the maximum sum
    // even if all node values are negative (the max sum would be the least negative value).
    let maxSum = -Infinity;

    // Define symbolic constants for the phases of our iterative post-order traversal.
    // This helps simulate the call stack behavior of a recursive post-order traversal.
    const phases = {
      visitLeft: 0, // Phase 0: We need to process the left subtree of the current node.
      visitRight: 1, // Phase 1: Left subtree processed, now process the right subtree.
      processNode: 2, // Phase 2: Both subtrees processed, ready to process the current node itself.
    };

    // The stack for iterative traversal. Each item on the stack will be an object
    // containing a 'node' and its current processing 'phase'.
    // Start with the root node, initially in the 'visitLeft' phase.
    const stack = [{ node: this.#root, phase: phases.visitLeft }];

    while (stack.length > 0) {
      // Peek at the top item of the stack (without removing it yet).
      const current = stack[stack.length - 1];
      const node = current.node;

      if (current.phase === phases.visitLeft) {
        // Currently in 'visitLeft' phase for 'node'.
        // Transition to the next phase for 'node': 'visitRight'.
        current.phase = phases.visitRight;
        // If a left child exists, push it onto the stack to be processed first.
        // The new item on stack starts in 'visitLeft' phase.
        if (node.left) {
          stack.push({ node: node.left, phase: phases.visitLeft });
        }
      } else if (current.phase === phases.visitRight) {
        // Currently in 'visitRight' phase for 'node' (meaning left child is processed).
        // Transition to the next phase for 'node': 'processNode'.
        current.phase = phases.processNode;
        // If a right child exists, push it onto the stack to be processed.
        if (node.right) {
          stack.push({ node: node.right, phase: phases.visitLeft });
        }
      } else {
        // current.phase === phases.processNode
        // Currently in 'processNode' phase (both left and right children are processed).
        // Now we can process the 'node' itself.
        stack.pop(); // Remove the fully processed node from the stack.

        // Get the max sum of a path ending at the left child (and going downwards from it).
        // If no left child, or if its path sum is negative, consider it 0 for path calculations.
        // sums.get(node.left) retrieves the value calculated when node.left was processed.
        const leftSum = node.left ? sums.get(node.left) : 0;
        // Similarly for the right child.
        const rightSum = node.right ? sums.get(node.right) : 0;

        // Calculate the maximum sum of a path that *could pass through the current node*.
        // This path might "turn" at the current node (i.e., go from left child, through node, to right child).
        // It's the node's value plus the best positive contributions from its left and right downward paths.
        // Math.max(0, childSum) ensures we don't include a child's path if it's negative,
        // as that would decrease the sum through the current node.
        const sumThroughNode =
          node.value + Math.max(0, leftSum) + Math.max(0, rightSum);

        // Update the overall maximum sum found so far if sumThroughNode is greater.
        maxSum = Math.max(maxSum, sumThroughNode);

        // Calculate the maximum sum of a path starting at the current node and extending
        // downwards into *only one* of its children's branches (or just the node itself if both child paths are negative).
        // This value is stored in the 'sums' WeakMap and will be used by the parent of the current node.
        const sumForParent = node.value + Math.max(0, leftSum, rightSum);
        sums.set(node, sumForParent);
      }
    }
    // After iterating through all nodes, maxSum will hold the maximum path sum.
    // If the tree was non-empty, maxSum will be at least the value of one of its nodes.
    return maxSum;
  }

  /**
   * Checks if two nodes in the tree are "cousins".
   * Cousin nodes are nodes that are at the same depth (level) in the tree
   * but have different parent nodes.
   *
   * @param {BinaryTreeNode} node1 - The first node to check.
   * @param {BinaryTreeNode} node2 - The second node to check.
   * @returns {boolean} True if node1 and node2 are cousins, false otherwise.
   */
  areCousins(node1, node2) {
    // Perform basic checks first:
    if (!this.#root) return false; // No nodes in an empty tree can be cousins.

    // The root node cannot be a cousin to any node as it has no parent and is at depth 1.
    // Other nodes must be at depth > 1 to have a parent distinct from another node's parent.
    if (node1 === this.#root || node2 === this.#root) return false;

    // A node cannot be its own cousin.
    if (node1 === node2) return false;

    // Object to store information (depth and parent) about node1 and node2,
    // gathered during the traversal.
    const info = {
      depth1: null,
      parent1: null,
      depth2: null,
      parent2: null,
    };

    // Use the private #traverse (BFS) method to find the depth and parent for both nodes.
    // The callback function will populate the 'info' object.
    this.#traverse(({ node, depth, parent }) => {
      if (node === node1) {
        info.depth1 = depth;
        info.parent1 = parent;
      } else if (node === node2) {
        info.depth2 = depth;
        info.parent2 = parent;
      }
    });

    // After traversal, check the conditions for being cousins:
    // 1. Both nodes must have been found in the tree (their depths will not be null).
    // 2. They must be at the same depth.
    // 3. They must have different parents.
    // (The parent1 !== null check also implicitly confirms node1 is not the root,
    // which was already checked, but it's a good sanity check here).
    return (
      info.depth1 !== null && // node1 was found
      info.depth2 !== null && // node2 was found
      info.depth1 === info.depth2 && // Same depth
      info.parent1 !== info.parent2 // Different parents
    );
  }

  /**
   * Finds the Lowest Common Ancestor (LCA) of two given nodes in the binary tree.
   * The LCA is defined as the deepest node in the tree that has both node1 and node2
   * as descendants (where a node can be a descendant of itself).
   *
   * @param {BinaryTreeNode} node1 - The first node.
   * @param {BinaryTreeNode} node2 - The second node.
   * @returns {BinaryTreeNode | null} The LCA node if both node1 and node2 are found in the tree,
   *                                  otherwise null.
   */
  lowestCommonAncestor(node1, node2) {
    // Helper function to find the path from the root to a specific targetNode.
    // Returns an array of nodes representing the path if found, otherwise null.
    const findPath = (targetNode) => {
      if (!this.#root) return null; // No path in an empty tree.

      // Use BFS to find the target node and reconstruct its path.
      // Each queue item stores the current node and the path taken to reach it.
      const queue = [{ node: this.#root, path: [this.#root] }];

      while (queue.length > 0) {
        const { node, path } = queue.shift();

        if (node === targetNode) {
          return path; // Target node found, return the path.
        }

        // Add children to the queue, extending the current path.
        // The '...' spread syntax (ES2015) is used to create a new array for the extended path.
        if (node.left) {
          queue.push({ node: node.left, path: [...path, node.left] });
        }
        if (node.right) {
          queue.push({ node: node.right, path: [...path, node.right] });
        }
      }
      return null; // Target node not found in the tree.
    };

    // Get the paths from the root to node1 and node2.
    const pathToNode1 = findPath(node1);
    const pathToNode2 = findPath(node2);

    // If either node is not found in the tree, they cannot have an LCA.
    if (!pathToNode1 || !pathToNode2) return null;

    let lca = null; // Variable to store the LCA.
    // Iterate through both paths simultaneously as long as the nodes at the current position match.
    // The loop runs up to the length of the shorter path.
    for (let i = 0; i < Math.min(pathToNode1.length, pathToNode2.length); i++) {
      if (pathToNode1[i] === pathToNode2[i]) {
        // If the nodes at the current index in both paths are the same,
        // this node is a common ancestor. Update 'lca' to this node.
        lca = pathToNode1[i];
      } else {
        // If the nodes differ, the paths have diverged.
        // The 'lca' found in the previous iteration (if any) is the deepest common ancestor.
        break;
      }
    }
    // After the loop, 'lca' will hold the deepest node common to both paths.
    return lca;
  }

  /**
   * Converts (serializes) the binary tree into a string representation.
   * This method uses a level-order (BFS) traversal. Null children are represented as 'null'
   * in the string to maintain the tree structure.
   * Trailing nulls at the end of the serialization are removed for a more compact output.
   * Example: A tree with root 1, left child 2, right child 3 (where 2 has a left child 4)
   * might serialize to "[1,2,3,4,null,null,null]" (before trimming trailing nulls)
   * or more compactly as "[1,2,3,4]".
   *
   * @param {BinaryTree} tree - The binary tree instance to serialize.
   * @returns {string} A string representation of the tree (e.g., "[1,2,null,3]").
   */
  static serialize(tree) {
    // If the tree has no root (it's an empty tree), serialize to an empty array string.
    if (!tree.#root) return "[]";

    const values = []; // Array to store the values of nodes in level-order.
    // Queue for level-order traversal. It can contain actual nodes or null placeholders
    // for missing children, which is important for correct deserialization.
    const queue = [tree.#root];
    let i = 0; // Index to keep track of the current node being processed from the 'queue' array.
    // This simulates dequeuing while allowing us to check queue.length for termination.

    // Continue as long as 'i' is within the bounds of items pushed to the queue.
    // This loop structure ensures we process all nodes and null placeholders that define the structure.
    while (i < queue.length) {
      const node = queue[i++]; // Get the current node (or null placeholder) and advance 'i'.

      if (node) {
        // If it's an actual node, add its value to the 'values' array.
        values.push(node.value);
        // Add its children to the queue for later processing.
        // It's crucial to add 'null' if a child doesn't exist, to preserve the tree structure.
        queue.push(node.left);
        queue.push(node.right);
      } else {
        // If 'node' is a null placeholder, add 'null' to the 'values' array.
        // We don't add children for a null placeholder, as it has none.
        values.push(null);
      }
    }

    // After collecting all values (including potentially many trailing nulls),
    // trim these trailing nulls for a cleaner and more compact serialized string.
    let lastNonNullIndex = values.length - 1;
    while (lastNonNullIndex >= 0 && values[lastNonNullIndex] === null) {
      lastNonNullIndex--;
    }
    // Slice the array to include elements only up to the last non-null value.
    const trimmedValues = values.slice(0, lastNonNullIndex + 1);

    // Construct the final string representation.
    // Template literals (ES2015 feature) are used for easy string construction.
    return `[${trimmedValues.join(",")}]`;
  }

  /**
   * Rebuilds (deserializes) a binary tree from its string representation.
   * The input string is expected to be in the format produced by the `serialize` method
   * (i.e., a level-order traversal with 'null' for missing children).
   *
   * @param {string} serialized - The string representation of the tree.
   * @returns {BinaryTree} The deserialized binary tree.
   */
  static deserialize(serialized) {
    // If the string represents an empty array, return a new empty BinaryTree.
    if (serialized === "[]") return new BinaryTree();

    // Parse the input string into an array of actual values (numbers or nulls).
    // 1. Remove the outer brackets: "\[1,null,2]" -> "1,null,2".
    // 2. Split the string by commas: "1,null,2" -> ["1", "null", "2"].
    const stringValues = serialized.slice(1, -1).split(",");
    // 3. Convert string values to numbers or null.
    //    The map function (ES2015 arrow function) iterates over stringValues.
    const values = stringValues.map((valueStr) => {
      if (valueStr === "null" || valueStr === "") return null; // Handle "null" strings and potential empty strings.
      return Number(valueStr); // Convert other values to numbers.
    });

    // If the parsed values array is empty or the first value (root) is null,
    // it represents an empty or invalid tree structure.
    if (values.length === 0 || values[0] === null) {
      return new BinaryTree();
    }

    // Create the root node from the first value in the array.
    const rootNode = new BinaryTreeNode(values[0]);
    const tree = new BinaryTree(rootNode); // Create the new BinaryTree instance with this root.

    // Use a queue to keep track of parent nodes whose children need to be assigned.
    // This queue will hold actual BinaryTreeNode objects.
    const queue = [rootNode];
    let i = 1; // Index for the 'values' array, starting from the element after the root's value.

    // Process nodes in the 'queue' to attach their children based on the 'values' array.
    // Continue as long as there are values to process and parent nodes in the queue.
    while (i < values.length && queue.length > 0) {
      const parentNode = queue.shift(); // Get the next parent node from the queue.

      // Attempt to assign the left child.
      if (i < values.length) {
        // Check if there's a value in the 'values' array for the left child.
        const leftVal = values[i++]; // Get the value and advance the index.
        if (leftVal !== null) {
          // If the value is not null, create a new node.
          parentNode.left = new BinaryTreeNode(leftVal);
          queue.push(parentNode.left); // Add the new left child to the queue for its children.
        }
      }

      // Attempt to assign the right child.
      if (i < values.length) {
        // Check if there's a value for the right child.
        const rightVal = values[i++]; // Get the value and advance the index.
        if (rightVal !== null) {
          // If not null, create the node.
          parentNode.right = new BinaryTreeNode(rightVal);
          queue.push(parentNode.right); // Add to queue for its children.
        }
      }
    }
    // Return the fully reconstructed tree.
    return tree;
  }
}

// This is CommonJS module export syntax, typically used in Node.js environments.
// It makes the BinaryTree and BinaryTreeNode classes available for import in other files
// using require(), e.g., const { BinaryTree, BinaryTreeNode } = require('./binary-tree');
module.exports = { BinaryTree, BinaryTreeNode };
