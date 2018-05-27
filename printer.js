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
        .font('a')
        .align('ct')
        .style('bu')
        .size(1, 1)
        .text('The quick brown fox jumps over the lazy dog')
        .text('日本語のテスト')
        .barcode('1234567', 'EAN8')
        .qrimage('https://github.com/song940/node-escpos', function(err) {
          if (err) console.error(err)
          this.cut()
          this.close()
        })
    })
  }
}
