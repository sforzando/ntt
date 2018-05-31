const escpos = require('escpos')
const deviceInformation = escpos.USB.findPrinter()[0]
const device = new escpos.USB(
  deviceInformation.deviceDescriptor.idVendor,
  deviceInformation.deviceDescriptor.idProduct
)
const printer = new escpos.Printer(device, { encoding: 'Shift_JIS' })

device.open(() => {
  printer.buffer.write('\x1b \x52 \x08 \x1b \x74 \x01 \x1c \x43 \x01').flush()
  printer
    .font('a')
    .align('ct')
    .size(2, 2)
    .text('TEST')
    .text('utf8のテスト', 'utf8')
    .text('utf16のテスト', 'utf16')
    .text('cp437のテスト', 'cp437')
    .text('cp932のテスト', 'cp932')
    .text('windows932のテスト', 'windows932')
    .text('shift_jisのテスト', 'shift_jis')
    .text('windows932のテスト', 'windows932')
    .text('euc-jpのテスト', 'euc-jp')
    .text('asciiのテスト', 'ascii')
    .text('iso646jpのテスト', 'iso646jp')
    .text('874のテスト', '874')
    .control('LF')
    .cut()
    .close()
})
