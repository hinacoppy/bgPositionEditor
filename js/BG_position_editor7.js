// BG_position_editor 用 JavaScript
// (C)hinacoppy 2018 -- 2021

//広域変数
var rotation = 'cw';
var durty_analysis = true;
var durty_drawboard = true;

//入力のXGIDを解析し、結果をボードエディタ、シチュエーションエディタに反映
function gamen_ni_hanei(xgid) {
  const xgidstr = (xgid) ? xgid : "XGID=--------------------------:0:0:1:00:0:0:0:0:10";
  const regexp = /XGID=(.+?):(.+?):(.+?):(.+?):(.+?):(.+?):(.+?):(.+?):(.+?):(.+?)$/;
  const z = xgidstr.match(regexp);
  const pos=z[1], cubeval=z[2], cubeowner=z[3], turn=z[4], dice=z[5],
        sc1=z[6], sc2=z[7], jacoby=crawford=z[8], matchlen=z[9], maxcube=z[10];
  let gamemode;

  $('#xgid').val(xgidstr);
  $('#matchlength').val(matchlen);
  $('#score1').val(sc1);
  $('#score2').val(sc2);
  $('#position').val(pos);
  $('#dice1, #dice2, #dice3, #dice4').val(dice);
  $('#maxcube').val(maxcube);
  $('#position').val(pos);
  $('#maxcubeval').text('('+get_cubevaltext(maxcube)+')');
  if (matchlen != 0) {
    $('[name=gamemode]').eq(0).prop('checked', true);
    gamemode=$('[name=gamemode]').eq(0).val(); //matchgame
  } else {
    $('[name=gamemode]').eq(1).prop('checked', true);
    gamemode=$('[name=gamemode]').eq(1).val(); //moneygame
  }
  if (gamemode == 'matchgame' && crawford != 0) {
    $('[name=crawford]').eq(1).prop('checked', true);
  } else {
    $('[name=crawford]').eq(0).prop('checked', true);
  }
  switch(cubeowner) {
    case '0':
      $('[name=cubeowner]').eq(0).prop('checked', true);
      break;
    case '1':
      $('[name=cubeowner]').eq(1).prop('checked', true);
      break;
    case '-1':
      $('[name=cubeowner]').eq(2).prop('checked', true);
      break;
  }
  switch(turn) {
    case '1':
      $('[name=turn]').eq(0).prop('checked', true);
      break;
    case '-1':
      $('[name=turn]').eq(1).prop('checked', true);
      break;
  }
  $('[name=jacoby]').eq(jacoby).prop('checked', true);
  $('[name=cubevalue]').val(cubeval);
  position_ni_hanei(pos);
  calc_boff(pos);
  gamemode_css(gamemode);
  turn_ni_hanei(turn);
  cube_wo_hyoji(cubeowner, cubeval, gamemode, crawford);
  show_pip();
}

//turnによって表示を変更
function turn_ni_hanei(turn) {
  switch(turn) {
    case '1':
      $('.turn0').show(); $('.turn1').hide();
      break;
    case '-1':
      $('.turn1').show(); $('.turn0').hide();
      break;
  }
}

//キューブを表示
function cube_wo_hyoji(cubeown, cubeval, gamemode, crawford) {
  let align, cubestr;

  if (gamemode == 'matchgame' && crawford != 0) {
    cubestr = "Cr";
    align = "middle";
  } else {
    cubestr = get_cubevaltext(cubeval);
    switch(cubeown) {
    case "0":
      align = "middle"; break;
    case "1":
      align = "bottom"; break;
    case "-1":
      align = "top"; break;
    }
  }
  $('#cubef, #cuber').text('['+ cubestr +']');
  $('#cubef, #cuber').attr("valign", align);
}

//ポジションの情報をボードエディタに反映
function position_ni_hanei(position) {
  const poslist = position.split('');
  for (let p=0; p<poslist.length; p++) {
    const ch = poslist[p];
    draw_checker(p, ch);
  }
}

