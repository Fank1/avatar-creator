// ------------- SELECTORS ---------------------

const pathDebug = document.querySelector("#path-debug");
const customPath = document.querySelector("#custom-path");
const chamferSlider = document.querySelector("#chamfer-slider");
const downloadButtonSVG = document.querySelector("#download-button-svg");
const downloadButtonPNG = document.querySelector("#download-button-png");
const resultSVG = document.querySelector("#result-svg");
const domGrid = document.querySelector("#dom-grid");
const sizeOptionsDom = document.querySelectorAll(".size-option");

// ------------- SETTINGS ---------------------

var columns = 9;
var rows = 9;
var cubeSize = 45;
var chamferRatio = 0.106;
var colors = ["#E2481E", "#C19C61", "#000000"];
var currentColorIndex = 0;

// ------------- CALCULATED DATA -------------

var chamferSize = cubeSize * chamferRatio;
let gridData = [];
let primaryMouseIsDown = false;
let eraseMode = false;

//---------------- FUNCTIONS ------------------

function setCSSvariables() {
  document.documentElement.style.setProperty("--cube-size", cubeSize + "px");

  document.documentElement.style.setProperty(
    "--grid-width",
    cubeSize * columns + "px"
  );

  document.documentElement.style.setProperty(
    "--grid-height",
    cubeSize * rows + "px"
  );
}

function addColorChoicesToDom() {
  for (let i = 0; i < colors.length; i++) {
    let newColor = document.createElement("div");
    newColor.classList.add("color");
    newColor.style.backgroundColor = colors[i];
    document.querySelector("#color-selector").append(newColor);
    newColor.addEventListener("click", function (e) {
      currentColorIndex = i;
      updateColors();
    });
  }
}

function updateColors() {
  const allPaths = document.querySelectorAll("path");
  for (let i = 0; i < allPaths.length; i++) {
    allPaths[i].setAttribute("fill", colors[currentColorIndex]);
  }
  const allColorsChoices = document.querySelectorAll(".color");
  for (let i = 0; i < allColorsChoices.length; i++) {
    allColorsChoices[i].classList.remove("is-selected");
    if (currentColorIndex === i) {
      allColorsChoices[i].classList.add("is-selected");
    }
  }
}

function changeGridSize(size) {
  for (let i = 0; i < sizeOptionsDom.length; i++) {
    sizeOptionsDom[i].classList.remove("is-selected");
    if (size === sizeOptionsDom[i].getAttribute("data-size")) {
      sizeOptionsDom[i].classList.add("is-selected");
      if (size != columns) {
        console.log("i ran");
        columns = parseInt(size);
        rows = parseInt(size);
        gridData = [];
        domGrid.innerHTML = "";
        setSVGsize();
        setCSSvariables();
        createDomGrid();
        updatePaths();
      }
    }
  }
}

function setSVGsize() {
  resultSVG.setAttribute("width", columns * cubeSize);
  resultSVG.setAttribute("height", rows * cubeSize);
  resultSVG.setAttribute(
    "viewBox",
    `0 0 ${columns * cubeSize} ${rows * cubeSize}`
  );
}

function findTheGoo() {
  for (let i = 0; i < gridData.length; i++) {
    let currentCube = gridData[i];
    if (currentCube.selected) {
      const topLeftNeightbor = gridData.find(
        (cube) =>
          cube.row === currentCube.row - 1 &&
          cube.column === currentCube.column - 1
      );
      const topRightNeightbor = gridData.find(
        (cube) =>
          cube.row === currentCube.row - 1 &&
          cube.column === currentCube.column + 1
      );
      if (topLeftNeightbor.selected) {
        createGooShape(
          currentCube.column * cubeSize,
          currentCube.row * cubeSize,
          "left"
        );
      }
      if (topRightNeightbor.selected) {
        createGooShape(
          currentCube.column * cubeSize + cubeSize,
          currentCube.row * cubeSize,
          "right"
        );
      }
    }
  }
}

///Gooo creator --------------------------

