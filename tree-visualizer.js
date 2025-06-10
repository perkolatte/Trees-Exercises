/**
 * Draws a line on the canvas using Bresenham's line algorithm.
 * This version draws dashed lines.
 * @param {number} x1 - Starting x-coordinate.
 * @param {number} y1 - Starting y-coordinate.
 * @param {number} x2 - Ending x-coordinate.
 * @param {number} y2 - Ending y-coordinate.
 * @param {string} char - Character to draw the line with.
 * @param {string[][]} canvas - The 2D array representing the canvas.
 * @param {Set<string>} nodeTextCells - Set of "x,y" strings for cells occupied by node text.
 */
function drawLineOnCanvas(x1, y1, x2, y2, char, canvas, nodeTextCells) {
  let dx = Math.abs(x2 - x1);
  let sx = x1 < x2 ? 1 : -1;
  let dy = -Math.abs(y2 - y1);
  let sy = y1 < y2 ? 1 : -1;
  let err = dx + dy;
  let e2;

  const maxIterations = canvas.length * canvas[0].length * 2; // Increased safety margin
  let iterations = 0;
  // let drawThisPoint = true; // REMOVE: For alternating dashes

  while (iterations++ < maxIterations) {
    const cellKey = `${x1},${y1}`;
    // Only draw if not a pre-marked node text cell
    if (!nodeTextCells.has(cellKey)) {
      // MODIFIED: Removed drawThisPoint condition
      if (y1 >= 0 && y1 < canvas.length && x1 >= 0 && x1 < canvas[0].length) {
        canvas[y1][x1] = char;
      }
    }
    // drawThisPoint = !drawThisPoint; // REMOVE: Toggle for the next point to create a dashed effect

    if (x1 === x2 && y1 === y2) break;
    e2 = 2 * err;
    if (e2 >= dy) {
      if (x1 === x2 && y1 === y2) break;
      err += dy;
      x1 += sx;
    }
    if (e2 <= dx) {
      if (x1 === x2 && y1 === y2) break;
      err += dx;
      y1 += sy;
    }
  }
}

/**
 * Generates a string representation of the visual structure of the tree.
 * @param {BinaryTreeNode | null} rootNode - The root node of the tree.
 * @param {string} logContext - Description of when/why the log is occurring.
 * @param {Set<BinaryTreeNode>} [highlightedNodes=new Set()] - Optional set of nodes to highlight.
 * @returns {string} A multi-line string representing the tree.
 */
