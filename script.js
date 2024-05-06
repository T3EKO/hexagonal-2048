
// ##### ##### ----- Math Libraries ----- ##### ##### \\

class Mathc {
	static mod(a, b) {
		return a - b * Math.floor(a / b);
	}

	static randomOf(array) {
		return array[Math.floor(Math.random() * array.length)];
	}

	static contains(array, el) {
		for(const el2 of array) {
			if(Mathc.matches(el, el2)) return true;
		}
		return false;
	}

	static matches(a, b) {
		if(typeof a != typeof b) return false;
		if(a instanceof Array) {
			if(a.length != b.length) return false;
			return a.filter((e, i) => {
				return !Mathc.matches(e, b[i]);
			}).length < 1;
		}
		return a === b;
	}

	static condenseArray(array, _qcontinue, mdata) {
		const movementData = new MoveData();
	    for(let i = 1;i < array.length;i++) {
	        if(array[i] != 0 && array[i - 1] == 0) {
	            const value = array[i];
	            array[i] = 0;
	            let ind = i;
	            while(array[ind - 1] == 0 && ind > 0) {
	                ind--;
	            }
	            array[ind] = value;
	            if(_qcontinue) mdata.updateMovement(value, i, ind);
	            else movementData.addMovement(value, i, ind);
	        }
	    }
	    array.forEach((e, i) => { if(!_qcontinue && e != 0) movementData.addStationary(e, i); });
	    return [array, _qcontinue ? mdata : movementData];
	}
	static combineArray(array, mdata, condition, logic) {
	    for(let i = 0;i < array.length - 1;i++) {
	        if(condition(array[i + 1], array[i])) {
	        	const a = array[i];
	        	const b = array[i + 1];
	            array[i] = logic(array[i], array[i + 1]);
	            array[i + 1] = 0;
	            mdata.addCombine([a, b], [i, i + 1], array[i], i);
	        }
	    }
	    return [array, mdata];
	}
	static applyLogic(array, condition, logic) {
		const condensed = Mathc.condenseArray([...array]);
		const combined = Mathc.combineArray(...condensed, condition, logic)
		const condensed2 = Mathc.condenseArray(combined[0], true, combined[1]);
		return condensed2;
	}
}

// ##### ##### ----- Keyboard ----- ##### ##### \\

class Input {
	static keys = new Object();
	static keyBinds = new Object();
	static keyNames = {
		"KeyA": "A",
		"KeyB": "B",
		"KeyC": "C",
		"KeyD": "D",
		"KeyE": "E",
		"KeyF": "F",
		"KeyG": "G",
		"KeyH": "H",
		"KeyI": "I",
		"KeyJ": "J",
		"KeyK": "K",
		"KeyL": "L",
		"KeyM": "M",
		"KeyN": "N",
		"KeyO": "O",
		"KeyP": "P",
		"KeyQ": "Q",
		"KeyR": "R",
		"KeyS": "S",
		"KeyT": "T",
		"KeyU": "U",
		"KeyV": "V",
		"KeyW": "W",
		"KeyX": "X",
		"KeyY": "Y",
		"KeyZ": "Z",
		"Digit0": "0",
		"Digit1": "1",
		"Digit2": "2",
		"Digit3": "3",
		"Digit4": "4",
		"Digit5": "5",
		"Digit6": "6",
		"Digit7": "7",
		"Digit8": "8",
		"Digit9": "9",
		"Numpad0": "Num0",
		"Numpad1": "Num1",
		"Numpad2": "Num2",
		"Numpad3": "Num3",
		"Numpad4": "Num4",
		"Numpad5": "Num5",
		"Numpad6": "Num6",
		"Numpad7": "Num7",
		"Numpad8": "Num8",
		"Numpad9": "Num9"
	}

	static getKeyName(key) {
		return Input.keyNames[key] || key;
	}

