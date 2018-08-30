// bg_class.js
//

class Xgid {
  constructor(xgid) {
    if (xgid === "") {
      xgid = "XGID=--------------------------:0:0:0:00:0:0:0:0:0";
    }
    this._xgid = xgid;
    this._position = "--------------------------";
    this._cube = 0;
    this._cubepos = 0;
    this._turn = 0;
    this._dice = "00";
    this._dice_odr = "00";
    this._sc_me = 0;
    this._sc_yu = 0;
    this._jb = 0;
    this._matchsc = 0;
    this._maxcube = 0;
    this._crawford = 0;
    this._ptno = new Array(26);
    this._ptcol = new Array(26);
    this._pip = [0, 0];
    this._boff = [0, 0];

    this._parse_xgid(xgid);
  }

  // XGIDをパースし状態をローカル変数に格納
  _parse_xgid(xgidstr) {
    const xgidstr2 = xgidstr.substr("XGID=".length);
    const s = xgidstr2.split(":");

    if (s[4] == "D") { s[4] = "00"; }

    this._position= s[0];
    this._cube    = Number(s[1]);
    this._cubepos = Number(s[2]);
    this._turn    = Number(s[3]);
    this._dice    = s[4];
    this._dice_odr= s[4];  // 初期値を設定
    this._sc_me   = Number(s[5]);
    this._sc_yu   = Number(s[6]);
    this._jb      = Number(s[7]);
    this._matchsc = Number(s[8]);
    this._maxcube = Number(s[9]);

    // dice_odrはダイスを昇順にして保持する
    const dice1 = s[4].substr(0,1);
    const dice2 = s[4].substr(1,1);
    if (dice1 > dice2) { this._dice_odr = dice2 + dice1; }

    // クロフォード状態を確認
    this._crawford = (this._matchsc > 0 && this._jb != 0) ? 1 : 0 ;

    // ボード状態を解析
    this._parse_position(this._position);
  }

  //ポジション情報をパースし状態をローカル変数に格納
  //ついでに、ピップ数とベアオフチェッカーを数えておく
  _parse_position(pt) {
    this._pip[0]  = this._pip[1]  = 0;
    this._boff[0] = this._boff[1] = 15;

    const posary = pt.split("");  // 一文字ずつに分解
    for (let i=0; i<=25; i++) {
      const asc = posary[i].charCodeAt(0);
      if (asc == "-".charCodeAt(0)) {
        this._ptno[i] = 0; this._ptcol[i] = 0;
      } else if (asc >= "a".charCodeAt(0) && asc <= "z".charCodeAt(0)) {
        this._ptno[i] = asc - "a".charCodeAt(0) + 1;
        this._ptcol[i] = -1;
        this._boff[1] -= this._ptno[i];
        this._pip[1] += this._ptno[i] * (25 - i); // ピップ数を計算
      } else if (asc >= "A".charCodeAt(0) && asc <= "Z".charCodeAt(0)) {
        this._ptno[i] = asc - "A".charCodeAt(0) + 1;
        this._ptcol[i] = 1;
        this._boff[0] -= this._ptno[i];
        this._pip[0] += this._ptno[i] * (i - 0); // ピップ数を計算
      }
    } // for
  }

  // getter functions
  get_xgidstr()  { return this._xgid; }
  get_position() { return this._position; }
  get_cube()     { return this._cube; }
  get_cubepos()  { return this._cubepos; }
  get_turn()     { return this._turn; }
  get_dice()     { return this._dice; }
  get_dice_odr() { return this._dice_odr; }
  get_sc_me()    { return this._sc_me; }
  get_sc_yu()    { return this._sc_yu; }
  get_jb()       { return this._jb; }
  get_matchsc()  { return this._matchsc; }
  get_maxcube()  { return this._maxcube; }
  get_crawford() { return this._crawford; }
  get_ptno(p)    { return this._ptno[p]; }
  get_ptcol(p)   { return this._ptcol[p]; }
  get_pip(t)     { return this._pip[t]; }
  get_boff(t)    { return this._boff[t]; }
} //class Xgid

class HtmlBoard {
  constructor(xgidstr) {
    this._checker_me = "";
    this._checker_yu = "";
    this._imgpath = "";
    this._boardtype = "";
    this._xgid = new Xgid(xgidstr);
  }
  // 画像ファイルへのパスを設定するsetter関数
  set imgpath(path) {
    this._imgpath = path;
  }
  // ボードタイプを設定するsetter関数
  set boardtype(type) {
    this._boardtype = type;
  }
  //HTML形式のボードデータを返す関数
  get_board_html() {
    switch(this._boardtype) {
    case "gnu-ccw":
      return this._get_html_gnu_ccw();
      break;
    case "gnu-cw":
      return this._get_html_gnu_cw();
      break;
    default:
      return "BOARD TYPE ERROR (only gnu-ccw, gnu-cw)";
      break;
    }
  }
  //ピップ情報を返す関数
  get_pipinfo() {
    const pip_me = this._xgid.get_pip(0);
    const pip_yu = this._xgid.get_pip(1);
    return "pips me="+pip_me+" yu="+pip_yu;
  }
  //HTML画像の横方向のサイズを返す関数
  get_bdwidth() {
    return "432px"; //fix value
  }

