import React, { useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
  StatusBar,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../stores/authStore";

const BASE_URL = "http://192.168.16.101:5000/api";
const COLORS = {
  primary: "#22c55e",
  primaryDark: "#16a34a",
  background: "#f8fafc",
  card: "#ffffff",
  text: "#1e293b",
  muted: "#64748b",
  danger: "#ef4444",
};

export default function ScanScreen() {
  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const { user } = useAuthStore();

  const [image, setImage] = useState<any>(null);
  const [annotatedImage, setAnnotatedImage] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [foods, setFoods] = useState<any[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<any[]>([]);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFood, setEditingFood] = useState<any>(null);
  const [weightInput, setWeightInput] = useState("100");

  /* ================= CALCULATIONS ================= */

  const calc = (baseVal: number, weight: string) => {
    const w = parseFloat(weight) || 0;
    return baseVal * (w / 100);
  };

  const totals = useMemo(() => {
    return selectedFoods.reduce(
      (acc, f) => ({
        calories: acc.calories + calc(f.nutrition.caloriesKcal, f.userWeight || "100"),
        protein: acc.protein + calc(f.nutrition.proteinG, f.userWeight || "100"),
        carbs: acc.carbs + calc(f.nutrition.carbsG, f.userWeight || "100"),
        fat: acc.fat + calc(f.nutrition.fatG, f.userWeight || "100"),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [selectedFoods]);

  /* ================= HANDLERS ================= */

  const toggleSelect = (food: any) => {
    const isSelected = selectedFoods.find((f) => f.id === food.id);
    if (isSelected) {
      setSelectedFoods(selectedFoods.filter((f) => f.id !== food.id));
    } else {
      const allergic = user?.allergies?.some(
        (a: string) => a.toLowerCase() === food.name.toLowerCase()
      );
      if (allergic) {
        Alert.alert("Allergy Warning", `You are allergic to ${food.name}! Add anyway?`, [
          { text: "Cancel", style: "cancel" },
          {
            text: "Add",
            onPress: () => setSelectedFoods([...selectedFoods, { ...food, userWeight: "100" }]),
          },
        ]);
      } else {
        setSelectedFoods([...selectedFoods, { ...food, userWeight: "100" }]);
      }
    }
  };

  const openWeightModal = (food: any) => {
    const selectedVersion = selectedFoods.find((f) => f.id === food.id);
    setEditingFood(food);
    setWeightInput(selectedVersion?.userWeight || "100");
    setModalVisible(true);
  };

  const updateWeight = () => {
    const isAlreadySelected = selectedFoods.find((f) => f.id === editingFood.id);
    if (isAlreadySelected) {
      setSelectedFoods(
        selectedFoods.map((f) =>
          f.id === editingFood.id ? { ...f, userWeight: weightInput } : f
        )
      );
    } else {
      setSelectedFoods([...selectedFoods, { ...editingFood, userWeight: weightInput }]);
    }
    setModalVisible(false);
    Keyboard.dismiss();
  };

  const scanFood = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();
      formData.append("image", {
        uri: Platform.OS === "android" ? image.uri : image.uri.replace("file://", ""),
        name: "food.jpg",
        type: "image/jpeg",
      } as any);

      const res = await axios.post(`${BASE_URL}/food/scan`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });

      setFoods(res.data.detectedFoods || []);
      
      // Update with annotated image from backend if available
      if (res.data.annotatedImageUrl) {
        setAnnotatedImage(res.data.annotatedImageUrl);
      }
    } catch (err) {
      Alert.alert("Error", "Check backend connection");
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = async () => {
    if (selectedFoods.length === 0) return;
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const mealData = {
        foods: selectedFoods.map(f => ({
          foodId: f.id,
          name: f.name,
          weight: parseFloat(f.userWeight),
          nutrition: {
            calories: calc(f.nutrition.caloriesKcal, f.userWeight),
            protein: calc(f.nutrition.proteinG, f.userWeight),
            carbs: calc(f.nutrition.carbsG, f.userWeight),
            fat: calc(f.nutrition.fatG, f.userWeight),
          }
        })),
        totalMacros: totals,
        timestamp: new Date().toISOString()
      };

      await axios.post(`${BASE_URL}/save-meal`, mealData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert("Success", "Meal saved to history!", [
        { text: "View History", onPress: () => router.push("/history") },
        { text: "Dismiss", style: "cancel" }
      ]);
    } catch (err) {
      Alert.alert("Save Failed", "Could not connect to server to save meal.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 160 }}>
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
          <Text style={styles.headerTitle}>NutriVision AI</Text>
          <Text style={styles.headerSub}>Scan, Adjust, and Track</Text>
        </LinearGradient>

        {!image ? (
          <View style={styles.uploadRow}>
            <TouchableOpacity style={styles.uploadCard} onPress={() => setCameraOpen(true)}>
              <Ionicons name="camera" size={30} color={COLORS.primary} />
              <Text style={styles.uploadText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.uploadCard}
              onPress={async () => {
                let res = await ImagePicker.launchImageLibraryAsync({
                  quality: 1,
                  allowsEditing: true,
                });
                if (!res.canceled) setImage(res.assets[0]);
              }}
            >
              <Ionicons name="images" size={30} color={COLORS.primary} />
              <Text style={styles.uploadText}>Gallery</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.previewBox}>
            {/* Show Annotated Image if it exists, otherwise show the raw local image */}
            <Image source={{ uri: annotatedImage || image.uri }} style={styles.previewImg} />
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setImage(null);
                  setAnnotatedImage(null);
                  setFoods([]);
                  setSelectedFoods([]);
                }}
              >
                <Text style={{ color: COLORS.danger, fontWeight: "bold" }}>Reset</Text>
              </TouchableOpacity>
              
              {!foods.length && (
                <TouchableOpacity style={styles.scanBtn} onPress={scanFood} disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.btnText}>Start Scan</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {foods.map((item) => {
          const isSelected = selectedFoods.find((f) => f.id === item.id);
          const isAllergic = user?.allergies?.some(
            (a) => a.toLowerCase() === item.name.toLowerCase()
          );

          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.foodCard, isSelected && styles.activeCard]}
              onPress={() => openWeightModal(item)}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.foodName, isAllergic && { color: COLORS.danger }]}>
                  {item.name} {isAllergic && "⚠️"}
                </Text>
                <Text style={styles.foodInfo}>
                  {isSelected ? `${isSelected.userWeight}g` : "100g (default)"} • Tap to edit
                </Text>
              </View>
              <TouchableOpacity onPress={() => toggleSelect(item)} style={styles.checkIcon}>
                <Ionicons
                  name={isSelected ? "checkmark-circle" : "add-circle-outline"}
                  size={32}
                  color={isSelected ? COLORS.primary : "#cbd5e1"}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {selectedFoods.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.macroRow}>
            <Macro val={totals.calories.toFixed(0)} label="Cals" />
            <Macro val={totals.protein.toFixed(1)} label="Prot" />
            <Macro val={totals.carbs.toFixed(1)} label="Carb" />
            <Macro val={totals.fat.toFixed(1)} label="Fat" />
          </View>
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.8 }]}
            onPress={saveToHistory}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Add to History</Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* WEIGHT ADJUST MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ width: "100%" }}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Update Portion</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color={COLORS.muted} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalSub}>{editingFood?.name}</Text>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.weightInput}
                    keyboardType="numeric"
                    value={weightInput}
                    onChangeText={setWeightInput}
                    autoFocus
                    placeholder="0"
                    returnKeyType="done"
                  />
                  <Text style={styles.unit}>grams</Text>
                </View>

                <View style={styles.modalNutritionGrid}>
                  <ModalStat
                    val={editingFood ? calc(editingFood.nutrition.caloriesKcal, weightInput).toFixed(0) : 0}
                    label="Kcal"
                  />
                  <ModalStat
                    val={editingFood ? calc(editingFood.nutrition.proteinG, weightInput).toFixed(1) : "0g"}
                    label="Protein"
                  />
                  <ModalStat
                    val={editingFood ? calc(editingFood.nutrition.carbsG, weightInput).toFixed(1) : "0g"}
                    label="Carbs"
                  />
                  <ModalStat
                    val={editingFood ? calc(editingFood.nutrition.fatG, weightInput).toFixed(1) : "0g"}
                    label="Fat"
                  />
                </View>

                <TouchableOpacity style={styles.modalConfirm} onPress={updateWeight}>
                  <Text style={styles.btnText}>Apply Adjustment</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {cameraOpen && (
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill}>
          <TouchableOpacity style={styles.closeCam} onPress={() => setCameraOpen(false)}>
            <Ionicons name="close-circle" size={40} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shutter}
            onPress={async () => {
              const p = await cameraRef.current.takePictureAsync();
              setImage(p);
              setCameraOpen(false);
            }}
          />
        </CameraView>
      )}
    </View>
  );
}

