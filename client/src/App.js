import React from "react";
import io from "socket.io-client";

const socket = io.connect("http://localhost:3001");

const gridSize = 30;

const grid = [];
for (let i = 0; i < 10; i++) grid.push(Array.from(Array(10), () => 0));

const enemyGridRefs = [];
for (let i = 0; i < 10; i++)
  enemyGridRefs.push(Array.from(Array(10), () => React.createRef()));

const allyGridRefs = [];
for (let i = 0; i < 10; i++)
  allyGridRefs.push(Array.from(Array(10), () => React.createRef()));

const gridContent = [];
for (let i = 0; i < 10; i++) gridContent.push(Array.from(Array(10), () => ""));

const gridContentEnemy = [];
for (let i = 0; i < 10; i++)
  gridContentEnemy.push(Array.from(Array(10), () => ""));

const neighborsMoves = [
  [0, -1],
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
];

function errorHandle(shipsObjRefCurrent) {
  shipsObjRefCurrent.style.borderColor = "red";
  setTimeout(() => (shipsObjRefCurrent.style.borderColor = "blue"), 500);
  return false;
}

function multidimensionalIncludes(multidimensionalArray, searchArray) {
  return multidimensionalArray.some(
    (row) => JSON.stringify(row) === JSON.stringify(searchArray)
  );
}

function deepListCopy(l) {
  return JSON.parse(JSON.stringify(l));
}