//ジャコビーフラグ(クロフォードフラグ)を設定
function check_jb_cf() {
  const gm = $('[name=gamemode]:checked').val();
  const jb = $('[name=jacoby]:checked').val();
  const cf = $('[name=crawford]:checked').val();
  const rr = (gm == 'moneygame') ? jb : 0;
  const rs = (gm == 'matchgame' && cf == 1) ? 1 : rr;
  return rs;
}

//maxcubeのキューブバリューを計算する
function get_cubevaltext(cube) {
  return Math.pow(2, cube);
}

//Pipを計算し、表示する
function show_pip() {
  const xgstr = $('#xgid').val();
  const xgid = new Xgid(xgstr);
  const pipinfo = "Pips ★= " + xgid.get_pip(1) + " ▲= " + xgid.get_pip(-1);
  $("#pipinfo").text(pipinfo);
}

//ベアオフの数を計算・表示する。負数の場合は警告(赤文字)
function calc_boff(position) {
  let boffw = boffb = 15;
  let n;
  const poslist = position.split('');
  for (let i=0; i<poslist.length; i++) {
    const c = poslist[i];
    if ( c.match(/[A-Z]/) ) {
      n = c.charCodeAt(0) - "A".charCodeAt(0) + 1;
      boffb -= n;
    }
    if ( c.match(/[a-z]/) ) {
      n = c.charCodeAt(0) - "a".charCodeAt(0) + 1;
      boffw -= n;
    }
  }

  $('#boff-bf, #boff-br').text(boffb);
  $('#boff-wf, #boff-wr').text(boffw);
  if (boffb < 0) {
    $('#boff-bf, #boff-br').css("color","red").css("font-weight","bold");
  } else {
    $('#boff-bf, #boff-br').css("color","initial").css("font-weight","initial");
  }
  if (boffw < 0) {
    $('#boff-wf, #boff-wr').css("color","red").css("font-weight","bold");
  } else {
    $('#boff-wf, #boff-wr').css("color","initial").css("font-weight","initial");
  }
}

//クリックされたポイントと左右どちらのクリックかを元にポジションを編集
function edit_position2(pt, delta) {
  const position = $('#position').val();
  const poslist = position.split('');
  const ch = poslist[pt];
  const num = char2num(ch);

  if (pt ==  0 && num == 0 && delta ==  1) { return; } //バーのコマは増やせる方向が一方だけ
  if (pt == 25 && num == 0 && delta == -1) { return; }

  const chnew = num2char(num + delta);

  poslist[pt] = chnew;
  const nextpos = poslist.join('');

  $('#position').val(nextpos).change(); //XGIDを編集するためにchangeイベントを発火

  draw_checker(pt, chnew);
  calc_boff(nextpos); //ベアオフを数える
  show_pip();
}

//ポイントに駒を表示
function draw_checker(pt, ch) {
  const str = make_pt_str(pt, ch);
  const col = select_col(ch);
  const pts = ("00"+pt).substr(-2);
  $('#p'+pts+"f").html(str).css("color", col);
  $('#p'+pts+"r").html(str).css("color", col);
}

//ポイントに表示する駒
function make_pt_str(pt, ch) {
  let ptstr;
  const nm = char2num(ch);
  const checker = nm > 0 ? "★" : "▲";
  const absnm = Math.abs(nm);
  checker5 = (absnm >= 6) ? absnm : checker;

  if (absnm == 0) { return ""; }
  if ((pt >= 13 && pt <= 24) || pt == 0) { //ボードの上半分
    if (absnm >= 1) { ptstr = checker; }
    if (absnm >= 2) { ptstr = ptstr + "<br>" + checker; }
    if (absnm >= 3) { ptstr = ptstr + "<br>" + checker; }
    if (absnm >= 4) { ptstr = ptstr + "<br>" + checker; }
    if (absnm >= 5) { ptstr = ptstr + "<br>" + checker5;}
  } else { //ボードの下半分
    if (absnm >= 1) { ptstr = checker; }
    if (absnm >= 2) { ptstr = checker + "<br>" + ptstr; }
    if (absnm >= 3) { ptstr = checker + "<br>" + ptstr; }
    if (absnm >= 4) { ptstr = checker + "<br>" + ptstr; }
    if (absnm >= 5) { ptstr = checker5+ "<br>" + ptstr; }
  }
  return ptstr;
}

