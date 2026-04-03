export function useSerial(canvasRef: Ref<HTMLCanvasElement | null>) {
  async function copyToBadge() {
    if (!import.meta.client || !('serial' in navigator)) {
      alert('Web Serial API not supported in this browser.')
      return
    }

    try {
      const port = await (navigator as any).serial.requestPort()
      await port.open({ baudRate: 115200 })

      const encoder = new TextEncoderStream()
      const writableStreamClosed = encoder.readable.pipeTo(port.writable)
      const writer = encoder.writable.getWriter()

      const decoder = new TextDecoderStream()
      const readableStreamClosed = port.readable.pipeTo(decoder.writable)
      const reader = decoder.readable.getReader()

      async function sendCommand(command: string) {
        await writer.write(command + '\r\n')
      }

      await sendCommand('\x03')
      await sendCommand('\x01')
      await sendCommand('')

      const pythonCode = `import badger2040
import pngdec

display = badger2040.Badger2040()
png = pngdec.PNG(display.display)

display.led(128)
display.clear()

try:
    png.open_file("badge.png")
    png.decode()
except (OSError, RuntimeError):
    print("Badge background error")

display.update()`

      if (!canvasRef.value) return
      const imageBlob = await new Promise<Blob>(resolve =>
        canvasRef.value?.toBlob(blob => resolve(blob!), 'image/png'),
      )
      const imageArrayBuffer = await imageBlob.arrayBuffer()
      const imageUint8Array = new Uint8Array(imageArrayBuffer)

      await sendCommand(`f = open('main.py', 'w')`)
      for (const line of pythonCode.split('\n')) {
        await sendCommand(`f.write('${line}\\n')`)
      }
      await sendCommand(`f.close()`)

      await sendCommand(`f = open('badge.png', 'wb')`)
      const chunkSize = 256
      for (let i = 0; i < imageUint8Array.length; i += chunkSize) {
        const chunk = imageUint8Array.slice(i, i + chunkSize)
        const hexString = Array.from(chunk).map(b => b.toString(16).padStart(2, '0')).join('')
        await sendCommand(`f.write(bytes.fromhex('${hexString}'))`)
      }
      await sendCommand(`f.close()`)

      await sendCommand('import machine; machine.reset()')
      await sendCommand('\x04')

      writer.close()
      await writableStreamClosed
      reader.cancel()
      await readableStreamClosed
      await port.close()
    }
    catch (error) {
      console.error('Error:', error)
    }
  }

  return { copyToBadge }
}
