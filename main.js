function $(id) { return document.getElementById(id); }

function Board() {
  //各セルの数字。未確定なら-1、確定したなら0～8
  this.cells = new Array(9);
  for(var i=0; i<9; i++)
    this.cells[i] = new Array(9).fill(-1);
  //各セルにあり得る値。n(1～9)があり得るなら、possibility[n]がtrue
  this.possibility = new Array(9);
  for(var i=0; i<9; i++) {
    this.possibility[i] = new Array(9);
    for(var j=0; j<9; j++)
      this.possibility[i][j] = new Array(9).fill(true);
  }
  //値を埋める
  this.put = function(x, y, value) {
    if(this.cells[x][y]!=-1 || !this.possibility[x][y][value])
      throw "error";

    this.cells[x][y] = value;

    for(var xx=0; xx<9; xx++)
      this.possibility[xx][y][value] = false;
    for(var yy=0; yy<9; yy++)
      this.possibility[x][yy][value] = false;
    for(var xx=0; xx<3; xx++)
      for(var yy=0; yy<3; yy++)
        this.possibility[Math.floor(x/3)*3 + xx][Math.floor(y/3)*3 + yy][value] = false;

    this.possibility[x][y] = new Array(9).fill(false);
    this.possibility[x][y][value] = true;
  }
  //不確定のセルの中で、可能性が一番少ないセルを探す。
  //すべて埋まっていたらminが10
  //valuesは可能性が一番少ないセルに入りうる値の一覧
  this.searchMinimum = function() {
    var result = {x:0, y:0, min:10, only:-1};

    for(var x=0; x<9; x++) {
      for(var y=0; y<9; y++) {
        if(this.cells[x][y] != -1) continue;
        var count = 0;
        var values = [];
        for(var i=0; i<9; i++)
          if(this.possibility[x][y][i]) { count++; values.push(i); }
        if(count < result.min) result = {x, y, min:count, values};
      }
    }
    return result;
  }

  //複製
  //this.clone = () => Object.assign({}, this);
  this.clone = function() {
    var a = new Board();
    var b = JSON.parse(JSON.stringify(this));
    a.cells = b.cells;
    a.possibility = b.possibility;
    return a;
  };

  //文字列化
  this.show = function(x, y, value) {
    var buf = "";
    for(var x=0; x<9; x++) {
      for(var y=0; y<9; y++) {
        buf += this.cells[x][y] + 1;
        /*
        buf += "(" + (this.cells[x][y] + 1) + "|";
        for(var i=0; i<9; i++)
          if(this.possibility[x][y][i]) buf += (i + 1);
        buf += ")";
        */
      }
      buf += "<br>\n";
    }
    return buf;
  }
}

// 入力を解析
function parse() {
  var board = new Board();
  var lines = $('input').value
    .replace('\r\n', '\n')
    .replace('\r', '\n')
    .split('\n');

  for(var x=0; x<9; x++) {
    for(var y=0; y<9; y++) {
       if(x < lines.length &&
          y < lines[x].length &&
          /^[1-9]$/.test(lines[x][y]))
         board.put(x, y, parseInt(lines[x][y]) - 1);
    }
  }
  return board;
}

//
function solve(board) {
  var answers = [];

  //打ち切り条件
  while(answers.length < 40) {
    var result = board.searchMinimum();
    //すべて埋まっていたら、それを解答に追加して終了
    if(result.min == 10) {
      answers.push(board);
      break;
    }
    // 可能性が一つに絞られたセルがあれば、確定させて続行
    else if(result.min == 1) {
      board.put(result.x, result.y, result.values[0]);
      continue;
    }
    // 未確定のセルで、かつどの値も入れないセルがあった場合（＝矛盾した）
    else if(result.min == 0) {
      break;
    }
    //その他の場合は総当たり
    else {
      for(var i=0; i<result.values.length; i++) {
        var board2 = board.clone();
        board2.put(result.x, result.y, result.values[i]);
        //得た答えを配列に追加
        Array.prototype.push.apply(answers, solve(board2));
      }
      break;
    }
  }
  return answers;
}

function main() {
  try {
    var board = parse();
    try {
      var ans = solve(board);
      var buf = "";
      for(var i=0; i<ans.length; i++)
        buf += ans[i].show() + "<br><br>";
      $('output').innerHTML = buf;
    } catch { }
  }
  catch { $('output').innerHTML = "incorrect input"; }

}
