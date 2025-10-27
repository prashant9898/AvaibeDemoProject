import FaceDetection, { Face, Landmark } from '@react-native-ml-kit/face-detection'

export type FaceLandmarks = {
  leftEye?: { x: number; y: number }
  rightEye?: { x: number; y: number }
  noseBase?: { x: number; y: number }
}

function mapLandmark(landmark?: Landmark): { x: number; y: number } | undefined {
  if (!landmark) return undefined
  return { x: landmark.position.x, y: landmark.position.y }
}

export async function detectFaceLandmarks(imagePath: string): Promise<FaceLandmarks | null> {
  try {
    const faces: Face[] = await FaceDetection.detect(imagePath)
    if (!faces || faces.length === 0) return null

    const face = faces[0]
    return {
      leftEye: mapLandmark(face.landmarks?.leftEye),
      rightEye: mapLandmark(face.landmarks?.rightEye),
      noseBase: mapLandmark(face.landmarks?.noseBase),
    }
  } catch (err) {
    console.warn('[FaceDetector] Error:', err)
    return null
  }
}