	static onKeyDown(e) {
		if(KeybindGrid.bnk.active) {
			KeybindGrid.bnk.active = false;
			KeybindGrid.bnk.el.classList.remove("bind-new-key-active");
			if(e.code == "Escape") return;
			bindNewMovementKey(e.code, KeybindGrid.bnk.dir);
			keybindGrid.updateGrid();
			return;
		}

		Input.keys[e.code] = true;
		if(!Input.keyBinds[e.code]) return;
		const callbacks = Object.values(Input.keyBinds[e.code]);
		callbacks.forEach((e) => { e(); });
	}
	static onKeyUp(e) {
		Input.keys[e.code] = false;
	}

	static bindKey(key, name, callback) {
		if(!Input.keyBinds[key]) Input.keyBinds[key] = new Object();
		Input.keyBinds[key][name] = callback;
	}
	static unbindKey(key, name) {
		delete Input.keyBinds[key][name];
	}
}
document.addEventListener("keydown", Input.onKeyDown);
document.addEventListener("keyup", Input.onKeyUp);

// ##### ##### ----- Storing data for tile animation ----- ##### ##### \\

class MoveData {
	static countMovements(tiles) {
		let movements = 0;
		tiles.forEach((e) => {
			movements += !Mathc.matches(e[2], e[3]);
		});
		return movements;
	}

	static merge(...mdataSets) {
		const entries = mdataSets.map(e => Object.entries(e.movements)).reduce((a, b) => { return a.concat(b); });
		const newData = new MoveData();
		entries.forEach((e) => {
			newData.movements[e[0]] = e[1];
		});
		return newData;
	}

	constructor() {
		this.movements = new Object();
	}

	addStationary(value, pos) {
		if(!this.movements[pos]) this.movements[pos] = ["move", [value], [pos], value, pos];
	}

	addMovement(value, start, end) {
		this.movements[end] = ["move", [value], [start], value, end];
	}

	addCombine(values, starts, endValue, end) {
		const startMovements = [this.movements[starts[0]] ? this.movements[starts[0]] : ["move", [values[0]], [starts[0]], values[0], starts[0]], this.movements[starts[1]] ? this.movements[starts[1]] : ["move", [values[1]], [starts[1]], values[1], starts[1]]];
		const newMovement = ["combine", [startMovements[0][1][0], startMovements[1][1][0]], [startMovements[0][2][0], startMovements[1][2][0]], endValue, end];
		delete this.movements[starts[0]];
		delete this.movements[starts[1]];
		this.movements[end] = newMovement;
	}

	addSpawn(value, pos) {
		this.movements[pos] = ["spawn", [value], [pos], value, pos];
	}

	updateMovement(value, start, end) {
		const exists = this.movements[start];
		const movement = exists ? this.movements[start] : ["move", [value], [start], value, end];
		movement[4] = end;
		this.movements[end] = movement;
		if(exists) delete this.movements[start];
	}

	replaceIndicesWithPoses(poses) {
		Object.keys(this.movements).forEach((e) => {
			const movement = this.movements[e];
			const pos = poses[e];
			movement[4] = pos;
			movement[2] = movement[2].map(e => poses[e]);
			this.movements[pos] = movement;
			delete this.movements[e];
		});
		return this;
	}

	extractTiles() {
		const tiles = new Array();
		Object.values(this.movements).forEach((e) => {
			switch(e[0]) {
				case "combine":
					tiles.push(["combine-in", e[1][0], e[2][0], e[4]]);
					tiles.push(["combine-in", e[1][1], e[2][1], e[4]]);
					tiles.push(["combine-out", e[3], e[4], e[4]]);
					break;
				case "move":
					tiles.push(["move", e[1][0], e[2][0], e[4]]);
					break;
				case "spawn":
					tiles.push(["spawn", e[1][0], e[4], e[4]]);
			}
		});
		return tiles;
	}
}

// ##### ##### ----- Grid of hexagon ----- ##### ##### \\

class RuleSet {
	constructor(gridSize, startTileCount, pool, comparison, combination, log) {
		this.gridSize = gridSize;
		this.startTileCount = startTileCount;
		this.pool = pool;
		this.comparison = comparison;
		this.combination = combination;
		this.log = log;
	}
}

