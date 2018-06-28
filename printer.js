/* eslint no-console: 0 */

const escpos = require('escpos')
const moment = require('moment')

let device, printer

module.exports = class Printer {
  constructor(vendorID, productID) {
    const deviceInformation = escpos.USB.findPrinter()
    console.log('deviceInformation: ', deviceInformation)
    if (0 < deviceInformation.length) {
      // findPrinterで見つかったとき
      device = new escpos.USB(
        deviceInformation[0].deviceDescriptor.idVendor,
        deviceInformation[0].deviceDescriptor.idProduct
      )
    } else {
      // findPrinterで見つからなかったとき
      device = new escpos.USB(vendorID, productID)
    }
    printer = new escpos.Printer(device, { encoding: 'Shift_JIS' })
  }

  test() {
    device.open(() => {
      printer
        .align('ct')
        .size(1, 1)
        .font('a')
        .text('a')
        .style('b')
        .text('b 日本語のテスト 0123456789')
        .style('i')
        .text('i 日本語のテスト 0123456789')
        .style('u')
        .text('u 日本語のテスト 0123456789')
        .style('u2')
        .text('u2 日本語のテスト 0123456789')
        .style('bi')
        .text('bi 日本語のテスト 0123456789')
        .style('biu')
        .text('biu 日本語のテスト 0123456789')
        .style('bu')
        .text('bu 日本語のテスト 0123456789')
        .style('bu2')
        .text('bu2 日本語のテスト 0123456789')
        .style('iu')
        .text('iu 日本語のテスト 0123456789')
        .style('iu2')
        .text('iu2 日本語のテスト 0123456789')
        .control('LF')
        .font('b')
        .text('b')
        .style('b')
        .text('b 日本語のテスト 0123456789')
        .style('i')
        .text('i 日本語のテスト 0123456789')
        .style('u')
        .text('u 日本語のテスト 0123456789')
        .style('u2')
        .text('u2 日本語のテスト 0123456789')
        .style('bi')
        .text('bi 日本語のテスト 0123456789')
        .style('biu')
        .text('biu 日本語のテスト 0123456789')
        .style('bu')
        .text('bu 日本語のテスト 0123456789')
        .style('bu2')
        .text('bu2 日本語のテスト 0123456789')
        .style('iu')
        .text('iu 日本語のテスト 0123456789')
        .style('iu2')
        .text('iu2 日本語のテスト 0123456789')
        .control('LF')
        .qrimage('title:number:time', err => {
          if (err) console.error(err)
          printer
            .control('LF') // LF: Line Feed
            .cut()
            .close()
        })
    })
  }

  print(
    exhibitor = 'UNKNOWN',
    title = 'NO TITLE',
    number = 0,
    time = '00:00',
    note = '予定時刻の5分前にお越しください。'
  ) {
    device.open(() => {
      let currentTime = moment().format('HH:mm')
      printer
        .print('\x1b\x52\x08') // 国際文字セットを「日本」へ
        .print('\x1b\x74\x01') // 拡張ASCIIテーブルを「カタカナ」へ
        .print('\x1c\x43\x01') // 文字コードを「Shift_JIS」へ
        .font('a')
        .size(1, 1)
        .align('CT')
        .style('b')
        .text(exhibitor)
        .text(title)
        .control('LF')
        .text('番号')
        .style('bu')
        .size(2, 2)
        .text(number)
        .control('LF')
        .style('b')
        .text('予定時刻')
        .style('bu')
        .size(2, 2)
        .text(time)
        .control('LF')
        .size(1, 1)
        .text(note)
        .control('LF')
        .size(1, 1)
        .text(currentTime)
        .feed(2)
        .cut()

        .font('a')
        .size(1, 1)
        .align('CT')
        .style('b')
        .text(exhibitor)
        .text(title)
        .control('LF')
        .text('番号')
        .style('bu')
        .size(2, 2)
        .text(number)
        .control('LF')
        .style('b')
        .text('予定時刻')
        .style('bu')
        .size(2, 2)
        .text(time)
        .control('LF')
        .size(1, 1)
        .text(note)
        .control('LF')
        .size(1, 1)
        .text(currentTime)
        .feed(2)
        .cut()

        .close()
    })
  }
}
