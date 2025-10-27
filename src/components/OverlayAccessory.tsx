import React from 'react'
import { Image, StyleSheet } from 'react-native'
import { FaceLandmarks } from '../ml/FaceDetector'

type Props = {
  landmarks: FaceLandmarks | null
  showSunglasses?: boolean
  showHat?: boolean
  showMustache?: boolean
}

export default function OverlayAccessory({
  landmarks,
  showSunglasses = true,
  showHat = true,
  showMustache = true,
}: Props) {
  if (!landmarks) return null
  const { leftEye, rightEye, noseBase } = landmarks
  if (!leftEye || !rightEye || !noseBase) return null

  const centerX = (leftEye.x + rightEye.x) / 2
  const eyeDistance = Math.abs(rightEye.x - leftEye.x)

  return (
    <>
      {showSunglasses && (
        <Image
          source={require('../assets/sunglasses.png')}
          style={[
            styles.sunglasses,
            { left: centerX - eyeDistance, top: leftEye.y - 20, width: eyeDistance * 2, height: eyeDistance * 0.7 },
          ]}
        />
      )}
      {showHat && (
        <Image
          source={require('../assets/hat.png')}
          style={[
            styles.hat,
            { left: centerX - eyeDistance, top: leftEye.y - eyeDistance * 1.5, width: eyeDistance * 2.5, height: eyeDistance * 1.2 },
          ]}
        />
      )}
      {showMustache && (
        <Image
          source={require('../assets/mustache.png')}
          style={[
            styles.mustache,
            { left: centerX - eyeDistance * 0.7, top: noseBase.y + 5, width: eyeDistance * 1.4, height: eyeDistance * 0.4 },
          ]}
        />
      )}
    </>
  )
}

const styles = StyleSheet.create({
  sunglasses: { position: 'absolute', resizeMode: 'contain' },
  hat: { position: 'absolute', resizeMode: 'contain' },
  mustache: { position: 'absolute', resizeMode: 'contain' },
})
