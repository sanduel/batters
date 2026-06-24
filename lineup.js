// Pure logic for the softball lineup tool. No DOM access here so it can be
// unit-tested in isolation (see tests.html).
(function (root) {
  'use strict';

  var POSITIONS = ['P', 'C', 'SS', '1B', '2B', '3B', 'LF', 'LCF', 'RCF', 'RF'];
  var INNINGS = [1, 2, 3, 4, 5];

  function newState() {
    var grid = {};
    INNINGS.forEach(function (inn) {
      grid[inn] = {};
      POSITIONS.forEach(function (pos) { grid[inn][pos] = null; });
    });
    return { players: [], grid: grid, _nextId: 1 };
  }

  function makeId(state) {
    if (!state._nextId) state._nextId = 1;
    var id = 'p' + state._nextId;
    state._nextId += 1;
    return id;
  }

  function addPlayer(state, name) {
    var trimmed = (name == null ? '' : String(name)).trim();
    if (!trimmed) return null;
    var player = { id: makeId(state), name: trimmed };
    state.players.push(player);
    return player;
  }

  // How many distinct innings the player fields any position.
  function countInnings(state, playerId) {
    var count = 0;
    INNINGS.forEach(function (inn) {
      var found = POSITIONS.some(function (pos) {
        return state.grid[inn][pos] === playerId;
      });
      if (found) count += 1;
    });
    return count;
  }

  // Place playerId at (inning, position). A player holds at most one position
  // per inning, so dropping them into a new slot MOVES them out of any other
  // slot they occupied that inning (no double-booking). Also replaces whoever
  // was already in the target cell. Always succeeds.
  function assignToCell(state, inning, position, playerId) {
    POSITIONS.forEach(function (pos) {
      if (pos !== position && state.grid[inning][pos] === playerId) {
        state.grid[inning][pos] = null;
      }
    });
    state.grid[inning][position] = playerId;
    return true;
  }

  function clearCell(state, inning, position) {
    state.grid[inning][position] = null;
  }

  // Rename a player in place (keeps their id, color, and grid assignments).
  // Ignores empty/whitespace names. Returns true if the name changed.
  function renamePlayer(state, playerId, name) {
    var trimmed = (name == null ? '' : String(name)).trim();
    if (!trimmed) return false;
    var p = state.players.find(function (x) { return x.id === playerId; });
    if (!p) return false;
    p.name = trimmed;
    return true;
  }

  function removePlayer(state, playerId) {
    state.players = state.players.filter(function (p) { return p.id !== playerId; });
    INNINGS.forEach(function (inn) {
      POSITIONS.forEach(function (pos) {
        if (state.grid[inn][pos] === playerId) state.grid[inn][pos] = null;
      });
    });
  }

  function filledCount(state, inning) {
    return POSITIONS.reduce(function (n, pos) {
      return n + (state.grid[inning][pos] ? 1 : 0);
    }, 0);
  }

  function serialize(state) {
    return JSON.stringify({ players: state.players, grid: state.grid, _nextId: state._nextId });
  }

  // Always returns a valid state. Tolerates garbage and prunes grid references
  // to players that no longer exist.
  function deserialize(str) {
    var fresh = newState();
    var parsed;
    try { parsed = JSON.parse(str); } catch (e) { return fresh; }
    if (!parsed || typeof parsed !== 'object') return fresh;

    var players = Array.isArray(parsed.players) ? parsed.players.filter(function (p) {
      return p && typeof p.id === 'string' && typeof p.name === 'string';
    }) : [];
    var validIds = {};
    var maxId = 0;
    players.forEach(function (p) {
      validIds[p.id] = true;
      var n = parseInt(String(p.id).replace(/^p/, ''), 10);
      if (!isNaN(n) && n > maxId) maxId = n;
    });

    var state = newState();
    state.players = players;
    state._nextId = Math.max(maxId + 1, parsed._nextId || 1);

    var pg = parsed.grid || {};
    INNINGS.forEach(function (inn) {
      var src = pg[inn] || {};
      POSITIONS.forEach(function (pos) {
        var id = src[pos];
        state.grid[inn][pos] = validIds[id] ? id : null;
      });
    });
    return state;
  }

  // Unicode-safe base64 (handles accented names). Standard MDN approach.
  function b64encodeUtf8(s) {
    return btoa(encodeURIComponent(s).replace(/%([0-9A-F]{2})/g, function (_, h) {
      return String.fromCharCode(parseInt(h, 16));
    }));
  }
  function b64decodeUtf8(s) {
    return decodeURIComponent(Array.prototype.map.call(atob(s), function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  }

  // Compact, URL-shareable encoding of a whole game. encodeState -> string you
  // drop in a link; decodeState parses it back (tolerant: returns an empty,
  // valid state on any garbage).
  function encodeState(state) {
    return b64encodeUtf8(serialize(state));
  }
  function decodeState(str) {
    try { return deserialize(b64decodeUtf8(str)); }
    catch (e) { return newState(); }
  }

  var Lineup = {
    POSITIONS: POSITIONS,
    INNINGS: INNINGS,
    newState: newState,
    addPlayer: addPlayer,
    countInnings: countInnings,
    assignToCell: assignToCell,
    clearCell: clearCell,
    renamePlayer: renamePlayer,
    removePlayer: removePlayer,
    filledCount: filledCount,
    serialize: serialize,
    deserialize: deserialize,
    encodeState: encodeState,
    decodeState: decodeState
  };

  root.Lineup = Lineup;
  if (typeof module !== 'undefined' && module.exports) module.exports = Lineup;
})(typeof window !== 'undefined' ? window : this);
