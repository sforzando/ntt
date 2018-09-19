# NTT

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Build Status](https://travis-ci.org/sforzando/ntt.svg?branch=master)](https://travis-ci.org/sforzando/ntt)
[![Build status](https://ci.appveyor.com/api/projects/status/v582o7xo4179sp1u?svg=true)](https://ci.appveyor.com/project/shin-sforzando/ntt)

> Numbered Ticket Terminal

- [NTT](#ntt)
  - [How to Develop](#how-to-develop)
    - [Requirements](#requirements)
    - [Install Libraries](#install-libraries)
  - [How to Build](#how-to-build)
    - [for MacOS](#for-macos)
    - [for Windows](#for-windows)
  - [How to Deploy](#how-to-deploy)
    - [Thermal Printer](#thermal-printer)
    - [Settings](#settings)
    - [On MediaWall](#on-mediawall)
    - [From Office](#from-office)
  - [How to Use](#how-to-use)
    - [Operation Flow](#operation-flow)
      - [Issuing Ticket](#issuing-ticket)
      - [Instruction](#instruction)
    - [Logging](#logging)
      - [Log](#log)

## How to Develop

### Requirements

* Node.js (8 or higher)

### Install Libraries

```
$ npm install
```

## How to Build

### for MacOS

```shell
$ npm build:mac
```

* インストーラ
  * MacOS: `build/NumberedTicketTerminal.dmg`
* アプリケーション
  * MacOS: `build/mac/NumberedTicketTerminal.app`

### for Windows

```shell
$ npm build:win
```

* インストーラ
  * Windows: `build\NumberedTicketTerminal Setup.exe`
* アプリケーション
  * Windows: `build\win\NumberedTicketTerminal.exe`

## How to Deploy

### Thermal Printer

**EPSON TM-T88V**で動作検証した。
MacOS の場合、下記のコマンドで接続を確認できる。

```shell
$ system_profiler SPUSBDataType
<snip>
        USB2.0 Hub:

          Product ID: 0x0610
          Vendor ID: 0x05e3  (Genesys Logic, Inc.)
          Version: 92.23
          Speed: Up to 480 Mb/sec
          Manufacturer: GenesysLogic
          Location ID: 0x14200000 / 6
          Current Available (mA): 500
          Current Required (mA): 100
          Extra Operating Current (mA): 0

            TM-T88V:

              Product ID: 0x0e02
              Vendor ID: 0x04b8  (Seiko Epson Corp.)
              Version: 1.00
              Serial Number: 4E334B463429810000
              Speed: Up to 12 Mb/sec
              Manufacturer: EPSON
              Location ID: 0x14220000 / 9
              Current Available (mA): 500
              Current Required (mA): 2
              Extra Operating Current (mA): 0
              1284 Device ID: MFG:EPSON;CMD:ESC/POS;MDL:TM-T88V-JPN;CLS:PRINTER;DES:EPSON TM-T88V;CID:EpsonTM00000101;
```

### Settings

デスクトップに`ntt_settings.json`というファイル名で保存する。

```json
{
  "_comment":
    "こちらの設定情報をデスクトップへ ntt_settings.json の名前で保存してください。",
  "exhibitorName": "吉開菜央 | YOSHIGAI Nao",
  "exhibitionTitle":
    "《Grand Bouquet／いま いちばん美しいあなたたちへ》\n“Grand Bouquet”",
  "experienceTime": 20,
  "keyNext": "KeyN",
  "keyPrint": "KeyP",
  "keyReprint": "KeyR",
  "lastOrder": "17:45",
  "print_note": "予定時刻の5分前にお越しください。",
  "port": 1997,
  "printer_vendorID": "0x04b8",
  "printer_productID": "0x0e02"
}
```

* "exhibitorName"
  * 展示名
    * 改行は`\n`で指定する
* "exhibitionTitle"
  * 作家名
    * 改行は`\n`で指定する
* "experienceTime"
  * 体験時間、単位は**分**
* "keyNext"
  * `Next`に割り当てるキー
    * cf. [KeyboardEvent.code](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code)
* "keyPrint"
  * `Print`に割り当てるキー
* "keyReprint
  * `Reprint`に割り当てるキー
* "lastOrder"
  * 最終受付時刻
    * 慣例では、`閉館時刻の5分前 - 体験時間`
* "print_note"
  * 発券末尾に記載する特記事項
* "port"
  * Web サーバ、Socket.IO サーバが起動するポート
* "printer_vendorID"
  * サーマルプリンタの製造元 ID
    * MacOS の場合、前述の`system_profiler SPUSBDataType`コマンド、またはシステムレポートから照会可能
    * JSON は 16 進数を直接記載できないため、**ダブルクォート(=文字列)** している
* "printer_productID"
  * サーマルプリンタの製品 ID

![system_report](https://user-images.githubusercontent.com/32637762/40765182-a023307c-64e6-11e8-8842-89ad9a920753.png)

### On MediaWall

[http://<IP_ADDRESS>:1997/view.html](http://<IP_ADDRESS>:1997/view.html)を参照すれば、`PRINT/NEXT`キーが効かない安全な状態で閲覧可能。

※ Proxyの設定に注意。

### From Office

[http://<IP_ADDRESS>:1997/log.html](http://<IP_ADDRESS>:1997/log.html)

発券や体験が進むと自動的に表示が更新されます。

|WIDE|PORTRAIT|
|:--:|:-:|
|![](https://user-images.githubusercontent.com/40506652/43690375-b7da97aa-9943-11e8-9317-627e6be196d0.png)|![](https://user-images.githubusercontent.com/40506652/43690378-be6e3bda-9943-11e8-96b5-08b4d946405a.png)|

## How to Use

### Operation Flow

鹿島田氏のメモより抜粋。

#### Issuing Ticket

1.  体験希望者に作品体験の説明をする。
1.  発券機の Print ボタンを押して発券する。
    * **現在の体験者がいない場合**は、そのまま作品体験案内へ。
    * **現在体験中の人がいる、もしくは先に予約している人がいる場合**は、予約券に記載された体験予定時刻の 5 分前には戻ってきてもらえるようお伝えする。

* `Print` ボタンを押すタイミング

  * 体験を希望をされた時。

* `Next` ボタンを押すタイミング
  * 無響室内で体験している人の体験が終了し、退出案内まで完了した時。
  * 画面に表示している「現在体験中」番号の人の体験予定時刻になっても戻ってこず、その人の体験予定時刻＋作品体験時間（つまり、今回は記載された体験予定時刻＋ 10 分？5 分？）が過ぎた時。
    * ex. 体験予定時刻 10:45 の人が 55 分？50 分？になっても戻られなかった時。

#### Instruction

1.  体験する楽曲を確認する → 無響室へご案内する → 無響室のドアをしめる → 楽曲を選択しスタートさせる。
    * （ストップウォッチでをスタートさせて、おおよその体験経過時間がわかるようにしておく。）
1.  作品の体験が終了する → 無響室内から外へ退出させる → 発券機の Next ボタンを押す。
1.  次の体験者の作品へのご案内、および体験希望者への予約（発券）案内

### Logging

#### Log

`~/Library/Application Support/ntt/log` に `*.txt` ファイルが日別で保存される。