export default function SeaWars() {
  const hitCounterRef = React.useRef(0);
  const [username, setUsername] = React.useState("");
  const [roomID, setRoomID] = React.useState("");
  const [gridContentState, setGridContentState] = React.useState(gridContent);
  const [turn, setTurn] = React.useState(false);
  const [gridContentEnemyState, setGridContentEnemyState] =
    React.useState(gridContentEnemy);

  const [fieldReady, setFieldReady] = React.useState(false);
  const [showField, setShowField] = React.useState(false);

  function joinRoom() {
    if (username && roomID) {
      socket.emit("join_room", roomID);
    }
  }

  React.useEffect(() => {
    socket.on("hit_back", (data) => {
      setGridContentState((prev) => {
        const gridContentStateCopy = deepListCopy(prev);
        if (grid[data.row][data.col]) {
          gridContentStateCopy[data.row][data.col] = "╳";
          hitCounterRef.current += 1;
          console.log(hitCounterRef);
          if (hitCounterRef.current === 20) {
            socket.emit("lose", true)
            alert("you lose :(");
            setTimeout(() => document.location.reload(), 3000);
          }
          const hit_result_data = {
            row: data.row,
            col: data.col,
            mark: "╳",
          };
          socket.emit("hit_result", hit_result_data);
        } else {
          const hit_result_data = {
            row: data.row,
            col: data.col,
            mark: "○",
          };
          socket.emit("hit_result", hit_result_data);
          gridContentStateCopy[data.row][data.col] = "○";
        }
        return gridContentStateCopy;
      });
    });
    socket.on("hit_result_back", (data) => {
      setGridContentEnemyState((prev) => {
        const gridContentEnemyStateCopy = deepListCopy(prev);
        gridContentEnemyStateCopy[data.row][data.col] = data.mark;
        return gridContentEnemyStateCopy;
      });
    });
    socket.on("win", () => {
      setTimeout(() => document.location.reload(), 3000);
      alert("you win!");
    });
    socket.on("lose", () => {
      setTimeout(() => document.location.reload(), 3000);
      alert("you lose :(");
    });
    socket.on("change_turn_back", (isTurn) => {
      setTurn(isTurn);
    });
    socket.on("set_turn", (isTurn) => {
      setTurn(true);
    });
    socket.on("success_join", (data) => {
      setShowField(true);
    });
    socket.on("failed_join", (data) => {
      alert("failed to join, room is full");
    });
  }, [socket]);

  const currentShipRef = React.useRef();
  const grabXRef = React.useRef();
  const grabYRef = React.useRef();

  const [ships, setShips] = React.useState({
    ship4: {
      orientation: "horizontal",
      size: 4,
      reference: React.useRef(),
      position: { x: 10, y: 320 },
      neighbors: [],
      map: [],
      isPlaced: false,
    },
    ship3_1: {
      orientation: "horizontal",
      size: 3,
      reference: React.useRef(),
      position: { x: 140, y: 320 },
      neighbors: [],
      map: [],
      isPlaced: false,
    },
    ship3_2: {
      orientation: "horizontal",
      size: 3,
      reference: React.useRef(),
      position: { x: 140, y: 420 },
      neighbors: [],
      map: [],
      isPlaced: false,
    },
    ship2_1: {
      orientation: "horizontal",
      size: 2,
      reference: React.useRef(),
      position: { x: 240, y: 320 },
      neighbors: [],
      map: [],
      isPlaced: false,
    },
    ship2_2: {
      orientation: "horizontal",
      size: 2,
      reference: React.useRef(),
      position: { x: 240, y: 390 },
      neighbors: [],
      map: [],
      isPlaced: false,
    },
    ship2_3: {
      orientation: "horizontal",
      size: 2,
      reference: React.useRef(),
      position: { x: 240, y: 460 },
      neighbors: [],
      map: [],
      isPlaced: false,
    },
    ship1_1: {
      orientation: "horizontal",
      size: 1,
      reference: React.useRef(),
      position: { x: 10, y: 450 },
      neighbors: [],
      map: [],
      isPlaced: false,
    },
    ship1_2: {
      orientation: "horizontal",
      size: 1,
      reference: React.useRef(),
      position: { x: 50, y: 450 },
      neighbors: [],
      map: [],
      isPlaced: false,
    },
    ship1_3: {
      orientation: "horizontal",
      size: 1,
      reference: React.useRef(),
      position: { x: 90, y: 450 },
      neighbors: [],
      map: [],
      isPlaced: false,
    },
    ship1_4: {
      orientation: "horizontal",
      size: 1,
      reference: React.useRef(),
      position: { x: 10, y: 490 },
      neighbors: [],
      map: [],
      isPlaced: false,
    },
  });

  function generateGridDivsEnemy() {
    const gridDivs = [];
    grid.forEach((row, i) => {
      row.forEach((col, j) => {
        gridDivs.push(
          <div
            ref={enemyGridRefs[i][j]}
            className="spot"
            style={{
              backgroundColor: "white",
              height: `${gridSize - 2}px`,
              width: `${gridSize - 2}px`,
              border: "solid 1px black",
            }}
            onDragStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }}
            onClick={async () => {
              const data = {
                roomID,
                row: i,
                col: j,
              };
              await socket.emit("hit", data);
              setTurn(false);
            }}
            key={`${i}-${j}`}
          >
            {gridContentEnemyState[i][j]}
          </div>
        );
      });
    });
    return gridDivs;
  }

  function generateShipDivsAlly() {
    const shipDivs = [];
    for (const ship in ships) {
      shipDivs.push(
        <div
          ref={ships[ship].reference}
          key={ship}
          draggable
          onDragEnd={(e) =>
            (ships[ship].reference.current.style.display = "inline")
          }
          onDragStart={(e) => {
            setTimeout(
              () => (ships[ship].reference.current.style.display = "none")
            );
            currentShipRef.current = ship;
            const diffX = e.clientX - ships[ship].position.x;
            const diffY = e.clientY - ships[ship].position.y;
            grabXRef.current = parseInt(diffX / gridSize);
            grabYRef.current = parseInt(diffY / gridSize);
          }}
          onMouseUp={(e) => setTimeout(handleMouseClick, 0, e, ship)}
          onContextMenu={(e) => e.preventDefault()}
          style={{
            position: "absolute",
            left: ships[ship].position.x,
            top: ships[ship].position.y,
            width: (() => {
              switch (ships[ship].orientation) {
                case "horizontal":
                  return `${gridSize * ships[ship].size - 4}px`;
                case "vertical":
                  return gridSize - 4;
                default:
                  return "100px";
              }
            })(),
            height: (() => {
              switch (ships[ship].orientation) {
                case "horizontal":
                  return gridSize - 4;
                case "vertical":
                  return `${gridSize * ships[ship].size - 4}px`;
                default:
                  return "100px";
              }
            })(),
            border: "solid 2px blue",
            cursor: "grab",
          }}
        ></div>
      );
    }
    return shipDivs;
  }

  function generateGridDivsAlly() {
    const gridDivs = [];
    grid.forEach((row, i) => {
      row.forEach((col, j) => {
        gridDivs.push(
          <div
            ref={allyGridRefs[i][j]}
            className="spot"
            style={{
              backgroundColor: "white",
              height: `${gridSize - 2}px`,
              width: `${gridSize - 2}px`,
              border: "solid 1px black",
            }}
            key={`${i}-${j}`}
            onDragStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }}
            onDragOver={(e) => {
              e.preventDefault();
              return false;
            }}
            onDrop={(e) => handleDrop(e, i, j)}
          >
            {gridContentState[i][j]}
          </div>
        );
      });
    });
    return gridDivs;
  }

  function handleMouseClick(e, shipName) {
    if (e.button !== 2) return;

    const shipObj = ships[shipName];
    const shipMap = shipObj.map;
    const shipObjRefCurrent = shipObj.reference.current;

    let shipsCopy = Object.assign({}, ships);

    if (shipObj.isPlaced) {
      var row = shipMap[0][0];
      var col = shipMap[0][1];

      switch (shipObj.orientation) {
        case "vertical":
          if (col > 10 - shipObj.size) return errorHandle(shipObjRefCurrent);
          break;
        case "horizontal":
          if (row > 10 - shipObj.size) return errorHandle(shipObjRefCurrent);
          break;
        default:
          console.warn("wrong ship orientation in start rmb handler");
      }
    }

    let allNeighborsExceptCurrentShip = [];
    for (const ship in ships) {
      if (ship !== shipName) {
        ships[ship].neighbors.forEach((neighborPair) =>
          allNeighborsExceptCurrentShip.push(neighborPair)
        );
      }
    }

    let newMap = [];

    switch (shipObj.orientation) {
      case "horizontal":
        for (let i = 0; i < shipObj.size; i++) {
          if (
            multidimensionalIncludes(allNeighborsExceptCurrentShip, [
              row + i,
              col,
            ])
          )
            return errorHandle(shipObjRefCurrent);
          newMap.push([row + i, col]);
        }

        shipsCopy[shipName].orientation = "vertical";
        break;

      case "vertical":
        for (let i = 0; i < shipObj.size; i++) {
          if (
            multidimensionalIncludes(allNeighborsExceptCurrentShip, [
              row,
              col + i,
            ])
          )
            return errorHandle(shipObjRefCurrent);
          newMap.push([row, col + i]);
        }

        shipsCopy[shipName].orientation = "horizontal";
        break;

      default:
        console.warn("wrong ship orientation in rmb");
    }

    shipsCopy[shipName].map = newMap;

    let newNeighbors = [];

    newMap.forEach((coords) => {
      neighborsMoves.forEach((move) => {
        const neighborsRow = coords[0] + move[0];
        const neighborsCol = coords[1] + move[1];
        const neighborsArray = [neighborsRow, neighborsCol];
        if (
          neighborsRow >= 0 &&
          neighborsRow <= 9 &&
          neighborsCol >= 0 &&
          neighborsCol <= 9
        )
          if (
            !multidimensionalIncludes(newNeighbors, neighborsArray) &&
            !multidimensionalIncludes(newMap, neighborsArray)
          )
            newNeighbors.push(neighborsArray);
      });
    });
    shipsCopy[shipName].neighbors = newNeighbors;

    setShips(shipsCopy);
  }

  function handleDrop(e, dropRow, dropCol) {
    e.stopPropagation();
    e.preventDefault();

    const currentShipName = currentShipRef.current;
    const shipObj = ships[currentShipName];
    const shipsObjRefCurrent = shipObj.reference.current;

    const grabX = grabXRef.current;
    const grabY = grabYRef.current;

    const placeX = dropCol * gridSize - grabX * gridSize + 8;
    const placeY = dropRow * gridSize - grabY * gridSize + 8;

    const placeCol = Math.floor(placeX / gridSize);
    const placeRow = Math.floor(placeY / gridSize);

    switch (shipObj.orientation) {
      case "horizontal":
        if (placeCol > 10 - shipObj.size || placeCol < 0)
          return errorHandle(shipsObjRefCurrent);
        break;

      case "vertical":
        if (placeRow > 10 - shipObj.size || placeRow < 0)
          return errorHandle(shipsObjRefCurrent);
        break;

      default:
        return console.warn(
          "ship have wrong orientation in dropHandle misplace check"
        );
    }

    let shipsCopy = Object.assign({}, ships);

    let newMap = [];
    let newNeighbors = [];

    switch (shipObj.orientation) {
      case "vertical":
        for (let i = 0; i < shipObj.size; i++) {
          const row = placeRow + i;
          const col = placeCol;
          const newMapPair = [row, col];
          for (const shipName in ships) {
            if (shipName !== currentShipName) {
              if (
                multidimensionalIncludes(
                  shipsCopy[shipName].neighbors,
                  newMapPair
                )
              )
                return errorHandle(shipsObjRefCurrent);
            }
          }
          newMap.push(newMapPair);
        }
        break;
      case "horizontal":
        for (let i = 0; i < shipObj.size; i++) {
          const row = placeRow;
          const col = placeCol + i;
          const newMapPair = [row, col];
          for (const shipName in ships) {
            if (shipName !== currentShipName) {
              if (
                multidimensionalIncludes(
                  shipsCopy[shipName].neighbors,
                  newMapPair
                )
              )
                return errorHandle(shipsObjRefCurrent);
            }
          }
          newMap.push(newMapPair);
        }
        break;
      default:
        return console.warn(
          "ship have wrong orientation in dropHandle, newMap loop"
        );
    }
    shipsCopy[currentShipName].map = newMap;

    // calculate new neighbors
    newMap.forEach((coords) => {
      neighborsMoves.forEach((move) => {
        const neighborsRow = coords[0] + move[0];
        const neighborsCol = coords[1] + move[1];
        const neighborsArray = [neighborsRow, neighborsCol];
        if (
          neighborsRow >= 0 &&
          neighborsRow <= 9 &&
          neighborsCol >= 0 &&
          neighborsCol <= 9
        )
          if (
            !multidimensionalIncludes(newNeighbors, neighborsArray) &&
            !multidimensionalIncludes(newMap, neighborsArray)
          )
            newNeighbors.push(neighborsArray);
      });
    });
    shipsCopy[currentShipName].neighbors = newNeighbors;

    shipsCopy[currentShipName].position.x = placeX;
    shipsCopy[currentShipName].position.y = placeY;

    shipsCopy[currentShipName].isPlaced = true;
    setShips(shipsCopy);

    return false;
  }

  return (
    <div className="App">
      {!showField ? (
        <>
          <input
            type="text"
            placeholder="Name..."
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="Room ID..."
            onChange={(e) => setRoomID(e.target.value)}
          />
          <button onClick={joinRoom}>Join room</button>
        </>
      ) : (
        <div
          className="Grids"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(2,${gridSize * 10}px)`,
            gridTemplateRows: "repeat(2,auto)",
            gap: "50px",
          }}
        >
          <div
            className="AllyGrid"
            style={{
              textAlign: "center",
              display: "grid",
              lineHeight: "25px",
              width: `${gridSize * 10}px`,
              gridTemplateColumns: `repeat(10,${gridSize}px)`,
              gridTemplateRows: `repeat(10,${gridSize}px)`,
            }}
          >
            {generateGridDivsAlly()}
          </div>
          {generateShipDivsAlly()}
          <div
            className="EnemyGrid"
            style={{
              display: "grid",
              textAlign: "center",
              lineHeight: "25px",
              width: `${gridSize * 10}px`,
              gridTemplateColumns: `repeat(10,${gridSize}px)`,
              gridTemplateRows: `repeat(10,${gridSize}px)`,
            }}
          >
            {generateGridDivsEnemy()}
          </div>
          {fieldReady ? (
            <div
              className="draggablePrevention"
              style={{
                position: "absolute",
                width: "300px",
                height: "300px",
                left: "8px",
                top: "8px",
                opacity: "1",
              }}
            ></div>
          ) : (
            <></>
          )}
          {turn ? null : (
            <div
              className="earlyHitPrevention"
              style={{
                position: "absolute",
                width: "300px",
                height: "300px",
                left: "358px",
                top: "8px",
                opacity: "1",
              }}
            ></div>
          )}
          <button
            style={{ position: "absolute", right: 0 }}
            onClick={() => {
              for (const shipName in ships) {
                if (!ships[shipName].isPlaced) {
                  alert("not all ships placed");
                  return;
                }
              }
              for (const shipName in ships) {
                ships[shipName].map.forEach((coords) => {
                  grid[coords[0]][coords[1]] = 1;
                });
              }
              alert("field is ready for game!");
              setFieldReady(true);
              socket.emit("field_ready", true);
            }}
          >
            Ready
          </button>
        </div>
      )}
    </div>
  );
}

// .App {
//   font-family: sans-serif;
//   text-align: center;
// }

// .div {
//   position: relative;
// }

// .div::after {
//
// .App {
//   font-family: sans-serif;
//   text-align: center;
// }

// .div {
//   position: relative;
// }