//駒に色を付ける
function select_col(c) {
  let col;
  if ( c.match(/[A-Z]/) ) {
    col="blue";
  } else if ( c.match(/[a-z]/) ) {
    col="red";
  } else {
    col="initial";
  }
  return col;
}

//ポジション文字(A-Za-z)を数字に変換
function char2num(c) {
  let n;
  if ( c.match(/[A-Z]/) ) {
    n = c.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
  } else if ( c.match(/[a-z]/) ) {
    n = -1 * (c.charCodeAt(0) - 'a'.charCodeAt(0) + 1);
  } else { // c == '-'
    n = 0;
  }
  return n;
}

//数字をポジション文字(A-Za-z)に変換
function num2char(n) {
  let c;
  if (n > 0) {
    c = String.fromCharCode("A".charCodeAt(0) + Math.abs(n) - 1);
  } else if (n < 0) {
    c = String.fromCharCode("a".charCodeAt(0) + Math.abs(n) - 1);
  } else { // n == 0
    c = '-';
  }
  return c;
}

//画面のデータを元にXGIDを組み立て
function xgidout_wo_kumitate() {
  const gamemode = $('[name=gamemode]:checked').val();
  const cubeval  = $('[name=cubevalue]').val();
  const cubeown  = $('[name=cubeowner]:checked').val();
  const turn     = $('[name=turn]:checked').val();
  const dice     = $('#dice1').val();
  let   sc1      = $('#score1').val();
  let   sc2      = $('#score2').val();
  const jbcf     = check_jb_cf();
  let   matchlen = $('#matchlength').val();
  const maxcube  = $('#maxcube').val();
  const pos      = $('#position').val();
  if (gamemode == "moneygame") {
    sc1 = sc2 = matchlen = 0;
  }
  const xgidout = 'XGID='+pos+':'+cubeval+':'+cubeown+':'+turn+':'+dice+':'+sc1+':'+sc2+':'+jbcf+':'+matchlen+':'+maxcube;
  return xgidout;
}

//htmlボードを生成(GnuBG, Itikawa)
function make_htmlboard(xgid, boardtype, rotation) {
  const html = new HtmlBoard(xgid);
  html.boardtype = boardtype;
  html.rotation = rotation;
  html.imgpath  = get_imgpath(boardtype);;
  const bgboard = html.get_board_html();
//  const pipinfo = html.get_pipinfo();
  const bdwidth = html.get_bdwidth();
  $('#bgboard').show().html(bgboard).css("width", bdwidth);
//  $('#pipinfo').text(pipinfo);
  setTimeout(function(){ draw_canvas(); }, 500); //show().html()が終わるのをしばらく待つ
  setTimeout(function(){ $('#bgboard').hide(); }, 2000); //draw_canvas()が終わったころに非表示にする
  durty_drawboard = false;
}

//xgfontボードを生成
function make_xgfontboard(xgid, rotation) {
  const xgboard = new XgFontBoard(xgid, rotation);
  const board = xgboard.get_xgfontboard();
  $('#xgfontboard').text(board);
}

//Textボードを生成
function make_txtboard(xgid, rotation) {
  const txtboard = new TextBoard(xgid, rotation);
  const board = txtboard.get_txtboard();
  $('#txtboard').text(board);
}

//html2canvasコマンドでHTML画像を一つのpng画像にまとめる
function draw_canvas() {
  html2canvas($("#bgboard")[0], {scale:1.0}).then(function(canvas) {
    //imgタグのsrcの中に、html2canvasがレンダリングした画像を登録する。
    const imgData = canvas.toDataURL();
    $("#boardone")[0].src = imgData;
    $("#downloadimg")[0].href = imgData; //ダウンロードリンクも画像にしておく
  });
}

function gamemode_css(gamemode) {
  if (gamemode == "moneygame") { $('.money_mode').show(); $('.match_mode').hide(); }
  if (gamemode == "matchgame") { $('.money_mode').hide(); $('.match_mode').show(); }
}

//AJAXエラー時のメッセージ
function disp_error() {
  $("#result").text("Error: AJAX connection failed");
}