class HexGrid {
	static ruleSets = {
		"default": new RuleSet(
			3,
			2,
			[2, 2, 2, 2, 4],
			(a, b) => { return a == b && a != 0 && b != 0 },
			(a, b) => { return a + b; },
			(a) => { return Math.log10(a); }
		),
		"binary": new RuleSet(
			3,
			2,
			["1", "1", "1", "1", "10"],
			(a, b) => { return a == b && a != 0 && b != 0},
			(a, b) => { return (parseInt(a.toString(), 2) + parseInt(b.toString(), 2)).toString(2); },
			(a) => { return Math.log10(parseInt(a.toString(), 2)); }
		),
		"base-3": new RuleSet(
			3,
			2,
			["2", "2", "2", "2", "11"],
			(a, b) => { return a == b && a != 0 && b != 0 },
			(a, b) => { return (parseInt(a.toString(), 3) + parseInt(b.toString(), 3)).toString(3); },
			(a) => { return Math.log10(parseInt(a.toString(), 3)); }
		),
		"hexadecimal": new RuleSet(
			3,
			2,
			[2, 2, 2, 2, 4],
			(a, b) => { return a == b && a != 0 && b != 0 },
			(a, b) => { return (parseInt(a.toString(), 16) + parseInt(b.toString(), 16)).toString(16); },
			(a) => { return Math.log10(parseInt(a.toString(), 16)); }
		),
		"base-6": new RuleSet(
			3,
			2,
			[2, 2, 2, 2, 4],
			(a, b) => { return a == b && a != 0 && b != 0 },
			(a, b) => { return (parseInt(a.toString(), 6) + parseInt(b.toString(), 6)).toString(6); },
			(a) => { return Math.log10(parseInt(a.toString(), 6)); }
		),
		"dozenal": new RuleSet(
			3,
			2,
			[2, 2, 2, 2, 4],
			(a, b) => { return a == b && a != 0 && b != 0 },
			(a, b) => { return (parseInt(a.toString(), 12) + parseInt(b.toString(), 12)).toString(12); },
			(a) => { return Math.log10(parseInt(a.toString(), 12)); }
		),
		"suboptimal": new RuleSet(
			3,
			2,
			[2, 2, 2, 2, 4],
			(a, b) => { return a == b && a != 0 && b != 0 },
			(a, b) => { return (parseInt(a.toString(), 17) + parseInt(b.toString(), 17)).toString(17).toUpperCase(); },
			(a) => { return Math.log10(parseInt(a.toString(), 17)); }
		),
		"alphabase": new RuleSet(
			3,
			2,
			["A", "A", "A", "A", "K"],
			(a, b) => { return a == b && a != 0 && b != 0 },
			(a, b) => { return (parseInt(a.toString(), 36) + parseInt(b.toString(), 36)).toString(36).toUpperCase(); },
			(a) => { return Math.log10(parseInt(a.toString(), 36)) / Math.log10(20); }
		)
	}

