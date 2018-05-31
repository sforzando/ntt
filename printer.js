/* eslint no-console: 0 */

const escpos = require('escpos')
const deviceInformation = escpos.USB.findPrinter()[0]
console.log('deviceInformation: ', deviceInformation)
const device = new escpos.USB(
  deviceInformation.deviceDescriptor.idVendor,
  deviceInformation.deviceDescriptor.idProduct
)
const printer = new escpos.Printer(device, { encoding: 'CP932' })

module.exports = class Printer {
  constructor() {}

  sample() {
    device.open(() => {
      printer
        .align('ct')
        .size(2, 2)
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
      printer
        .font('a')
        .size(2, 2)
        .align('CT')
        .style('b')
        .text(exhibitor)
        .text(title)
        .control('LF')
        .text('番号')
        .style('bu')
        .text(number)
        .control('LF')
        .style('b')
        .text('予定時刻')
        .style('bu')
        .text(time)
        .control('LF')
        .size(1, 1)
        .text(note)
        .control('LF')
        .cut()
        .close()
    })
  }
}