//結果を<pre>で表示
function disp_result_pre(d) {
  $("#result").text(d);
}

//AJAX通信により、gnubgによる解析結果を取得する
function get_gnuanalysis_ajax(xgid, depth, num) {
  $("#result").html("<img src='img/loading.gif'>");
  $.ajax({
    url: 'gnubg_ajax.php?g='+xgid+'&d='+depth+'&n='+num, //local PHP script
//    url: 'http://local.example.com:1234/gnubg_ajax.js?g='+xgid, //Node.js
//    url: 'http://ldap.example.com/cgi-bin/gnubg_ajax.cgi?g='+xgid+'&n='+num,
//    url: '/cgi-bin/gnubg_ajax.cgi?g='+xgid+'&d='+depth+'&n='+num, //kagoya local
//    url: 'https://v153-127-246-44.vir.kagoya.net:17500/gnubg_ajax.js?g='+xgid+'&d='+depth+'&n='+num, //Node.js
    method: 'GET',
    dataType: "text",
  }).done(function(d) {
    disp_result_pre(d);
    durty_analysis = false;
  }).fail(function() {
    disp_error();
  });
}

function get_boardtype() {
  const boardtype = $("input[name='boardtype']:checked").val();
  return boardtype;
}

function get_imgpath(boardtype) {
  const imgpath = {bw: 'img/bw/', iti: 'img/iti/', gnu: 'img/gnu/'};
  return imgpath[boardtype];
}

function isGithub() {
  const hostname = $(location).attr('host');
  return (hostname.indexOf("hinacoppy.github.io") >= 0);
}

function reverse_xgid(xgid) {
  const flipTurn = tn => (parseInt(tn) * -1).toString();  //関数変数を定義

  const xg = xgid.split("=");
  const s = xg[1].split(":");
  const revpos = reverse_pos(s[0]);
  const cubeown = flipTurn(s[2]); //cube owner
  const turn = flipTurn(s[3]); //turn
  const xgidout = 'XGID='+revpos+':'+s[1]+':'+cubeown+':'+turn+':'+s[4]+':'+s[6]+':'+s[5]+':'+s[7]+':'+s[8]+':'+s[9];
  return xgidout;
}

function reverse_pos(pos) {
  //関数変数を定義
  const isLowerCase = str => str === str.toLowerCase();
  const isUpperCase = str => str === str.toUpperCase();

  let posrevout = '';
  for(const c of pos.split('').reverse()) {
    let d = c;
    if (isLowerCase(c)) { d = c.toUpperCase(); }
    if (isUpperCase(c)) { d = c.toLowerCase(); }
    posrevout += d;
  }
  return posrevout;
}

//外部スクリプト(PHP)にPOSTするデータを組み立てる
function makeFormData(categoryid, probnum, xgid) {
    const postData = new FormData();
    postData.append('categoryid', categoryid);
    postData.append('probnum', probnum);
    postData.append('xgid', xgid);
    return postData;
}

//AJAX通信により、問題データを取得する
function ajax_select(categoryid, probnum) {
    $.ajax({
        url: 'misc/problemid2xgid_json.php',
        method: 'POST',
        dataType: "json",
        contentType: false,
        processData: false,
        data: makeFormData(categoryid, probnum, "")
    }).done(function(d) {
        $('#xgid').val(d.xgid);
        $('#apply').trigger('click');
    }).fail(function() {
        alert('データ取得に失敗しました');
    });
}

//AJAX通信により、問題データをUpdateする
function ajax_update(categoryid, probnum, xgid) {
    $.ajax({
        url: 'misc/updatedb_json.php',
        method: 'POST',
        dataType: "json",
        contentType: false,
        processData: false,
        data: makeFormData(categoryid, probnum, xgid)
    }).done(function(d) {
        $('#updateresult').text(d.message);
    }).fail(function() {
        alert('DB Updateに失敗しました');
    });
}