	static tileCount(size) {
		if(!size) return null;
		if(size == 1) return 1;
		const inner = HexGrid.tileCount(size - 1);
		const edges = 6 * (size - 1);
		return inner + edges;
	}
	static genTileElements(size) {
		const elements = new Array();
		const num = HexGrid.tileCount(size);
		for(let i = 0;i < num;i++) {
			const el = document.createElement("div");
			el.classList.add("hex");
			const pos = HexGrid.getPosFromIndex(size, i);
			el.style.setProperty("--posx", pos[0]);
			el.style.setProperty("--posy", pos[1]);
			el.style.setProperty("--posyparity", Mathc.mod(pos[1] - size, 2));
			elements.push(el);
		}
		return elements;
	}
	static genTileElement(size, pos) {
		const el = document.createElement("div");
		el.classList.add("hex");
		el.style.setProperty("--posx", pos[0]);
		el.style.setProperty("--posy", pos[1]);
		el.style.setProperty("--posyparity", Mathc.mod(pos[1] - size, 2));
		return el;
	}
	static getPosFromIndex(size, ind) {
		const s1 = size;
		const s2 = 2 * (size - 1) + 1;
		const rowSizes = new Array(s2).fill(0).map((e, i) => {
			return 0 - Math.abs(s1 - i - 1) + s2;
		});
		let i = 0;
		ind++;
		while(ind > 0 && i < rowSizes.length) {
			ind -= rowSizes[i];
			i++;
		}
		i--;
		ind += rowSizes[i];
		return [ind + HexGrid.getRowOffset(size, i), i + 1];
	}
	static getAllPositions(size, offset) {
		offset = offset || [0, 0];
		return new Array(HexGrid.tileCount(size)).fill(0).map((e, i) => { return HexGrid.getPosFromIndex(size, i); }).map((e) => { return [e[0] + offset[0], e[1] + offset[1]]; });
	}
	static getAllEdges(size) {
		const poses = HexGrid.getAllPositions(size);
		if(size == 1) return poses;
		// const innerPoses = HexGrid.getAllPositions(size - 1, [1, 1]);
		return poses.filter((e) => { return HexGrid.isTileOnEdge(size, e); });
	}
	static tileParity(size, pos) {
		return Mathc.mod(pos[1] - size, 2);
	}
	static getRowOffset(size, row) {
		const s1 = size;
		const s2 = 2 * (size - 1) + 1;
		let v = 0 - Math.abs(s1 - row - 1) + s2;
		return Math.floor(0.5 * (s2 - v));
	}
	static getIndexFromPos(size, pos) {
		const pos2 = [pos[0], pos[1] - 1];
		const s1 = size;
		const s2 = 2 * (size - 1) + 1;
		const rowSizes = new Array(s2).fill(0).map((e, i) => {
			return 0 - Math.abs(s1 - i - 1) + s2;
		});
		pos2[0] -= HexGrid.getRowOffset(size, pos2[1]);
		let ind = 0;
		let i = 0;
		while(i < pos2[1]) {
			ind += rowSizes[i];
			i++;
		}
		return ind + pos2[0] - 1;
	}
	static stepPositionDiagonallyByParity(size, pos, direction) {
		const parity = HexGrid.tileParity(size, pos);
		return [pos[0] + direction[0] * (direction[0] == -1 ? 1 - parity : parity), pos[1] + direction[1]];
	}
	static getIncreasingAdjacentPositionsInBounds(size, pos) {
		const adjposes = HexGrid.getIncreasingAdjacentPositions(size, pos);
		return adjposes.filter((e) => {
			return HexGrid.isTileInGrid(size, e);
		});
	}
	static getIncreasingAdjacentPositions(size, pos) {
		return [ [pos[0] + 1, pos[1]], HexGrid.stepPositionDiagonallyByParity(size, pos, [1, 1]), HexGrid.stepPositionDiagonallyByParity(size, pos, [-1, 1]) ];
	}
	static setTileContents(el, contents, logFunction) {
		el.innerHTML = `<div class="hex-text" >${contents}</div>`;
		el.style.setProperty("--contentlength", contents.toString().length);
		const logval = typeof logFunction == "function" ? logFunction(contents) : null;
		el.style.setProperty("--log", logval);
		if(logval !== null) el.classList.add("log");
		el.classList.add("t");
		el.classList.add(`t${contents}`);
		el.classList.add(`l${contents.toString().length}`);
		return el;
	}
	static randomGrid(size, startTileCount, pool) {
		const sTiles = new Array(startTileCount).fill(0).map(() => { return Mathc.randomOf(pool); });
		const tiles = new Array(HexGrid.tileCount(size)).fill(0);
		const mdata = new MoveData();
		const availablePositions = tiles.map((e, i) => i);
		for(const tile of sTiles) {
			const ind = Math.floor(Math.random() * availablePositions.length);
			const posInd = availablePositions[ind];
			tiles[posInd] = tile;
			availablePositions.splice(ind, 1);
			const pos = HexGrid.getPosFromIndex(size, posInd);
			mdata.addSpawn(tile, pos);
		}
		return [tiles, mdata];
	}
	static isTileOnEdge(size, pos) {
		const rowSize = 0 - Math.abs(size - pos[1]) + 2 * (size - 1) + 1;
		const rowOffset = HexGrid.getRowOffset(size, pos[1] - 1);
		let tpos = [pos[0] - rowOffset, pos[1]];
		if(tpos[0] < 1 || tpos[0] > rowSize) return false;
		if(tpos[1] < 1 || tpos[1] > 2 * (size - 1) + 1) return false;
		if(tpos[0] == 1 || tpos[1] == 1) return true;
		if(tpos[0] == rowSize || tpos[1] == 2 * (size - 1) + 1) return true;
		return false;
	}
	static isTileInGrid(size, pos) {
		const rowSize = 0 - Math.abs(size - pos[1]) + 2 * (size - 1) + 1;
		const rowOffset = HexGrid.getRowOffset(size, pos[1] - 1);
		let tpos = [pos[0] - rowOffset, pos[1]];
		if(tpos[0] < 1 || tpos[0] > rowSize) return false;
		if(tpos[1] < 1 || tpos[1] > 2 * (size - 1) + 1) return false;
		return true;
	}