function createGooShape(x, y, direction) {
  let dValue;
  let point1;
  let point2;
  let point3;
  let point4;

  let tempPath = document.createElementNS("http://www.w3.org/2000/svg", "path");

  tempPath.setAttribute("fill", colors[currentColorIndex]);

  //center offsetting

  x = x - cubeSize * 0.3;
  y = y - cubeSize * 0.3;

  if (direction === "left") {
    point1 = `M${x + cubeSize * 0.3} ${y}`;
    point2 = `Q ${x + cubeSize * 0.3} ${y + cubeSize * 0.3} ${
      x + cubeSize * 0.6
    } ${y + cubeSize * 0.3}`;
    point3 = `L${x + cubeSize * 0.3} ${y + cubeSize * 0.6} Q ${
      x + cubeSize * 0.3
    } ${y + cubeSize * 0.3}`;
    point4 = `${x + cubeSize * 0} ${y + cubeSize * 0.3} Z`;
  } else if (direction === "right") {
    point1 = `M${x + cubeSize * 0.3} ${y}`;
    point2 = `L ${x + cubeSize * 0.6} ${y + cubeSize * 0.3} Q${
      x + cubeSize * 0.3
    } ${y + cubeSize * 0.3}`;
    point3 = `${x + cubeSize * 0.3} ${y + cubeSize * 0.6}`;
    point4 = `L ${x + cubeSize * 0} ${y + cubeSize * 0.3} Q ${
      x + cubeSize * 0.3
    } ${y + cubeSize * 0.3} ${x + cubeSize * 0.3} ${y + cubeSize * 0} Z`;
  }

  dValue = point1 + " " + point2 + " " + point3 + " " + point4;
  tempPath.setAttribute("d", dValue);
  resultSVG.appendChild(tempPath);
}

//----------------------------------------

function createDomGrid() {
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      let cube = document.createElement("div");
      cube.setAttribute("class", "dom-cube");
      cube.setAttribute("data-column", j);
      cube.setAttribute("data-row", i);
      cube.setAttribute("id", rows * i + j);

      let tempCubeObject = {
        id: rows * i + j,
        column: j,
        row: i,
        selected: false,
      };

      gridData.push(tempCubeObject);

      cube.addEventListener("mouseover", (event) => {
        clickOnCube(j, i, rows * i + j, event.type);
      });
      cube.addEventListener("mousedown", (event) => {
        clickOnCube(j, i, rows * i + j, event.type);
      });
      domGrid.append(cube);
    }
  }
}

function getCubePoints(
  offsetX,
  offsetY,
  topLeftChamfer,
  topRightChamfer,
  bottomRightChamfer,
  bottomLeftChamfer
) {
  let calcedOffsetX = offsetX * cubeSize;
  let calcedOffsetY = offsetY * cubeSize;
  let topLeftVectors = [];
  let topRightVectors = [];
  let bottomRightVectors = [];
  let bottomLeftVectors = [];

  let output = [];

  // handles corner booleans and returns an object ----------------

  if (topLeftChamfer) {
    topLeftVectors.push(`${calcedOffsetX} ${chamferSize + calcedOffsetY}`);
    topLeftVectors.push(`${chamferSize + calcedOffsetX} ${calcedOffsetY}`);
  } else {
    topLeftVectors.push(`${calcedOffsetX} ${calcedOffsetY}`);
    /*let bottomNeighbor = gridData.find(
			(cube) => cube.column === offsetX && cube.row === offsetY - 1
		);
		if (bottomNeighbor.selected === false) {
			createGooShape(calcedOffsetX, calcedOffsetY, "left");
		}*/
  }
  if (topRightChamfer) {
    topRightVectors.push(
      `${cubeSize - chamferSize + calcedOffsetX} ${calcedOffsetY}`
    );
    topRightVectors.push(
      `${cubeSize + calcedOffsetX} ${chamferSize + calcedOffsetY}`
    );
  } else {
    topRightVectors.push(`${calcedOffsetX + cubeSize} ${calcedOffsetY}`);
  }
  if (bottomRightChamfer) {
    bottomRightVectors.push(
      `${cubeSize + calcedOffsetX} ${cubeSize - chamferSize + calcedOffsetY}`
    );
    bottomRightVectors.push(
      `${cubeSize - chamferSize + calcedOffsetX} ${cubeSize + calcedOffsetY}`
    );
  } else {
    bottomRightVectors.push(
      `${calcedOffsetX + cubeSize} ${calcedOffsetY + cubeSize}`
    );
  }
  if (bottomLeftChamfer) {
    bottomLeftVectors.push(
      `${chamferSize + calcedOffsetX} ${cubeSize + calcedOffsetY}`
    );
    bottomLeftVectors.push(
      `${calcedOffsetX} ${cubeSize - chamferSize + calcedOffsetY}`
    );
  } else {
    bottomLeftVectors.push(`${calcedOffsetX} ${cubeSize + calcedOffsetY}`);
  }

  for (let i = 0; i < topLeftVectors.length; i++) {
    output.push(topLeftVectors[i]);
  }

  for (let i = 0; i < topRightVectors.length; i++) {
    output.push(topRightVectors[i]);
  }

  for (let i = 0; i < bottomRightVectors.length; i++) {
    output.push(bottomRightVectors[i]);
  }

  for (let i = 0; i < bottomLeftVectors.length; i++) {
    output.push(bottomLeftVectors[i]);
  }
  return output;
}