  // ポイントにあるチェッカーの色と数を組み合わせて画像ファイル名を出力する補助関数
  _parts(pt, boardtype) {
    let no, co;
    no = this._no(pt);
    no = (no == 0) ? "" : no;
    co = this._col(pt);
    return co.toString() + no.toString();
  }
  // ポイントにあるチェッカーの色を出力する補助関数
  _col(pt) {
    switch (this._xgid.get_ptcol(pt)) {
      case 1:
        return this._checker_me;
        break;
      case -1:
        return this._checker_yu;
        break;
      default:
        return "";
    }
  }
  // ポイントにあるチェッカーの数を出力する補助関数
  _no(pt) {
    return this._xgid.get_ptno(pt);
  }
  // ボードの上辺、下辺の画像ファイル名を作成
  _frametop(t, r) { //turn, rotation
    return "b-"+ (t==1 ? "hi":"lo") +"top"+ (r=="cw" ? "":"r") +".png";
  }
  _frametbtm(t, r) {
    return "b-"+ (t==1 ? "lo":"hi") +"bot"+ (r=="cw" ? "":"r") +".png";
  }
  // ボード左右のダイス画像ファイル名を作成
  _dice_r(t, d) { //turn, dice_odr
    return "b-midr" + ((d == "00" || t == -1) ? "" : "-o"+d) + ".png";
  }
  _dice_l(t, d) {
    return "b-midl" + ((d == "00" || t ==  1) ? "" : "-x"+d) + ".png";
  }