const Macro = ({ val, label }: any) => (
  <View style={{ alignItems: "center" }}>
    <Text style={styles.macroVal}>{val}</Text>
    <Text style={styles.macroLabel}>{label}</Text>
  </View>
);

const ModalStat = ({ val, label }: any) => (
  <View style={styles.modalStat}>
    <Text style={styles.modalStatVal}>{val}</Text>
    <Text style={styles.modalStatLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 30, paddingTop: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "900" },
  headerSub: { color: "#dcfce7", fontSize: 13 },
  uploadRow: { flexDirection: "row", padding: 20, gap: 15 },
  uploadCard: { flex: 1, backgroundColor: "#fff", padding: 20, borderRadius: 20, alignItems: "center", elevation: 2 },
  uploadText: { marginTop: 8, fontWeight: "600", color: COLORS.text },
  previewBox: { padding: 20 },
  previewImg: { width: "100%", height: 220, borderRadius: 20 },
  btnRow: { flexDirection: "row", marginTop: 12, gap: 10 },
  cancelBtn: { flex: 1, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: COLORS.danger, alignItems: "center" },
  scanBtn: { flex: 2, backgroundColor: COLORS.primary, padding: 15, borderRadius: 12, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "bold" },
  foodCard: { backgroundColor: "#fff", marginHorizontal: 20, marginBottom: 10, padding: 16, borderRadius: 18, flexDirection: "row", alignItems: "center", elevation: 1 },
  activeCard: { borderWidth: 1, borderColor: COLORS.primary, backgroundColor: "#f0fdf4" },
  foodName: { fontSize: 17, fontWeight: "700", color: COLORS.text },
  foodInfo: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  checkIcon: { paddingLeft: 10 },
  footer: { position: "absolute", bottom: 0, width: "100%", backgroundColor: "#fff", padding: 20, borderTopWidth: 1, borderTopColor: "#f1f5f9" },
  macroRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  macroVal: { fontSize: 18, fontWeight: "800", color: COLORS.text },
  macroLabel: { fontSize: 10, color: COLORS.muted, textTransform: "uppercase" },
  saveBtn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 16, alignItems: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingBottom: Platform.OS === "ios" ? 40 : 25,
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  modalTitle: { fontSize: 20, fontWeight: "900", color: COLORS.text },
  modalSub: { color: COLORS.primary, fontWeight: "700", fontSize: 16, marginBottom: 20 },
  inputContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 30, backgroundColor: "#f8fafc", padding: 15, borderRadius: 20 },
  weightInput: { fontSize: 36, fontWeight: "bold", color: COLORS.text, borderBottomWidth: 3, borderBottomColor: COLORS.primary, textAlign: "center", minWidth: 80, paddingHorizontal: 10 },
  unit: { fontSize: 18, marginLeft: 10, color: COLORS.muted, fontWeight: "600" },
  modalNutritionGrid: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30, backgroundColor: "#f0fdf4", padding: 15, borderRadius: 15 },
  modalStat: { alignItems: "center", flex: 1 },
  modalStatVal: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  modalStatLabel: { fontSize: 10, color: COLORS.muted, marginTop: 2 },
  modalConfirm: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 16, alignItems: "center", marginBottom: 10 },
  closeCam: { position: "absolute", top: 50, right: 20 },
  shutter: { position: "absolute", bottom: 50, alignSelf: "center", width: 70, height: 70, borderRadius: 35, backgroundColor: "#fff", borderWidth: 5, borderColor: COLORS.primary },
});