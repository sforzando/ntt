# NTT

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Build Status](https://travis-ci.org/sforzando/ntt.svg?branch=master)](https://travis-ci.org/sforzando/ntt)
[![Build status](https://ci.appveyor.com/api/projects/status/v582o7xo4179sp1u?svg=true)](https://ci.appveyor.com/project/shin-sforzando/ntt)

> Numbered Ticket Terminal

## How to Develop

(T.B.D.)

## How to Use

発券から作品体験のながれ

■ 体験希望者への予約発券案内

1.  体験希望者に作品体験の説明をする。
2.  発券機の Print ボタンを押して発券する。
    3-a. [現在の体験者がいない場合]は、そのまま作品体験案内へ。
    3-b. [現在体験中の人がいる、もしくは先に予約している人がいる場合]は、予約券に記載された体験予定時刻の 5 分前には戻ってきてもらえるようお伝えする。

■ 予約者への作品体験案内

1.  体験する楽曲を確認する → 無響室へご案内する → 無響室のドアをしめる → 楽曲を選択しスタートさせる。（2. ストップウォッチでをスタートさせて、おおよその体験経過時間がわかるようにしておく。）
2.  作品の体験が終了する → 無響室内から外へ退出させる → 発券機の Next ボタンを押す。
3.  次の体験者の作品へのご案内、および体験希望者への予約（発券）案内

---

* `Print` ボタンを押すタイミング

  * 体験を希望をされた時。

* `Next` ボタンを押すタイミング
  * 無響室内で体験している人の体験が終了し、退出案内まで完了した時。もしくは、・
  * 画面に表示している「現在体験中」番号の人の体験予定時刻になっても、その予約した人が戻ってこず、その人の体験予定時刻＋作品体験時間（つまり、今回は記載された体験予定時刻＋ 10 分？5 分？）が過ぎた時。ex. 体験予定時刻 10:45 の人が 55 分？50 分？になっても戻られなかった時。
