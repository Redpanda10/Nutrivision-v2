import { useEffect, useState } from "react";
import { View, Text, Button, ActivityIndicator, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { api } from "../../lib/api";

export default function Scan() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission, requestPermission]);

  const sendImageForScan = async (uri: string) => {
    try {
      setIsCapturing(true);
      const form = new FormData();

      if (Platform.OS === "web") {
        const blob = await (await fetch(uri)).blob();
        form.append("image", blob, "scan.jpg");
      } else {
        form.append(
          "image",
          {
            uri,
            name: "scan.jpg",
            type: "image/jpeg"
          } as any
        );
      }

      // Keep for debugging / display; backend still stores this
      form.append("imageUri", uri);

      const res = await api.post("/api/food/scan", form, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      const item = res.data;
      router.push(`/food/${item._id}`);
    } catch (error) {
      console.error(error);
      Alert.alert("Scan failed", "Could not analyze food. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleCapture = async () => {
    if (!cameraRef) return;
    const photo = await cameraRef.takePictureAsync();
    await sendImageForScan(photo.uri);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 0.8
    });
    if (result.canceled || !result.assets || result.assets.length === 0) return;
    const uri = result.assets[0].uri;
    await sendImageForScan(uri);
  };

  if (!permission) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={{ padding: 20, gap: 12 }}>
        <Text>We need your permission to use the camera.</Text>
        <Button title="Grant permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {cameraOpen ? (
        <CameraView
          style={{ flex: 1 }}
          ref={(ref) => setCameraRef(ref)}
          facing="back"
        />
      ) : (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text>Camera is closed.</Text>
        </View>
      )}
      <View
        style={{
          padding: 16,
          backgroundColor: "rgba(0,0,0,0.6)",
          gap: 8
        }}
      >
        <Button
          title={cameraOpen ? "Close Camera" : "Open Camera"}
          onPress={() => setCameraOpen((prev) => !prev)}
        />
        <Button title="Upload Image" onPress={handlePickImage} />
        {cameraOpen && (
          isCapturing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Button title="Scan Food" onPress={handleCapture} />
          )
        )}
      </View>
    </View>
  );
}