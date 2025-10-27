import { captureRef } from 'react-native-view-shot'
import RNFS from 'react-native-fs'
import { FFmpegKit } from 'ffmpeg-kit-react-native'
import { RefObject } from 'react'
import { View } from 'react-native'

let isRecording = false
let framePaths: string[] = []

export async function startRecording(viewRef: RefObject<View>) {
  if (isRecording) return
  isRecording = true
  framePaths = []

  const captureFrames = async () => {
    while (isRecording && viewRef.current) {
      const uri = await captureRef(viewRef, { format: 'jpg', quality: 0.8 })
      framePaths.push(uri)
      await new Promise<void>(resolve => setTimeout(resolve, 200))
    }
  }

  captureFrames()
  console.log('[Recorder] Started recording...')
}

export async function stopRecording(): Promise<string | null> {
  isRecording = false
  console.log('[Recorder] Stopping recording...')

  if (framePaths.length === 0) return null

  const outputPath = `${RNFS.CachesDirectoryPath}/output.mp4`
  const listPath = `${RNFS.CachesDirectoryPath}/frames.txt`
  const content = framePaths.map(path => `file '${path}'\nduration 0.2`).join('\n')
  await RNFS.writeFile(listPath, content, 'utf8')

  const cmd = `-f concat -safe 0 -i ${listPath} -vsync vfr -pix_fmt yuv420p ${outputPath}`
  await FFmpegKit.execute(cmd)
  console.log(`[Recorder] Video saved to: ${outputPath}`)

  return outputPath
}