function updatePaths() {
  document.querySelectorAll("path").forEach((e) => e.remove());
  for (let i = 0; i < gridData.length; i++) {
    if (gridData[i].selected === true) {
      let tempPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      tempPath.setAttribute("fill", colors[currentColorIndex]);
      let parsedPoints = "M";
      let tempTopLeftChamfer = true;
      let tempTopRightChamfer = true;
      let tempBottomRightChamfer = true;
      let tempBottomLeftChamfer = true;

      //check for neighbors of cube and set temp variables accordingly, default value is true
      //checks if the column value for the cube is higher than 0
      if (gridData[i].column > 0) {
        const leftNeighbor = gridData.find(
          (cube) =>
            cube.row === gridData[i].row &&
            cube.column === gridData[i].column - 1
        );
        if (leftNeighbor.selected === true) {
          tempTopLeftChamfer = false;
          tempBottomLeftChamfer = false;
        }
      }
      //checks if the column value for the cube is smaller than column max
      if (gridData[i].column < columns - 1) {
        const rightNeighbor = gridData.find(
          (cube) =>
            cube.row === gridData[i].row &&
            cube.column === gridData[i].column + 1
        );
        if (rightNeighbor.selected === true) {
          tempTopRightChamfer = false;
          tempBottomRightChamfer = false;
        }
      }
      //checks if the row value for the cube is larger than 0
      if (gridData[i].row > 0) {
        const topNeighbor = gridData.find(
          (cube) =>
            cube.column === gridData[i].column &&
            cube.row === gridData[i].row - 1
        );
        if (topNeighbor.selected === true) {
          tempTopLeftChamfer = false;
          tempTopRightChamfer = false;
        }
      }
      //checks if the row value for the cube is smaller than row max
      if (gridData[i].row < rows - 1) {
        const bottomNeighbor = gridData.find(
          (cube) =>
            cube.column === gridData[i].column &&
            cube.row === gridData[i].row + 1
        );
        if (bottomNeighbor.selected === true) {
          tempBottomLeftChamfer = false;
          tempBottomRightChamfer = false;
        }
      }

      // ----- check if upper left has a diagonal neighbor
      if (gridData[i].row > 0 && gridData[i].column > 0) {
        const upperLeftNeighbor = gridData.find(
          (cube) =>
            cube.column === gridData[i].column - 1 &&
            cube.row === gridData[i].row - 1
        );
        if (upperLeftNeighbor.selected === true) {
          tempTopLeftChamfer = false;
          //check if northern and western neighbor is not selected and then add goo
          const upperNeighbor = gridData.find(
            (cube) =>
              cube.column === gridData[i].column &&
              cube.row === gridData[i].row - 1
          );
          const leftNeighbor = gridData.find(
            (cube) =>
              cube.column === gridData[i].column - 1 &&
              cube.row === gridData[i].row
          );
          if (
            upperNeighbor.selected === false &&
            leftNeighbor.selected === false
          ) {
            createGooShape(
              gridData[i].column * cubeSize,
              gridData[i].row * cubeSize,
              "left"
            );
          }
        }
      }

      // ----- check if upper right has a diagonal neighbor

      if (gridData[i].row > 0 && gridData[i].column < columns - 1) {
        const upperLeftNeighbor = gridData.find(
          (cube) =>
            cube.column === gridData[i].column + 1 &&
            cube.row === gridData[i].row - 1
        );
        if (upperLeftNeighbor.selected === true) {
          tempTopRightChamfer = false;
          const upperNeighbor = gridData.find(
            (cube) =>
              cube.column === gridData[i].column &&
              cube.row === gridData[i].row - 1
          );
          const rightNeighbor = gridData.find(
            (cube) =>
              cube.column === gridData[i].column + 1 &&
              cube.row === gridData[i].row
          );
          if (
            upperNeighbor.selected === false &&
            rightNeighbor.selected === false
          ) {
            createGooShape(
              gridData[i].column * cubeSize + cubeSize,
              gridData[i].row * cubeSize,
              "right"
            );
          }
        }
      }

      // ----- check if bottom right has a diagonal neighbor

      if (gridData[i].row < rows - 1 && gridData[i].column < columns - 1) {
        const bottomRightNeighbor = gridData.find(
          (cube) =>
            cube.column === gridData[i].column + 1 &&
            cube.row === gridData[i].row + 1
        );
        if (bottomRightNeighbor.selected === true) {
          tempBottomRightChamfer = false;
        }
      }

      // ----- check if bottom left has a diagonal neighbor

      if (gridData[i].row < rows - 1 && gridData[i].column > 0) {
        const bottomLeftNeighbor = gridData.find(
          (cube) =>
            cube.column === gridData[i].column - 1 &&
            cube.row === gridData[i].row + 1
        );
        if (bottomLeftNeighbor.selected === true) {
          tempBottomLeftChamfer = false;
        }
      }

      parsedPoints += getCubePoints(
        gridData[i].column,
        gridData[i].row,
        tempTopLeftChamfer,
        tempTopRightChamfer,
        tempBottomRightChamfer,
        tempBottomLeftChamfer
      ).join(" L");
      parsedPoints += "Z";
      tempPath.setAttribute("d", parsedPoints);
      resultSVG.appendChild(tempPath);
    }
  }
}