	constructor(ruleSetNameOrRuleSet, propElements, disabled) {
		this.type = "default";
		this.ruleSetName = typeof ruleSetNameOrRuleSet == "string" ? ruleSetNameOrRuleSet : null;
		this.ruleSet = typeof ruleSetNameOrRuleSet == "string" ? HexGrid.ruleSets[ruleSetNameOrRuleSet] : ruleSetNameOrRuleSet;
		this.disabled = disabled;
		this.numTiles = HexGrid.tileCount(this.ruleSet.gridSize);
		// this.startTileCount = startTileCount;
		// this.pool = pool;
		// this.combineCondition = combineCondition;
		// this.combinationLogic = combinationLogic;
		// this.logFunction = logFunction;
		const rgridAndMData = HexGrid.randomGrid(this.ruleSet.gridSize, this.ruleSet.startTileCount, this.ruleSet.pool);
		this.mdata = rgridAndMData[1].extractTiles();
		this.tiles = disabled ? new Array(this.numTiles).fill(0) : rgridAndMData[0];
		this.edgeTiles = HexGrid.getAllEdges(this.ruleSet.gridSize);
		this.propElements = propElements;
		this.updateGrid();
	}

	getSaveState() {
		const savestate = {
			ruleSetName: this.ruleSetName,
			tiles: this.tiles
		};
		return savestate;
	}

	loadSaveState(savestate) {
		this.setRuleSet(savestate.ruleSetName);
		this.setContents(savestate.tiles);
	}

	updateGrid() {
		if(this.updateBefore) this.updateBefore();
		this.propElements.forEach((e) => {
			switch(e[0]) {
				case "grid":
					e[1].innerHTML = "";
					e[1].append(...HexGrid.genTileElements(this.ruleSet.gridSize));
					e[1].style.setProperty("--grid-size", this.ruleSet.gridSize);
					break;
				case "grid-contents":
					if(this.disabled) {
						e[1].innerHTML = "";
						const contentElements = HexGrid.genTileElements(this.ruleSet.gridSize).map((e, i) => {
							return HexGrid.setTileContents(e, this.tiles[i], this.ruleSet.log);
						}).filter((e, i) => {
							return this.tiles[i] != 0;
						});
						e[1].append(...contentElements);
						this.contentElements = contentElements;
						e[1].style.setProperty("--grid-size", this.ruleSet.gridSize);
					} else {
						const tileEls = new Array();
						this.mdata.forEach((e) => {
							const el = HexGrid.setTileContents(HexGrid.genTileElement(this.ruleSet.gridSize, e[3]), e[1], this.ruleSet.log);
							el.style.setProperty("--prevposx", e[2][0]);
							el.style.setProperty("--prevposy", e[2][1]);
							el.style.setProperty("--prevposyparity", Mathc.mod(e[2][1] - this.ruleSet.gridSize, 2));
							el.classList.add("anim-t");
							el.classList.add(`${e[0]}-anim-t`);
							tileEls.push(el);
						});
						e[1].innerHTML = "";
						e[1].append(...tileEls);
						this.contentElements = tileEls;
						e[1].style.setProperty("--grid-size", this.ruleSet.gridSize);
					}
					break;
				case "wrapper":
					e[1].style.setProperty("--grid-size", this.ruleSet.gridSize);
			}
		});
		if(this.updateSpecific) this.updateSpecific();
	}