  // GnuBGの部品画像ファイルでのHTML出力(反時計回り)
  _get_html_gnu_ccw() {
    this._checker_me = "-o";
    this._checker_yu = "-x";
    const rotation = "ccw";
    const xgid = this._xgid;
    const imgpath = this._imgpath;
    const brd = this._boardtype;
    const cube_up = (xgid.get_cubepos() == -1 ? "-"+Math.pow(2, xgid.get_cube()).toString() : "" );
    const cube_dn = (xgid.get_cubepos() == 1  ? "-"+Math.pow(2, xgid.get_cube()).toString() : "" );
    const cube_cn = ((xgid.get_cubepos() == 0 && xgid.get_crawford() == 0) ? "-"+Math.pow(2, xgid.get_cube()).toString() : "" );
    const turn    = xgid.get_turn();
    const dice_r = this._dice_r(turn, xgid.get_dice_odr());
    const dice_l = this._dice_l(turn, xgid.get_dice_odr());

    let html = "";
    html += "<table cellpadding='0' border='0' cellspacing='0' style='margin: 0; padding: 0; border: 0'>";
    html += "\n";
    html += "<tr><td colspan='15'><img src='"+imgpath+this._frametop(turn, rotation)+"'></td></tr>";
    html += "\n";
    html += "<tr>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-roff-x0.png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-gd"+this._parts(13,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-rd"+this._parts(14,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-gd"+this._parts(15,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-rd"+this._parts(16,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-gd"+this._parts(17,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-rd"+this._parts(18,brd)+".png'></td>";
    html += "<td><img src='"+imgpath+"b-ct"+cube_up+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-gd"+this._parts(19,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-rd"+this._parts(20,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-gd"+this._parts(21,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-rd"+this._parts(22,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-gd"+this._parts(23,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-rd"+this._parts(24,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-roff-x"+xgid.get_boff(1)+".png'></td>";
    html += "</tr>";
    html += "\n";
    html += "<tr>";
    html += "<td><img src='"+imgpath+"b-bar-o"+this._no(0)+".png'></td>";
    html += "</tr>";
    html += "\n";
    html += "<tr>";
    html += "<td><img src='"+imgpath+"b-midlb.png'></td>";
    html += "<td colspan='6'><img src='"+imgpath+dice_l+"'></td>";
    html += "<td><img src='"+imgpath+"b-midc"+cube_cn +".png'></td>";
    html += "<td colspan='6'><img src='"+imgpath+dice_r+"'></td>";
    html += "<td><img src='"+imgpath+"b-midrb.png'></td>";
    html += "</tr>";
    html += "\n";
    html += "<tr>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-roff-o0.png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-ru"+this._parts(12,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-gu"+this._parts(11,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-ru"+this._parts(10,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-gu"+this._parts( 9,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-ru"+this._parts( 8,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-gu"+this._parts( 7,brd)+".png'></td>";
    html += "<td><img src='"+imgpath+"b-bar-x"+this._no(25)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-ru"+this._parts( 6,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-gu"+this._parts( 5,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-ru"+this._parts( 4,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-gu"+this._parts( 3,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-ru"+this._parts( 2,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-gu"+this._parts( 1,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-roff-o"+xgid.get_boff(0)+".png'></td>";
    html += "</tr>";
    html += "\n";
    html += "<tr>";
    html += "<td><img src='"+imgpath+"b-cb"+cube_dn+".png'></td>";
    html += "</tr>";
    html += "\n";
    html += "<tr><td colspan='15'><img src='"+imgpath+this._frametbtm(turn, rotation)+"'></td></tr></table>";
    html += "\n";
  
    return html;
  }

  // GnuBGの部品画像ファイルでのHTML出力(時計回り)
  _get_html_gnu_cw() {
    this._checker_me = "-o";
    this._checker_yu = "-x";
    const rotation = "cw";
    const xgid = this._xgid;
    const imgpath = this._imgpath;
    const brd = this._boardtype;
    const cube_up = (xgid.get_cubepos() == -1 ? "-"+Math.pow(2, xgid.get_cube()).toString() : "" );
    const cube_dn = (xgid.get_cubepos() == 1  ? "-"+Math.pow(2, xgid.get_cube()).toString() : "" );
    const cube_cn = ((xgid.get_cubepos() == 0 && xgid.get_crawford() == 0) ? "-"+Math.pow(2, xgid.get_cube()).toString() : "" );
    const turn    = xgid.get_turn();
    const dice_r = this._dice_r(turn, xgid.get_dice_odr());
    const dice_l = this._dice_l(turn, xgid.get_dice_odr());

    let html = "";
    html += "<table cellpadding='0' border='0' cellspacing='0' style='margin: 0; padding: 0; border: 0'>";
    html += "\n";
    html += "<tr><td colspan='15'><img src='"+imgpath+this._frametop(turn, rotation)+"'></td></tr>";
    html += "\n";
    html += "<tr>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-roff-x"+xgid.get_boff(1)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-gd"+this._parts(24,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-rd"+this._parts(23,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-gd"+this._parts(22,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-rd"+this._parts(21,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-gd"+this._parts(20,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-rd"+this._parts(19,brd)+".png'></td>";
    html += "<td><img src='"+imgpath+"b-ct"+cube_up+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-gd"+this._parts(18,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-rd"+this._parts(17,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-gd"+this._parts(16,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-rd"+this._parts(15,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-gd"+this._parts(14,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-rd"+this._parts(13,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-roff-x0.png'></td>";
    html += "</tr>";
    html += "\n";
    html += "<tr>";
    html += "<td><img src='"+imgpath+"b-bar-o"+this._no(0)+".png'></td>";
    html += "</tr>";
    html += "\n";
    html += "<tr>";
    html += "<td><img src='"+imgpath+"b-midlb.png'></td>";
    html += "<td colspan='6'><img src='"+imgpath+dice_l+"'></td>";
    html += "<td><img src='"+imgpath+"b-midc"+cube_cn+".png'></td>";
    html += "<td colspan='6'><img src='"+imgpath+dice_r+"'></td>";
    html += "<td><img src='"+imgpath+"b-midrb.png'></td>";
    html += "</tr>";
    html += "\n";
    html += "<tr>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-roff-o"+xgid.get_boff(0)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-ru"+this._parts( 1,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-gu"+this._parts( 2,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-ru"+this._parts( 3,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-gu"+this._parts( 4,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-ru"+this._parts( 5,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-gu"+this._parts( 6,brd)+".png'></td>";
    html += "<td><img src='"+imgpath+"b-bar-x"+this._no(25)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-ru"+this._parts( 7,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-gu"+this._parts( 8,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-ru"+this._parts( 9,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-gu"+this._parts(10,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-ru"+this._parts(11,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-gu"+this._parts(12,brd)+".png'></td>";
    html += "<td rowspan='2'><img src='"+imgpath+"b-roff-o0.png'></td>";
    html += "</tr>";
    html += "\n";
    html += "<tr>";
    html += "<td><img src='"+imgpath+"b-cb"+cube_dn+".png'></td>";
    html += "</tr>";
    html += "\n";
    html += "<tr><td colspan='15'><img src='"+imgpath+this._frametbtm(turn, rotation)+"'></td></tr></table>";
    html += "\n";

    return html;
  }
} //class HtmlBoard
