

// Event Handlers

window.onload = restartGame;

function restartGame() {
    controller.restartGame();
}

function onchangeLengthCombobox() {
    view.updateMarksInRowNeededComboBox();
    controller.restartGame();
}

// Controller

var controller = {
    restartGame: function () {
        var boardLength = view.getBoardLengthInput();
        model.generateBoard(boardLength);
        model.nextPlayer = "O"
        model.isLocked = false;
        view.generateBoard();
    },
    placeMark : function (x, y) {
        if (!model.isFree(x, y) ||
            model.isLocked) {
            return;
        }

        model.placeMark(x, y, model.nextPlayer);
        var winningMarksArr = model.isWin(x, y, model.nextPlayer);
        if (winningMarksArr.length > 0) {
            view.highlightMarks(winningMarksArr);
            model.isLocked = true;
        }
        else if (model.isBoardFull()) {
            view.highlightMarks([]);
            model.isLocked = true;
        }
        else {
            model.nextPlayer = model.nextPlayer == "O" ? model.nextPlayer = "X" : model.nextPlayer = "O";
        }
    }
}

// View

var view = {
    getBoardLengthInput: function () {
        var lengthComboBox = document.getElementById("lengthComboBox");
        var length = lengthComboBox.options[lengthComboBox.selectedIndex].value;
        return parseInt(length);
    },
    getMarksInRowNeededInput: function () {
        var marksInRowNeededComboBox = document.getElementById("marksInRowNeededComboBox");
        var marksInRowNeeded = marksInRowNeededComboBox.options[marksInRowNeededComboBox.selectedIndex].value;
        return parseInt(marksInRowNeeded);
    },
    generateBoard: function () {
        var table = document.getElementById("boardTable");
        for (var i = table.rows.length - 1; i >= 0; i--) {
            table.deleteRow(i);
        }
        for (var y = 0; y < model.board.length; y++) {
            row = table.insertRow(y);      
            for (x = 0; x < model.board.length; x++) {
                var cell = row.insertCell(x);
                cell.id = x + ":" + y;
                cell.onclick = this.placeMark;
                cell.onmouseenter = this.displayMark;
                cell.onmouseleave = this.hideMark;
            }
        }
    },
    updateMarksInRowNeededComboBox: function () {
        var marksInRowNeededComboBox = document.getElementById("marksInRowNeededComboBox");
        for (var i = marksInRowNeededComboBox.length - 1; i >= 0; i--) {
            marksInRowNeededComboBox.remove(i);
        }
        for (var i = 3; i <= view.getBoardLengthInput(); i++) {
            var option = document.createElement("option");
            option.value = i;
            option.text = i;
            if (i == 3) {
                option.selected = "selected";
            }
            marksInRowNeededComboBox.add(option);
        }
    },
    highlightMarks: function (marks) {
        for (var y = 0; y < model.board.length; y++) {
            for (var x = 0; x < model.board.length; x++) {
                if (!marks.includes(x + ":" + y)) {
                    var cell = document.getElementById(x + ":" + y);
                    cell.style.opacity = "0.25";
                }
            }
        }
    },
    placeMark: function (e) {
        var coords = e.target.id.split(":");
        var x = parseInt(coords[0]);
        var y = parseInt(coords[1]);
        controller.placeMark(x, y);
    },
    displayMark: function (e) {
        var coords = e.target.id.split(":");
        var x = parseInt(coords[0]);
        var y = parseInt(coords[1]);
        if (model.isFree(x, y) && !model.isLocked) {
            var cell = document.getElementById(x + ":" + y);
            if (model.nextPlayer == "X") {
                cell.setAttribute("class", "markX");
            }
            else {
                cell.setAttribute("class", "markO");
            }
        }
    },
    hideMark: function (e) {
        var coords = e.target.id.split(":");
        var x = parseInt(coords[0]);
        var y = parseInt(coords[1]);
        if (model.isFree(x, y)) {
            var cell = document.getElementById(x + ":" + y);
            cell.removeAttribute("class");
        }
    }
}

// Model

var model = {
    board: new Array(),
    nextPlayer: "O",
    isLocked: false,
    isFree: function (x, y) {
        var mark = this.board[x][y];
        return mark == undefined;
    },
    placeMark: function (x, y, mark) {
        this.board[x][y] = mark;
    },
    isWin: function (x, y, mark) {
        if (this.board[x][y] != mark) {
            return [];
        }

        var marksInRowNeeded = view.getMarksInRowNeededInput();   
        var winningMarksArr = [];

        for (var i = 0; i < this.board.length; i++) {
            if (this.board[i][y] == mark) {
                winningMarksArr.push(i + ":" + y);
            }
            else {
                winningMarksArr = [];
            }
            if (winningMarksArr.length == marksInRowNeeded) {
                return winningMarksArr;
            }
        }
        winningMarksArr = [];
        for (var i = 0; i < this.board.length; i++) {
            if (this.board[x][i] == mark) {
                winningMarksArr.push(x + ":" + i);
            }
            else {
                winningMarksArr = [];
            }
            if (winningMarksArr.length == marksInRowNeeded) {
                return winningMarksArr;
            }
        }
        winningMarksArr = [];
        var minX = x - Math.min(x, y);
        var minY = y - Math.min(x, y);
        var maxX = x + this.board.length - Math.max(x, y) - 1;
        for (var i = 0; i <= maxX - minX; i++) {
            if (this.board[minX + i][minY + i] == mark) {
                winningMarksArr.push((minX + i) + ":" + (minY + i));
            }
            else {
                winningMarksArr = [];
            }
            if (winningMarksArr.length == marksInRowNeeded) {
                return winningMarksArr;
            }
        }
        winningMarksArr = [];
        minX = x - Math.min(x, this.board.length - y - 1); 
        minY = y - Math.min(y, this.board.length - x - 1);
        maxX = x + Math.min(y, this.board.length - x - 1);
        maxY = y + Math.min(x, this.board.length - y - 1);
        for (var i = 0; i <= maxX - minX; i++) {
            if (this.board[maxX - i][minY + i] == mark) {
                winningMarksArr.push((maxX - i) + ":" + (minY + i));
            }
            else {
                winningMarksArr = [];
            }
            if (winningMarksArr.length == marksInRowNeeded) {
                return winningMarksArr;
            }
        }
        return [];
    },
    isBoardFull: function () {
        for (var i = 0; i < this.board.length; i++) {
            for (var j = 0; j < this.board.length; j++) {
                if (this.board[i][j] == undefined) {
                    return false;
                }
            }
        }
        return true;
    },
    generateBoard: function(length) {
        var arr = new Array(length);
        for (var i = 0; i < length; i++) {
            arr[i] = new Array(length);
            for (var j = 0; j < length; j++) {
                arr[i][j] = undefined;
            }
        }
        this.board = arr;
    }
};