	// setSize(size) {
	// 	this.ruleSet.gridSize = size;
	// 	this.numTiles = HexGrid.tileCount(this.ruleSet.gridSize);
	// 	this.tiles = disabled ? new Array(this.numTiles).fill(0) : HexGrid.randomGrid(this.ruleSet.gridSize, startTileCount, this.pool);
	// 	this.edgeTiles = HexGrid.getAllEdges(this.ruleSet.gridSize);
	// 	this.updateGrid();
	// }

	setRuleSet(ruleSetNameOrRuleSet) {
		this.ruleSetName = typeof ruleSetNameOrRuleSet == "string" ? ruleSetNameOrRuleSet : null;
		this.ruleSet = typeof ruleSetNameOrRuleSet == "string" ? HexGrid.ruleSets[ruleSetNameOrRuleSet] : ruleSetNameOrRuleSet;

		this.numTiles = HexGrid.tileCount(this.ruleSet.gridSize);
		const rgridAndMData = HexGrid.randomGrid(this.ruleSet.gridSize, this.ruleSet.startTileCount, this.ruleSet.pool);
		this.mdata = rgridAndMData[1].extractTiles();
		this.tiles = this.disabled ? new Array(this.numTiles).fill(0) : rgridAndMData[0];
		this.updateGrid();
	}

	setContents(contents, anim) {
		this.tiles = [...contents];
		this.mdata = this.createMDataForStaticGrid(this.tiles, anim).extractTiles();
		this.updateGrid();
	}

	createMDataForStaticGrid(tiles, spawnAnim) {
		const mdata = new MoveData();
		this.tiles.forEach((e, i) => {
			if(e != 0) {
				const params = [e, HexGrid.getPosFromIndex(this.ruleSet.gridSize, i)];
				return spawnAnim ? mdata.addSpawn(...params) : mdata.addStationary(...params);
			}
		});
		return mdata;
	}

	applyLogicInDirection(direction) {
		const positions = this.getRowPositionsInDirection(direction);
		const tiles = positions.map((e) => { return Mathc.applyLogic(this.getTilesFromPositions(e), this.ruleSet.comparison, this.ruleSet.combination); });
		positions.forEach((e, i1) => { e.forEach((e, i2) => {
			this.tiles[HexGrid.getIndexFromPos(this.ruleSet.gridSize, e)] = tiles[i1][0][i2];
		}); });
		const movementData = MoveData.merge(...tiles.map((e, i) => { return e[1].replaceIndicesWithPoses(positions[i]); }));
		const availablePositions = this.tiles.map((e, i) => { return HexGrid.getPosFromIndex(this.ruleSet.gridSize, i); }).filter((e, i) => { return this.tiles[i] == 0; });
		const spawnPos = Mathc.randomOf(availablePositions);

		const tmdata = movementData.extractTiles();
		const movements = MoveData.countMovements(tmdata);

		if(availablePositions.length > 0 && movements > 0) {
			const ind = HexGrid.getIndexFromPos(this.ruleSet.gridSize, spawnPos);
			const rtile = Mathc.randomOf(this.ruleSet.pool);
			this.tiles[ind] = rtile;
			movementData.addSpawn(rtile, spawnPos);
		}
		this.mdata = movementData.extractTiles();
		this.updateGrid();
	}

	isTileOnEdge(pos) {
		return HexGrid.isTileOnEdge(this.ruleSet.gridSize, pos);
	}
	getTilesFromPositions(positions) {
		return positions.map((e) => { return this.tiles[HexGrid.getIndexFromPos(this.ruleSet.gridSize, e)]; });
	}

