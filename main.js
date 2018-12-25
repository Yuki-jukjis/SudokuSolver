function $(id) { return document.getElementById(id); }

function create() {
  var board = new Array(9);
  for(var i=0; i<9; i++) {
    board[i] = new Array(9);
    for(var j=0; j<9; j++)
      board[i][j] = { value:-1, possibility:new Array(9).fill(true) };
  }
  return board;
}

//複製
function clone(board) {
    return JSON.parse(JSON.stringify(board));
};

//文字列化
function show(board) {
    var buf = "";
    for(var x=0; x<9; x++) {
      for(var y=0; y<9; y++) {
        buf += board[x][y].value + 1;
        /*
        buf += "(" + (board[x][y].value + 1) + "|";
        for(var i=0; i<9; i++)
          if(board[x][y].possibility[i]) buf += (i + 1);
        buf += ")";
        */
      }
      buf += "<br>\n";
    }
    return buf;
  }

//値を埋める
function put(board, x, y, value) {
  if(board[x][y].value!=-1 || !board[x][y].possibility[value])
    throw "error";

  board[x][y].value = value;

  for(var xx=0; xx<9; xx++)
    board[xx][y].possibility[value] = false;
  for(var yy=0; yy<9; yy++)
    board[x][yy].possibility[value] = false;
  for(var xx=0; xx<3; xx++)
    for(var yy=0; yy<3; yy++)
      board[Math.floor(x/3)*3 + xx][Math.floor(y/3)*3 + yy].possibility[value] = false;

  board[x][y].possibility = new Array(9).fill(false);
  board[x][y].possibility[value] = true;

  return board;
}
//不確定のセルの中で、可能性が一番少ないセルを探す。
//すべて埋まっていたらminが10
//valuesは可能性が一番少ないセルに入りうる値の一覧
function searchMinimum(board) {
  var result = {x:0, y:0, min:10, only:-1};

  for(var x=0; x<9; x++) {
    for(var y=0; y<9; y++) {
      if(board[x][y].value != -1) continue;
      var count = 0;
      var values = [];
      for(var i=0; i<9; i++)
        if(board[x][y].possibility[i]) { count++; values.push(i); }
      if(count < result.min) result = {x, y, min:count, values};
    }
  }
  return result;
}

// 入力を解析
function parse() {
  var board = create();
  var lines = $('input').value
    .replace('\r\n', '\n')
    .replace('\r', '\n')
    .split('\n');

  for(var x=0; x<9; x++) {
    for(var y=0; y<9; y++) {
       if(x < lines.length &&
          y < lines[x].length &&
          /^[1-9]$/.test(lines[x][y]))
         put(board, x, y, parseInt(lines[x][y]) - 1);
    }
  }
  return board;
}

//打ち切り数
var num = 3;
//解く
function solve(board) {
  var answers = [];
  //打ち切り条件
  while(answers.length < num) {
    var result = searchMinimum(board);
    //すべて埋まっていたら、それを解答に追加して終了
    if(result.min == 10) {
      answers.push(board);
      break;
    }
    // 可能性が一つに絞られたセルがあれば、確定させて続行
    else if(result.min == 1) {
      put(board, result.x, result.y, result.values[0]);
      continue;
    }
    // 未確定のセルで、かつどの値も入れないセルがあった場合（＝矛盾した）
    else if(result.min == 0) {
      break;
    }
    //その他の場合は総当たり
    else {
      for(var i=0; i<result.values.length; i++) {
        //得た答えを配列に追加
        Array.prototype.push.apply(answers, solve(put(clone(board), result.x, result.y, result.values[i])));
        //打ち切り
        if(num <= answers.length) break;
      }
      break;
    }
  }
  return answers;
}

function main() {
  num = parseInt($('num').value);
  if(isNaN(num))num = 3;
  try {
    var board = parse();
    try {
      var ans = solve(board);
      var buf = "";
      for(var i=0; i<num; i++)
        buf += show(ans[i]) + "<br><br>";
      $('output').innerHTML = buf;
    } catch { }
  }
  catch { $('output').innerHTML = "incorrect input"; }

}