//イベントハンドラの定義
$(function() {
  //ゲームシチュエーションが変更されたときはxgidを編集
  $('#BgEditor').on('change', function(e) {
    if (e.target.id != "xgid") {
      const xgid = xgidout_wo_kumitate();
      $('#xgid').val(xgid);
      durty_analysis = durty_drawboard = true;
    }
  });

  //ボードエディタ上では右クリックを無効にする
  $('.boardeditor').on('contextmenu', function (e) {
    return false;
  });

  //[.area]がクリックされたとき
  $('.area').on('click contextmenu', function (e) {
    const id = $(this).attr("id");
    if (id === undefined) { return; }
    if (e.which !== 1 && e.which !== 3) { return; }

    const pt = Number(id.substr(1,2));
    const delta = 2 - e.which; // 1(left click) ==> 1, 3(right click) ==> -1)
    edit_position2(pt, delta);
  });

  //Diceが変更されたとき、別画面のダイスを更新
  $('#dice1, #dice2, #dice3, #dice4').on('change', function(e) {
    const changeddice = $(this).val();
    $('#dice1, #dice2, #dice3, #dice4').val(changeddice);
  });

  //キューブ状態が変更されたときはキューブを表示
  $('[name=cubeowner], [name=cubevalue]').on('change', function(e) {
    const cubeval  = $('[name=cubevalue]').val();
    const cubeown  = $('[name=cubeowner]:checked').val();
    const gamemode = $('[name=gamemode]:checked').val();
    const crawford = $('[name=crawford]:checked').val();
    cube_wo_hyoji(cubeown, cubeval, gamemode, crawford);
  });

  //gamemodeが変更されたときは設定不可な項目を非表示に
  $('[name=gamemode]').on('change', function(e) {
    const gamemode = $('[name=gamemode]:checked').val();
    gamemode_css(gamemode);
  });

  //turnが変更されたとき
  $('[name=turn]').on('change', function(e) {
    const turn = $('[name=turn]:checked').val();
    turn_ni_hanei(turn);
  });

  //bearoff toが変更されたとき
  $('[name=rotation]').on('change', function(e) {
    rotation = $('[name=rotation]:checked').val(); //広域変数を編集
    if (rotation == 'ccw') {
      $('.rotation_rev').show(); $('.rotation_fwd').hide();
    } else {
      $('.rotation_fwd').show(); $('.rotation_rev').hide();
    }
    durty_drawboard = true;
  });

  //max cubeが変更されたときは倍率(キューブバリュー)を変更
  $('#maxcube').on('change', function(e) {
    const maxcube  = $('#maxcube').val();
    $('#maxcubeval').text('('+get_cubevaltext(maxcube)+')');
  });

  //[Erase] ボタンがクリックされたとき
  $('#erase').on('click', function(e) {
    $('#xgid').val('').focus();
  });

  //[Apply to Editor] ボタンがクリックされたとき
  $('#apply').on('click', function(e) {
    const xgid = $('#xgid').val();
    gamen_ni_hanei(xgid);
    durty_analysis = durty_drawboard = true;
  });

  //[XGID to Clipboard] ボタンがクリックされたとき
  const clipboard = new ClipboardJS('#xgid2clip');
  clipboard.on('success', function(e) {
    e.clearSelection();
  });

//  $('#xgid2clip').on('click', function(e) {
//    $('#xgid').select();
//    document.execCommand("Copy"); //クリップボードにコピー
//    window.getSelection().removeAllRanges(); //選択状態を解除
//  });

  //[Clear Board] ボタンがクリックされたとき
  $('#clearboard').on('click', function(e) {
    gamen_ni_hanei(false);
    durty_analysis = durty_drawboard = true;
  });

  //[Opening Position] ボタンがクリックされたとき
  $('#openingposition').on('click', function(e) {
    gamen_ni_hanei("XGID=-b----E-C---eE---c-e----B-:0:0:1:00:0:0:0:0:10");
    durty_analysis = durty_drawboard = true;
  });

  //[Reverse Turn] ボタンがクリックされたとき
  $('#reverseturn').on('click', function(e) {
    revxgid = reverse_xgid($('#xgid').val());
    gamen_ni_hanei(revxgid);
    durty_analysis = durty_drawboard = true;
  });

  //[Draw the Board] ボタンがクリックされたとき
  $('#drawboard').on('click', function(e) {
    const boardtype = get_boardtype();
    if (isGithub() && boardtype == 'xg') {
      alert('Sorry, this feature is inactive.'); //githubで稼働しているときはXGfontでの表示は営業停止
      return;
    }
    if (durty_drawboard) {
      const xgid = $('#xgid').val();
      const xg = new Xgid(xgid);
      if (!xg.isValid()) {
        if (!confirm("\nNot a valid XGID '" + xgid + "'\nDo you force execution?")) {
          return;
        }
      }
      switch(boardtype) {
      case 'xg':
        make_xgfontboard(xgid, rotation);
        break;
      case 'txt':
        make_txtboard(xgid, rotation);
        break;
      case 'gnu':
      case 'bw':
      case 'iti':
      default:
        $(window).scrollTop(0); //html2canvas()で謎の空白が生じるのを防ぐため
        make_htmlboard(xgid, boardtype, rotation); //rotationは広域変数から取得
        break;
      }
    }
    if (boardtype == 'xg') {
      $('#showimg').hide(); $('#showxgfont').show(); $('#showtxtboard').hide();
    } else if (boardtype == 'txt') {
      $('#showimg').hide(); $('#showxgfont').hide(); $('#showtxtboard').show();
    } else {
      $('#showimg').show(); $('#showxgfont').hide(); $('#showtxtboard').hide();
    }
  });

  //[Draw the Board]で開くモーダルウィンドウを準備(ボタンクリックで表示)
  $('#drawboard').funcHoverDiv({
    hoverid:  '#boardImg',       //擬似ウィンドウのID
    headid:   '#boardImgHeader', //ドラッグ移動可能な要素のID
    bodyid:   '#boardImgBody',   //最小化(非表示)される部分
    maxbtn:   '#maxBtn',         //擬似ウィンドウ最大化(再表示)
    minbtn:   '#minBtn',         //擬似ウィンドウ最小化
    closebtn: '#closeBtn',       //擬似ウィンドウを閉じる要素のID
    width:    '472px',           //擬似ウィンドウのwidth
    height:   '480px'            //擬似ウィンドウのheight
  });

  //[Copy XgFont Board] ボタンがクリックされたとき
  const xgfontboard = new ClipboardJS('#copy-xgfontboard');
  xgfontboard.on('success', function(e) {
    e.clearSelection();
  });

  //[Copy Text Board] ボタンがクリックされたとき
  const txtboard = new ClipboardJS('#copy-txtboard');
  txtboard.on('success', function(e) {
    e.clearSelection();
  });

  //[Analyse] ボタンがクリックされたとき
  $('#analyse').on('click', function(e) {
    if (isGithub()) {
      alert('Sorry, this feature is inactive.'); //githubで稼働しているときはgnubgの解析機能は営業停止
      return;
    }
    if (durty_analysis) {
      const xgid = $("#xgid").val();
      const depth = $("[name=depth]").val();
      const num = $("#numofresults").val();
      get_gnuanalysis_ajax(xgid, depth, num);
    }
  });

  //[Analyse]で開くモーダルウィンドウを準備(ボタンクリックで表示)
  $('#analyse').funcHoverDiv({ //ボタンクリックでモーダルウィンドウを表示
    hoverid:  '#analysisResult',
    headid:   '#analysisResultHeader',
    bodyid:   '#analysisResultBody',
    maxbtn:   '#maxBtnAnl',
    minbtn:   '#minBtnAnl',
    closebtn: '#closeBtnAnl',
    width:    '40%',
    height:   '300px'
  });

  //[Select DB] ボタンがクリックされたとき
  $('#selectdb').on('click', function(e) {
    categoryid = $("#categoryid").val();
    probnum    = $("#probnum").val();
    ajax_select(categoryid, probnum);
  });

  //[Update DB] ボタンがクリックされたとき
  $('#updatedb').on('click', function(e) {
    categoryid = $("#categoryid").val();
    probnum    = $("#probnum").val();
    xgid       = $('#xgid').val();
    ajax_update(categoryid, probnum, xgid);
  });

  //GitHubで使わない機能は非表示
  if (isGithub()) {
    $('.hidewhengithub').hide();
  }

}); //close to $(function() {