	loseCondition() {
		return !this.tiles.map((e1, i1) => {
			if(i1 == this.tiles.length - 1) return false;
			const incradjposibds = this.getTilesFromPositions(HexGrid.getIncreasingAdjacentPositionsInBounds(this.ruleSet.gridSize, HexGrid.getPosFromIndex(this.ruleSet.gridSize, i1)));
			return incradjposibds.map((e2, i2) => {
				return ((e1 == e2 || e2 == 0) && e1 != 0) || ((e2 == e1 || e1 == 0) && e2 != 0);
			}).reduce((a, b) => { return a || b; });
		}).reduce((a, b) => { return a || b; });
	}

	getRowPositionsInDirection(direction) {
		if(direction[1] == 0)
			return this.getRowPositionsInXDirection(direction[0]);
		const rowPositions = new Array(2 * (this.ruleSet.gridSize - 1) + 1).fill(0).map((e, i) => { return [i + 1, this.ruleSet.gridSize]; });
		return rowPositions.map((e) => { return this.getTilePositionsInLine(e, direction); });
	}
	getRowPositionsInXDirection(direction) {
		const rowPositions = new Array(2 * (this.ruleSet.gridSize - 1) + 1).fill(0).map((e, i) => { return [1, i + 1]; });
		return rowPositions.map((e) => { return this.getTilePositionsInRow(e, direction); });
	}
	getTilePositionsInLine(startPos, direction) {
		if(direction[1] == 0)
			return this.getTilePositionsInRow(startPos, direction[0]);
		const edges = this.getEdgesInLine(startPos, direction);
		const positions = new Array();
		positions.push([...edges[0]]);
		let pos = [...edges[0]];
		while(!Mathc.matches(pos, edges[1])) {
			pos = HexGrid.stepPositionDiagonallyByParity(this.ruleSet.gridSize, pos, direction);
			positions.push([...pos]);
		}
		return positions;
	}
	getEdgesInLine(startPos, direction) {
		const edges = new Array();
		const allEdges = this.edgeTiles;
		let pos = [...startPos];
		let step = [-direction[0], -direction[1]];
		while(!this.isTileOnEdge(pos)) {
			pos = HexGrid.stepPositionDiagonallyByParity(this.ruleSet.gridSize, pos, step);
		}
		while(this.isTileOnEdge(pos)) {
			pos = HexGrid.stepPositionDiagonallyByParity(this.ruleSet.gridSize, pos, step);
		}
		pos = HexGrid.stepPositionDiagonallyByParity(this.ruleSet.gridSize, pos, [-step[0], -step[1]]);
		edges.push([...pos]);
		step = [...direction];
		pos = HexGrid.stepPositionDiagonallyByParity(this.ruleSet.gridSize, pos, step);
		while(!this.isTileOnEdge(pos)) {
			pos = HexGrid.stepPositionDiagonallyByParity(this.ruleSet.gridSize, pos, step);
		}
		while(this.isTileOnEdge(pos)) {
			pos = HexGrid.stepPositionDiagonallyByParity(this.ruleSet.gridSize, pos, step);
		}
		pos = HexGrid.stepPositionDiagonallyByParity(this.ruleSet.gridSize, pos, [-step[0], -step[1]]);
		edges.push([...pos]);

		return edges;
	}
	getTilePositionsInRow(startPos, direction) {
		const rowSize = 0 - Math.abs(this.ruleSet.gridSize - startPos[1]) + 2 * (this.ruleSet.gridSize - 1) + 1;
		const rowEnds = [1 + HexGrid.getRowOffset(this.ruleSet.gridSize, startPos[1] - 1), 1 + HexGrid.getRowOffset(this.ruleSet.gridSize, startPos[1] - 1) + rowSize - 1];
		if(direction == 1) return new Array(rowSize).fill(0).map((e, i) => {
			return [(i / (rowSize - 1)) * (rowEnds[1] - rowEnds[0]) + rowEnds[0], startPos[1]];
		});
		return new Array(rowSize).fill(0).map((e, i) => {
			return [(i / (rowSize - 1)) * (rowEnds[0] - rowEnds[1]) + rowEnds[1], startPos[1]];
		});
	}
}
class KeybindGrid extends HexGrid {
	static bnk = {
		active: false,
		dir: undefined,
		el: null
	}

