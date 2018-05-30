# NTT

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Build Status](https://travis-ci.org/sforzando/ntt.svg?branch=master)](https://travis-ci.org/sforzando/ntt)
[![Build status](https://ci.appveyor.com/api/projects/status/v582o7xo4179sp1u?svg=true)](https://ci.appveyor.com/project/shin-sforzando/ntt)

> Numbered Ticket Terminal

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
    - [Database](#database)
    - [Log](#log)

## How to Develop

### Requirements

* Node.js (8 or higher)

### Install Libraries

## How to Build

### for MacOS

```shell
$ npm build:mac
```

* インストーラ
  * MacOS: `build/NumberedTicketTerminal.dmg`
* アプリケーション
  * MacOS: `build/NumberedTicketTerminal.app`

### for Windows

```shell
$ npm build:win
```

* インストーラ
  * Windows: `build\NumberedTicketTerminal Setup.exe`
* アプリケーション
  * Windows: `build\NumberedTicketTerminal.exe`

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

(T.B.D.)

```json
{
  exhibitorName: "吉開菜央 | YOSHIGAI Nao",
  exhibitionTitle:
    "《Grand Bouquet／いま いちばん美しいあなたたちへ》\n“Grand Bouquet”",
  experienceTime: 10,
  file_prefix: "yoshigai",
  keyNext: "KeyN",
  keyPrint: "KeyP",
  keyReprint: "KeyR",
  lastOrder: "17:45", // = 閉館時刻5分前(ex. 17:55) - experienceTime
  note: "予定時刻の5分前にお越しください。",
  port: 1997
}
```

### On MediaWall

(T.B.D.)

### From Office

(T.B.D.)

## How to Use

### Operation Flow

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

#### Database

Windows の場合、 `C:\Users\<USER>\AppData\Roaming\ntt` 、MacOS の場合、 `/Users/<USER>/Library/Application Support/ntt` にデータベース([NeDB](https://github.com/louischatriot/nedb))が日別で保存される。

#### Log

[Database](#database)と同じ場所に`*.txt`ファイルが日別で保存される。
