import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  StyleSheet,
  Text,
  Button,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native'
import { Camera, CameraDevice, useCameraDevices } from 'react-native-vision-camera'
import ViewShot from 'react-native-view-shot'
import OverlayAccessory from './OverlayAccessory'
import { detectFaceLandmarks, FaceLandmarks } from '../ml/FaceDetector'
import { startRecording, stopRecording } from '../utils/recorder'

export default function CameraView() {
  const devices = useCameraDevices() as CameraDevice[]
  const device = devices.find(d => d.position === 'front') ?? devices[0]
  const cameraRef = useRef<Camera>(null)
  const viewShotRef = useRef<ViewShot>(null)

  const [hasPermission, setHasPermission] = useState(false)
  const [faceLandmarks, setFaceLandmarks] = useState<FaceLandmarks | null>(null)
  const [recording, setRecording] = useState(false)

  // Overlay toggles
  const [showSunglasses, setShowSunglasses] = useState(true)
  const [showHat, setShowHat] = useState(true)
  const [showMustache, setShowMustache] = useState(true)

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermission()
      const micStatus = await Camera.requestMicrophonePermission()
      setHasPermission(cameraStatus === 'granted' && micStatus === 'granted')

      if (Platform.OS === 'android') {
        await requestAndroidStoragePermission()
      }
    })()
  }, [])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (hasPermission && cameraRef.current) {
      interval = setInterval(async () => {
        try {
          if (cameraRef.current?.takePhoto) {
            const photo = await cameraRef.current.takePhoto()
            if (photo?.path) {
              const landmarks = await detectFaceLandmarks(photo.path)
              setFaceLandmarks(landmarks)
            }
          }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_err) {}
      }, 250)
    }
    return () => clearInterval(interval)
  }, [hasPermission])

  async function requestAndroidStoragePermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'App needs storage permission to save videos',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      )
      return granted === PermissionsAndroid.RESULTS.GRANTED
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      return false
    }
  }

  async function handleRecord() {
    if (!hasPermission) {
      Alert.alert('Permissions missing', 'Camera and microphone required')
      return
    }

    try {
      setRecording(true)
      await startRecording(viewShotRef as unknown as React.RefObject<View>)
      setTimeout(async () => {
        const videoPath = await stopRecording()
        setRecording(false)
        if (videoPath) Alert.alert('Video Saved', videoPath)
      }, 12000)
    } catch (err) {
      setRecording(false)
      Alert.alert('Error', String(err))
    }
  }

  // eslint-disable-next-line react-native/no-inline-styles
  if (!device) return <Text style={{ color: '#fff' }}>Loading camera...</Text>

  return (
    <View style={styles.container}>
      <ViewShot ref={viewShotRef} style={styles.fullFlex} options={{ format: 'jpg', quality: 0.8 }}>
        <Camera
          ref={cameraRef}
          style={styles.fullFlex}
          device={device}
          isActive={true}
          photo={true}
          video={true}
          audio={true}
        />
        <OverlayAccessory
          landmarks={faceLandmarks}
          showSunglasses={showSunglasses}
          showHat={showHat}
          showMustache={showMustache}
        />
      </ViewShot>

      <View style={styles.controls}>
        <Button title={recording ? 'Recording...' : 'Record 12s'} onPress={handleRecord} disabled={recording} />
        <View style={styles.toggleRow}>
          <Button
            title={`Sunglasses: ${showSunglasses ? 'ON' : 'OFF'}`}
            onPress={() => setShowSunglasses(prev => !prev)}
          />
          <Button title={`Hat: ${showHat ? 'ON' : 'OFF'}`} onPress={() => setShowHat(prev => !prev)} />
          <Button title={`Mustache: ${showMustache ? 'ON' : 'OFF'}`} onPress={() => setShowMustache(prev => !prev)} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  fullFlex: { width: '100%', height: '100%' },
  controls: { position: 'absolute', bottom: 20, left: 20, right: 20 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
})