function getVisualTreeString(
  rootNode,
  logContext = "Current tree state",
  highlightedNodes = new Set()
) {
  const header = `\n--- ${logContext} ---`;
  const footer = "------------------------------------------";

  if (!rootNode) {
    return [header, "<empty tree>", footer].join("\n");
  }

  const getDisplayValue = (node) => {
    let display = String(node.value);
    if (highlightedNodes.has(node)) {
      display += " (*)";
    }
    return display;
  };

  const nodePositions = new Map();
  let maxEncounteredY = 0;
  // This factor determines how many vertical rows are used for slashes
  // relative to the horizontal distance to the child.
  // Lower values make lines flatter (fewer slash rows for a given horizontal offset).
  // Higher values make lines steeper (more slash rows).
  // 0.3 means for a horizontal offset of ~7, we'd get ~2 slash rows.
  // For an offset of 3-4, we'd get 1 slash row.
  const VERTICAL_SLASH_ROWS_PER_HORIZONTAL_OFFSET_UNIT = 1; // Tunable

  // tempMaxDepthForHorizontalOffset is still needed for initialXOffset calculation
  let tempMaxDepthForHorizontalOffset = 0;
  function findTreeMaxLevels(node, level) {
    if (!node) return;
    tempMaxDepthForHorizontalOffset = Math.max(
      tempMaxDepthForHorizontalOffset,
      level
    );
    findTreeMaxLevels(node.left, level + 1);
    findTreeMaxLevels(node.right, level + 1);
  }
  findTreeMaxLevels(rootNode, 0);

  const initialXOffset = // This is the x-offset from root to its direct children
    tempMaxDepthForHorizontalOffset > 0
      ? Math.pow(2, tempMaxDepthForHorizontalOffset - 1) * 2
      : 1;

  function calculatePositionsRecursive(
    parentNode,
    parentDepth,
    parentX,
    parentY,
    xOffsetFromParentToChildren
  ) {
    // This function calculates and sets positions for the children of parentNode,
    // then recurses.

    // Calculate the xOffset for the children of these children (i.e., grandchildren of parentNode)
    const xOffsetForGrandchildren = Math.max(
      1,
      Math.round(xOffsetFromParentToChildren / 2)
    );

    // Determine the number of slash rows based on the horizontal offset to these children
    const numSlashRowsForChildren = Math.max(
      1, // Ensure at least 1 row for slashes
      Math.round(
        VERTICAL_SLASH_ROWS_PER_HORIZONTAL_OFFSET_UNIT *
          xOffsetFromParentToChildren
      )
    );
    const childrenY = parentY + numSlashRowsForChildren + 1;

    // Process left child
    if (parentNode.left) {
      const childNode = parentNode.left;
      const childX = parentX - xOffsetFromParentToChildren;
      const childText = getDisplayValue(childNode);

      nodePositions.set(childNode, {
        text: childText,
        x: childX,
        y: childrenY,
        width: childText.length,
      });
      maxEncounteredY = Math.max(maxEncounteredY, childrenY);
      // tempMaxDepthForHorizontalOffset is already calculated globally, maxActualDepth isn't strictly needed for y here.

      calculatePositionsRecursive(
        childNode,
        parentDepth + 1,
        childX,
        childrenY,
        xOffsetForGrandchildren
      );
    }

    // Process right child
    if (parentNode.right) {
      const childNode = parentNode.right;
      const childX = parentX + xOffsetFromParentToChildren;
      const childText = getDisplayValue(childNode);

      nodePositions.set(childNode, {
        text: childText,
        x: childX,
        y: childrenY,
        width: childText.length,
      });
      maxEncounteredY = Math.max(maxEncounteredY, childrenY);

      calculatePositionsRecursive(
        childNode,
        parentDepth + 1,
        childX,
        childrenY,
        xOffsetForGrandchildren
      );
    }
  }

  // Set root node's position first
  const rootText = getDisplayValue(rootNode);
  nodePositions.set(rootNode, {
    text: rootText,
    x: 0,
    y: 0,
    width: rootText.length,
  });
  maxEncounteredY = 0; // Root is at y=0

  // Start recursion for children of the root
  calculatePositionsRecursive(rootNode, 0, 0, 0, initialXOffset);

  let minX = Infinity;
  let maxX = -Infinity;

  if (nodePositions.size === 0 && rootNode) {
    // Should only happen if root has no children and we didn't set it
    nodePositions.set(rootNode, {
      text: rootText,
      x: 0,
      y: 0,
      width: rootText.length,
    });
  }
  if (nodePositions.size === 0) {
    // Still no positions (e.g. if rootNode was null initially)
    return [header, "<error: no node positions calculated>", footer].join("\n");
  }

  nodePositions.forEach((pos) => {
    minX = Math.min(minX, pos.x - Math.floor(pos.width / 2));
    maxX = Math.max(maxX, pos.x + Math.ceil(pos.width / 2) - 1);
  });

  const xShift = minX < 0 ? -minX : 0;
  const leftPadding = 1;

  nodePositions.forEach((pos) => {
    pos.x += xShift + leftPadding;
  });
  maxX += xShift + leftPadding;

  const canvasWidth = maxX + 2;
  const canvasHeight = maxEncounteredY + 1; // Use maxEncounteredY
  const canvas = Array.from({ length: canvasHeight }, () =>
    Array(canvasWidth).fill(" ")
  );
  const nodeTextCells = new Set();

  // Mark cells occupied by node text
  nodePositions.forEach((pos) => {
    const textStartX = pos.x - Math.floor(pos.width / 2);
    for (let k = 0; k < pos.text.length; k++) {
      const currentX = textStartX + k;
      const currentY = pos.y;
      if (
        currentX >= 0 &&
        currentX < canvasWidth &&
        currentY >= 0 &&
        currentY < canvasHeight
      ) {
        nodeTextCells.add(`${currentX},${currentY}`);
      }
    }
  });

  // Draw connection lines
  nodePositions.forEach((parentInfo, parentNode) => {
    const Px = parentInfo.x;
    const Py = parentInfo.y;

    const drawConnectionLine = (childNode, slashChar) => {
      if (childNode && nodePositions.has(childNode)) {
        const childInfo = nodePositions.get(childNode);
        const Cx = childInfo.x;
        const Cy = childInfo.y;

        // Ensure Py and Cy are valid and child is below parent
        if (typeof Py !== "number" || typeof Cy !== "number" || Cy <= Py) {
          // console.warn("Skipping line due to invalid Y positions", parentNode.value, childNode.value, Py, Cy);
          return;
        }

        const lineStartY = Py + 1;
        const lineEndY = Cy - 1;

        let lineStartX = Px;
        if (slashChar === "/") lineStartX = Px - 1;
        else if (slashChar === "\\") lineStartX = Px + 1;
        const lineEndX = Cx;

        if (lineStartY <= lineEndY) {
          // Check if there's actual space for the line
          drawLineOnCanvas(
            lineStartX,
            lineStartY,
            lineEndX,
            lineEndY,
            slashChar,
            canvas,
            nodeTextCells
          );
        }
      }
    };
    // Check if parentNode has children before trying to draw lines
    if (parentNode.left) drawConnectionLine(parentNode.left, "/");
    if (parentNode.right) drawConnectionLine(parentNode.right, "\\");
  });

  // Draw node text onto canvas (overwriting slashes if necessary)
  nodePositions.forEach((pos) => {
    const textStartX = pos.x - Math.floor(pos.width / 2);
    for (let k = 0; k < pos.text.length; k++) {
      const currentX = textStartX + k;
      const currentY = pos.y;
      if (
        currentX >= 0 &&
        currentX < canvasWidth &&
        currentY >= 0 &&
        currentY < canvasHeight
      ) {
        canvas[currentY][currentX] = pos.text[k];
      }
    }
  });

  const treeLines = canvas.map((row) => row.join("").trimEnd());
  const filteredTreeLines = treeLines.filter((line) => line.length > 0);

  if (filteredTreeLines.length === 0) {
    if (!rootNode) return [header, "<empty tree>", footer].join("\n");
    return [header, "<empty tree representation>", footer].join("\n");
  }

  return [header, ...filteredTreeLines, footer].join("\n");
}

module.exports = { getVisualTreeString };