//---------------- INPUTS -------------

//add click events to size options ----

for (let i = 0; i < sizeOptionsDom.length; i++) {
  sizeOptionsDom[i].addEventListener("click", function (e) {
    changeGridSize(e.target.getAttribute("data-size"));
  });
}

//checking the mouse state to allow for drag drawing

document.querySelector("body").addEventListener("mousedown", function (e) {
  primaryMouseIsDown = true;
});

document.querySelector("body").addEventListener("mouseup", function (e) {
  primaryMouseIsDown = false;
});

//clearing the board

document.querySelector("#clear-button").addEventListener("click", function (e) {
  for (i = 0; i < gridData.length; i++) {
    gridData[i].selected = false;
  }
  updatePaths();
});

//used to change the chamfer ratio -------

chamferSlider.addEventListener("input", (event) => {
  chamferRatio = parseFloat(event.target.value);
  chamferSize = cubeSize * chamferRatio;
  updatePaths();
});

function clickOnCube(column, row, id, eventType) {
  var foundCubeIndex = gridData.findIndex((cube) => cube.id == id);
  if (eventType === "mousedown") {
    eraseMode = gridData[foundCubeIndex].selected;

    gridData[foundCubeIndex].selected = !eraseMode;
  } else if (eventType === "mouseover" && primaryMouseIsDown) {
    gridData[foundCubeIndex].selected = gridData[foundCubeIndex].selected =
      !eraseMode;
  }
  updatePaths();
}

//--------------- Download functionality -------------------

function downloadSVG() {
  svgExport.downloadSvg(
    document.getElementById("result-svg"), // SVG DOM Element object to be exported. Alternatively, a string of the serialized SVG can be passed
    "avatar", // chart title: file name of exported image
    { useCSS: false } // options (optional, please see below for a list of option properties)
  );
}
downloadButtonSVG.addEventListener("click", (event) => {
  downloadSVG();
});

downloadButtonPNG.addEventListener("click", (event) => {
  let stringifiedSVG = resultSVG.outerHTML;
  console.log(stringifiedSVG);
  svgExport.downloadPng(stringifiedSVG, "avatar", {
    width: cubeSize * columns,
    height: cubeSize * rows,
    scale: 3,
  });
});

//--------- Initial setup on load ---------------------

window.addEventListener("load", (event) => {
  setSVGsize();
  setCSSvariables();
  createDomGrid();
  updatePaths();
  addColorChoicesToDom();
  updateColors();
});