	static enterBindNewKey(dir) {
		if(KeybindGrid.bnk.el) KeybindGrid.bnk.el.classList.remove("bind-new-key-active");
		KeybindGrid.bnk.active = true;
		KeybindGrid.bnk.dir = dir;
		KeybindGrid.bnk.el = this;
		this.classList.add("bind-new-key-active");
	}

	constructor(size, propElements, disabled, functionsToBind) {
		super(new RuleSet(size, 0, null, null, null, null), propElements, disabled);
		this.type = "keybind";
		this.functionsToBind = functionsToBind;
	}

	updateBefore() {
		this.tiles = [Input.getKeyName(cBoundKeys.moveUL), Input.getKeyName(cBoundKeys.moveUR), Input.getKeyName(cBoundKeys.moveL), 0, Input.getKeyName(cBoundKeys.moveR), Input.getKeyName(cBoundKeys.moveDL), Input.getKeyName(cBoundKeys.moveDR)];
	}

	updateSpecific() {
		this.contentElements.forEach((e, i) => {
			e.onclick = KeybindGrid.enterBindNewKey.bind(e, moveDirs[i]);
		});
	}

	getElFromDir(dir) {
		const ind = moveDirs.indexOf(dir);
		return this.contentElements[ind];
	}
}

// ##### ##### ----- Keybinds ----- ##### ##### \\

const cBoundKeys = {
	"moveUL": "KeyW",
	"moveUR": "KeyE",
	"moveL": "KeyA",
	"moveR": "KeyD",
	"moveDL": "KeyZ",
	"moveDR": "KeyX"
}

const moveFns = {
	"moveUL": moveUL,
	"moveUR": moveUR,
	"moveL": moveL,
	"moveR": moveR,
	"moveDL": moveDL,
	"moveDR": moveDR
}

const moveDirs = [
	"moveUL",
	"moveUR",
	"moveL",
	"moveR",
	"moveDL",
	"moveDR"
]

function bindNewMovementKey(key, move) {
	Input.unbindKey(cBoundKeys[move], move);
	Input.bindKey(key, move, moveFns[move]);
	cBoundKeys[move] = key;
	keybindGrid.updateGrid();
}

// ##### ##### ----- Game Setup ----- ##### ##### \\

const grid = new HexGrid("alphabase", [["grid", document.querySelector(".board-wrapper>.board-shape")], ["grid", document.querySelector(".board-wrapper>.board-tiles-background")], ["wrapper", document.querySelector(".board-wrapper")], ["grid-contents", document.querySelector(".board-wrapper>.board-tiles")]], false);
const keybindGrid = new KeybindGrid(2, [["grid", document.querySelector(".keybind-wrapper>.keybind-shape")], ["grid", document.querySelector(".keybind-wrapper>.keybind-tiles-background")], ["wrapper", document.querySelector(".keybind-wrapper")], ["grid-contents", document.querySelector(".keybind-wrapper>.keybind-tiles")]], true, []);

function moveUL() { grid.applyLogicInDirection([1, 1]); }
function moveUR() { grid.applyLogicInDirection([-1, 1]); }
function moveL() { grid.applyLogicInDirection([1, 0]); }
function moveR() { grid.applyLogicInDirection([-1, 0]); }
function moveDL() { grid.applyLogicInDirection([1, -1]); }
function moveDR() { grid.applyLogicInDirection([-1, -1]); }

Input.bindKey("KeyW", "moveUL", moveUL);
Input.bindKey("KeyE", "moveUR", moveUR);
Input.bindKey("KeyA", "moveL", moveL);
Input.bindKey("KeyD", "moveR", moveR);
Input.bindKey("KeyZ", "moveDL", moveDL);
Input.bindKey("KeyX", "moveDR", moveDR);

window.addEventListener("load", (e) => {
	const stringSavestate = localStorage.getItem("savestate");
	if(!stringSavestate) return;
	grid.loadSaveState(JSON.parse(stringSavestate));
});
window.addEventListener("beforeunload", (e) => {
	const savestate = grid.getSaveState();
	localStorage.setItem("savestate", JSON.stringify(savestate));
});
