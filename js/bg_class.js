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
    this._dice_ary = [0, 0, 0];
    this._sc_me = 0;
    this._sc_yu = 0;
    this._jb = 0;
    this._matchsc = 0;
    this._maxcube = 0;
    this._crawford = false;
    this._ptno = new Array(26);
    this._ptcol = new Array(26);
    this._pip = [0, 0];
    this._boff = [0, 0];
    this._dbloffer = false;

    this._parse_xgid(this._xgid); // XGIDを解析
    this._parse_position(this._position); // ボード状態を解析
  }

  // XGIDをパースし状態をローカル変数に格納
  _parse_xgid(xgidstr) {
    const xgidstr2 = xgidstr.substr("XGID=".length);
    const s = xgidstr2.split(":");

    if (s[4] == "D") { s[4] = "00"; this._dbloffer = true; }

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
    this._dice_ary = [0, parseInt(dice1), parseInt(dice2)];

    // クロフォード状態を確認
    this._crawford = (this._matchsc > 0 && this._jb != 0) ? true : false;
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
  get_dice(n)    {
    if (n == 1 || n == 2) { return this._dice_ary[n]; }
    else                  { return this._dice; }
  }
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
  get_dbloffer() { return this._dbloffer; }
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

class GnuID {
  constructor(xgidstr) {
    this._xgid = new Xgid(xgidstr);
    this._positionid = this._xgid2position(this._xgid);
    this._matchid    = this._xgid2matchid(this._xgid);
  }

  //public mathod
  get_gnuid() {
    return this._positionid + ":" + this._matchid;
  }
  get_gnuposition() {
    return this._positionid;
  }

  //以下はprivate method

  //XGID(ポジション)からポジションIDを作成
  _xgid2position(xgid) {
    let bit = "";
    let mx;
    for (let p=24; p >= 0; p--) {
      if (xgid.get_ptcol(p) == -1 && (mx = xgid.get_ptno(p)) > 0) {
        for (let q=0; q < mx; q++, bit += "1");
      }
      bit += "0";
    }
    for (let p=1; p <= 25; p++) {
      if (xgid.get_ptcol(p) ==  1 && (mx = xgid.get_ptno(p)) > 0) {
        for (let q=0; q < mx; q++, bit += "1");
      }
      bit += "0";
    }
    const ary = this._bit2ary(bit);
    const b64 = this._ary2base64(ary);
    return b64;
  }

  //XGIDからマッチIDを作成
  _xgid2matchid(xgid) {
    let bit = "";
    bit += this._reverse(("0000" + xgid.get_cube().toString(2)).substr(-4));
    const cubepos = xgid.get_cubepos();
    bit += (cubepos == 1 ? "10" : cubepos == -1 ? "00" : "11");
    bit += xgid.get_turn() == 1 ? "1" : "0";
    bit += xgid.get_crawford();
    bit += "100";  //001 for playing a game (_reverse)
    bit += xgid.get_turn() == 1 ? "1" : "0"; //indicates whose turn it is.
    bit += xgid.get_dice() == "00" ? "1" : "0"; //indicates whether an doubled is being offered.
    bit += "00";  //00 for no resignation
    const dice1 = parseInt(xgid.get_dice_odr().substr(0,1));
    const dice2 = parseInt(xgid.get_dice_odr().substr(1,1));
    bit += this._reverse(("000" + dice1.toString(2)).substr(-3));
    bit += this._reverse(("000" + dice2.toString(2)).substr(-3));
    const sc_mc = xgid.get_matchsc();
    const sc_me = xgid.get_sc_me();
    const sc_yu = xgid.get_sc_yu();
    bit += this._reverse(("000000000000000" + sc_mc.toString(2)).substr(-15));
    bit += this._reverse(("000000000000000" + sc_yu.toString(2)).substr(-15));
    bit += this._reverse(("000000000000000" + sc_me.toString(2)).substr(-15));
console.log(bit);
    const ary = this._bit2ary(bit);
    const b64 = this._ary2base64(ary);
    return b64;
  }

  //2進数文字列を1バイト(8ビット)ずつに区切り、バイナリデータ配列に格納
  _bit2ary(bitstr) {
    let ary = [];
    while (bitstr !== "") {
      const a = bitstr.substr(0, 8);
      const r = this._reverse(a); //2進数文字列のエンディアン変更(ビッグ→リトル)
      const b = parseInt(r, 2);
      ary.push(b);
      bitstr = bitstr.substr(8);
    }
    return ary;
  }

  //文字列を反転
  _reverse(s) {
    let r = "";
    for (let i = s.length - 1; i >= 0; r += s[i], i--);
    return r;
  }

  //バイナリデータ配列からBASE64文字列を作成
  _ary2base64(ary) {
    let binstr = "";
    for (let i=0; i < ary.length; i++) {
      binstr += String.fromCharCode(ary[i]);
    }
    return btoa(binstr).replace(/=/g, ""); //BASE64文字列を作成後、行末の = を削除
  }
} // class GnuID

class XgFontBoard {
  constructor(xgidstr, boardtype) {
    this.rotation = (boardtype == 'gnu-ccw') ? 0 : 1;
    this.xgid = new Xgid(xgidstr);
    this.turn = (this.xgid.get_turn() == 1) ? 0 : 1;
    this.xgboard = [[32,241,161,178,177,178,162,242,32,13,10],
                    [32,240, 65, 70, 65, 70, 65, 70,64,32,64, 65, 70, 65, 70, 65, 70,240,32,13,10],
                    [32,240, 66, 71, 66, 71, 66, 71,64,32,64, 66, 71, 66, 71, 66, 71,240,32,13,10],
                    [32,240, 67, 72, 67, 72, 67, 72,64,32,64, 67, 72, 67, 72, 67, 72,240,32,13,10],
                    [32,240, 68, 73, 68, 73, 68, 73,64,32,64, 68, 73, 68, 73, 68, 73,240,32,13,10],
                    [32,240, 69, 74, 69, 74, 69, 74,64,32,64, 69, 74, 69, 74, 69, 74,240,32,13,10],
                    [32,240, 32, 32, 32, 32, 32, 32,64,32,64, 32, 32, 32, 32, 32, 32,240,32,13,10],
                    [32,240,106,101,106,101,106,101,64,32,64,106,101,106,101,106,101,240,32,13,10],
                    [32,240,105,100,105,100,105,100,64,32,64,105,100,105,100,105,100,240,32,13,10],
                    [32,240,104, 99,104, 99,104, 99,64,32,64,104, 99,104, 99,104, 99,240,32,13,10],
                    [32,240,103, 98,103, 98,103, 98,64,32,64,103, 98,103, 98,103, 98,240,32,13,10],
                    [32,240,102, 97,102, 97,102, 97,64,32,64,102, 97,102, 97,102, 97,240,32,13,10],
                    [32,243,163,180,179,180,164,244,32,13,10]];
    this.set_frame();
    this.set_cube();
    this.set_dice();
    this.set_bearoff();
    this.set_chequer();
  }

  //ボードフレームを表示
  set_frame() {
    const no = this.rotation + this.turn * 2;
    const frameary = [[161,162,163,164], [173,174,175,176], [165,166,167,168], [169,170,171,172]];
    this.xgboard[ 0][2] = frameary[no][0];
    this.xgboard[ 0][6] = frameary[no][1];
    this.xgboard[12][2] = frameary[no][2];
    this.xgboard[12][6] = frameary[no][3];
  }

  //キューブを表示
  set_cube() {
    if (this.xgid.get_crawford()) { return; }
    const xx = (this.rotation == 0) ? 0 : 18;
    const cubepos = this.xgid.get_cubepos();
    const cubeval = this.xgid.get_cube();
    const yyary = [1, 6, 11];
    const yy = yyary[this.xgid.get_cubepos() + 1]; //cubepos = (-1, 0, 1)
    const cubechar = (cubeval == 0) ? 39 : 33 + cubeval; // 39 = cube64
    this.xgboard[yy][xx] = cubechar;
  }

  //ダイスを表示
  set_dice() {
    if (this.xgid.get_dice() == "00") { return; }
    const xx0 = (this.turn == 0) ? 12 : 3;
    const xx3 = xx0 + 3;
    const offset = (this.turn == 0) ? 55 : 48;
    this.xgboard[6][xx0] = this.xgid.get_dice(1) + offset;
    this.xgboard[6][xx3] = this.xgid.get_dice(2) + offset;
  }

  //ベアオフチェッカーを表示
  set_bearoff() {
    const xx = (this.rotation == 0) ? 18 : 0;
    const bo_me = this.xgid.get_boff(0);
    const bo_yu = this.xgid.get_boff(1);
    this.xgboard[ 1][xx] = (bo_yu >  5) ? 230 : ((bo_yu > 0) ? 230 + ( 5 - bo_yu) : 32);
    this.xgboard[ 2][xx] = (bo_yu > 10) ? 230 : ((bo_yu > 5) ? 230 + (10 - bo_yu) : 32);
    this.xgboard[ 3][xx] =                      ((bo_yu >10) ? 230 + (15 - bo_yu) : 32);
    this.xgboard[11][xx] = (bo_me >  5) ? 235 : ((bo_me > 0) ? 235 + ( 5 - bo_me) : 32);
    this.xgboard[10][xx] = (bo_me > 10) ? 235 : ((bo_me > 5) ? 235 + (10 - bo_me) : 32);
    this.xgboard[ 9][xx] =                      ((bo_me >10) ? 235 + (15 - bo_me) : 32);
  }

  //チェッカーを表示
  set_chequer() {
    const xxary = [[9,16,15,14,13,12,11, 7, 6, 5, 4, 3, 2, 2, 3, 4, 5, 6, 7,11,12,13,14,15,16, 9], //CCW
                   [9, 2, 3, 4, 5, 6, 7,11,12,13,14,15,16,16,15,14,13,12,11, 7, 6, 5, 4, 3, 2, 9]]; //CW
    for (var pt = 0; pt < 26; pt++) {
      const col = this.xgid.get_ptcol(pt);
      const no  = this.xgid.get_ptno(pt);
      const xxx = xxary[this.rotation][pt];
      if (no == 0) { continue; }
      for (var yy = 0; yy < 5 && yy < no; yy++) {
        const yyy = (pt >= 13) ? 1 + yy : 11 - yy;
        if (pt == 0 || pt == 25) {
          this.xgboard[yyy][xxx] = (col == 1 ? 219 : 208); //on the bar
        } else {
          this.xgboard[yyy][xxx] += (col == 1 ? 20 : 10); //in field
        }
      }
      if (no >= 6) {
        const yyy = (pt >= 13) ? 5 : 7;
        this.xgboard[yyy][xxx] = no - 5 + (col == 1 ? 219 : 208); //stack chequer
      }
    }
  }

  //ボードを文字コードで組み立てる
  get_xgfontboard() {
    var xgboard = "";
    for (var line of this.xgboard) {
      xgboard += String.fromCharCode.apply(null, line);
    }
    return xgboard;
  }

} // class XgFontBoard
