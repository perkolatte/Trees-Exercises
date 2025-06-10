// filepath: /Users/perkolatte/Documents/Springboard/Projects/Trees Exercises/tree-visualizer.js
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

  while (iterations++ < maxIterations) {
    const cellKey = `${x1},${y1}`;
    if (!nodeTextCells.has(cellKey)) {
      if (y1 >= 0 && y1 < canvas.length && x1 >= 0 && x1 < canvas[0].length) {
        canvas[y1][x1] = char;
      }
    }

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
 * @param {object | null} rootNode - The root node of the tree (can be BinaryTreeNode or TreeNode).
 * @param {string} logContext - Description of when/why the log is occurring.
 * @param {Set<object>} [highlightedNodes=new Set()] - Optional set of nodes to highlight.
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
    let nodeDisplayVal = node.value !== undefined ? node.value : node.val;
    if (nodeDisplayVal === undefined) {
      nodeDisplayVal = "[?]";
    }
    let display = String(nodeDisplayVal);
    if (highlightedNodes.has(node)) {
      display += " (*)";
    }
    return display;
  };

  const nodePositions = new Map();
  let maxEncounteredY = 0;
  // This factor times the horizontal offset gives the number of rows for slashes.
  const VERTICAL_SLASH_ROWS_PER_HORIZONTAL_OFFSET_UNIT = 1;

  let actualFullTreeDepth = 0;
  function calculateActualFullTreeDepth(node, level) {
    if (!node) return;
    actualFullTreeDepth = Math.max(actualFullTreeDepth, level);

    // Check for binary tree children first
    if (node.left || node.right) {
      calculateActualFullTreeDepth(node.left, level + 1);
      calculateActualFullTreeDepth(node.right, level + 1);
    } else if (node.children && Array.isArray(node.children)) {
      // Then check for general tree children
      for (const child of node.children) {
        calculateActualFullTreeDepth(child, level + 1);
      }
    }
  }
  calculateActualFullTreeDepth(rootNode, 0);

  // initialXOffset is the "half-span" available for children at the current level.
  // It's based on the full depth to ensure enough space for the widest part of the tree.
  const initialXOffset =
    actualFullTreeDepth > 0 ? Math.pow(2, actualFullTreeDepth - 1) * 2 : 1;

  function calculatePositionsRecursive(
    parentNode,
    currentDepth,
    parentX,
    parentY,
    xOffsetAvailable // Half-span available for placing children of parentNode
  ) {
    let childrenToLayout = [];
    // Prioritize binary tree structure if present
    if (parentNode.left || parentNode.right) {
      if (parentNode.left) childrenToLayout.push(parentNode.left);
      if (parentNode.right) childrenToLayout.push(parentNode.right);
    } else if (parentNode.children && Array.isArray(parentNode.children)) {
      // Fallback to general tree structure
      childrenToLayout = parentNode.children;
    }

    const numChildrenToLayout = childrenToLayout.length;
    if (numChildrenToLayout === 0) return;

    // The offset for the *children of these children* will be halved.
    const xOffsetForNextLevel = Math.max(1, Math.round(xOffsetAvailable / 2));

    // Vertical distance to children
    const numSlashRowsForChildren = Math.max(
      1,
      Math.round(
        VERTICAL_SLASH_ROWS_PER_HORIZONTAL_OFFSET_UNIT * xOffsetAvailable
      )
    );
    const childrenY = parentY + numSlashRowsForChildren + 1;

    for (let i = 0; i < numChildrenToLayout; i++) {
      const childNode = childrenToLayout[i];
      let childX;
      let currentChildXOffsetForItsChildren = Math.max(
        1,
        Math.round(xOffsetAvailable / 2)
      );

      if (parentNode.left || parentNode.right) {
        // Binary layout
        if (parentNode.left && parentNode.right) {
          // Two children
          if (childNode === parentNode.left)
            childX = parentX - xOffsetAvailable;
          else childX = parentX + xOffsetAvailable;
          // currentChildXOffsetForItsChildren remains xOffsetAvailable / 2
        } else {
          // Single child
          childX = parentX; // Place single child directly under parent
          // For a single child, its children might not need the full halved original offset.
          // This could be xOffsetAvailable / 2, or even smaller if we want to compress single branches.
          // Let's keep it xOffsetAvailable / 2 for now to see the effect of centering.
          // currentChildXOffsetForItsChildren = Math.max(1, Math.round(xOffsetAvailable / 2));
        }
      } else {
        // General n-ary layout
        if (numChildrenToLayout === 1) {
          childX = parentX;
        } else {
          childX =
            parentX +
            ((i / (numChildrenToLayout - 1)) * 2 - 1) * xOffsetAvailable;
        }
        // currentChildXOffsetForItsChildren remains xOffsetAvailable / 2
      }

      const childText = getDisplayValue(childNode);
      nodePositions.set(childNode, {
        text: childText,
        x: Math.round(childX), // Ensure integer coordinates
        y: childrenY,
        width: childText.length,
      });
      maxEncounteredY = Math.max(maxEncounteredY, childrenY);
      calculatePositionsRecursive(
        childNode,
        currentDepth + 1,
        Math.round(childX),
        childrenY,
        currentChildXOffsetForItsChildren // Use this adjusted offset
      );
    }
  }

  const rootText = getDisplayValue(rootNode);
  nodePositions.set(rootNode, {
    text: rootText,
    x: 0,
    y: 0,
    width: rootText.length,
  });
  maxEncounteredY = 0;

  calculatePositionsRecursive(rootNode, 0, 0, 0, initialXOffset);

  let minX = Infinity;
  let maxX = -Infinity;

  if (nodePositions.size === 0 && rootNode) {
    nodePositions.set(rootNode, {
      text: getDisplayValue(rootNode),
      x: 0,
      y: 0,
      width: getDisplayValue(rootNode).length,
    });
  }
  if (nodePositions.size === 0) {
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
  const canvasHeight = maxEncounteredY + 1;
  const canvas = Array.from({ length: canvasHeight }, () =>
    Array(canvasWidth).fill(" ")
  );
  const nodeTextCells = new Set();

  // Populate nodeTextCells first
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

    let childrenOfParent = [];
    if (parentNode.left || parentNode.right) {
      if (parentNode.left) childrenOfParent.push(parentNode.left);
      if (parentNode.right) childrenOfParent.push(parentNode.right);
    } else if (parentNode.children && Array.isArray(parentNode.children)) {
      childrenOfParent = parentNode.children;
    }

    for (const childNode of childrenOfParent) {
      if (childNode && nodePositions.has(childNode)) {
        const childInfo = nodePositions.get(childNode);
        const Cx = childInfo.x;
        const Cy = childInfo.y;

        if (typeof Py !== "number" || typeof Cy !== "number" || Cy <= Py) {
          continue;
        }

        const lineStartY = Py + 1;
        const lineEndY = Cy - 1;

        if (Cx === Px) {
          // Vertical line
          for (let y_coord = lineStartY; y_coord <= lineEndY; y_coord++) {
            if (
              y_coord >= 0 &&
              y_coord < canvas.length &&
              Px >= 0 &&
              Px < canvas[0].length
            ) {
              if (!nodeTextCells.has(`${Px},${y_coord}`)) {
                canvas[y_coord][Px] = "|";
              }
            }
          }
        } else {
          // Slanted line
          let lineStartX = Px;
          const slashChar = Cx < Px ? "/" : "\\";
          // Adjust start X for slanted lines to originate from side of parent or center
          if (slashChar === "/") lineStartX = Math.max(0, Px - 1);
          else if (slashChar === "\\")
            lineStartX = Math.min(canvasWidth - 1, Px + 1);

          // Ensure line doesn't start/end inside node text
          // For simplicity, we rely on nodeTextCells check in drawLineOnCanvas
          if (lineStartY <= lineEndY) {
            // Ensure there's space for the line
            drawLineOnCanvas(
              lineStartX,
              lineStartY,
              Cx, // End X at child's center
              lineEndY,
              slashChar,
              canvas,
              nodeTextCells
            );
          }
        }
      }
    }
  });

  // Draw node text on top of lines
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
  const filteredTreeLines = treeLines.filter(
    (line) => line.length > 0 || line === ""
  ); // Keep empty lines if they are part of structure

  // Avoid returning just header/footer if tree is one line and gets trimmed.
  if (filteredTreeLines.length === 0 && nodePositions.size > 0) {
    if (canvasHeight > 0 && canvas[0]) {
      // if root was drawn
      return [header, canvas[0].join("").trimEnd(), footer].join("\n");
    }
  }
  if (filteredTreeLines.length === 0) {
    if (!rootNode) return [header, "<empty tree>", footer].join("\n");
    // If rootNode exists but no positions, it's an issue, but visualizer should show something.
    return [header, getDisplayValue(rootNode), footer].join("\n");
  }

  return [header, ...filteredTreeLines, footer].join("\n");
}

module.exports = { getVisualTreeString };
