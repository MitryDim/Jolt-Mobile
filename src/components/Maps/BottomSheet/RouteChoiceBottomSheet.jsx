import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable, Switch } from "react-native";
import BottomSheet from "./BottomSheet";

export default function RouteChoiceBottomSheet({
  isOpen,
  toggleSheet,
  onSelect,
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [stepEnabled, setStepEnabled] = useState(false);

  const handleConfirm = () => {
    if (selectedOption) {
      onSelect(selectedOption, stepEnabled);
      toggleSheet();
    }
  };

  return (
    <BottomSheet isOpen={isOpen} toggleSheet={toggleSheet}>
      <Text style={styles.title}>Choisissez l'itinéraire :</Text>

      <View style={styles.radioContainer}>
        <Pressable
          style={styles.radioOption}
          onPress={() => setSelectedOption("complete")}
        >
          <View
            style={[
              styles.radioCircle,
              selectedOption === "complete" && styles.selectedCircle,
            ]}
          />
          <Text style={styles.radioText}>Itinéraire complet</Text>
        </Pressable>

        <Pressable
          style={styles.radioOption}
          onPress={() => setSelectedOption("destination")}
        >
          <View
            style={[
              styles.radioCircle,
              selectedOption === "destination" && styles.selectedCircle,
            ]}
          />
          <Text style={styles.radioText}>Destination uniquement</Text>
        </Pressable>
      </View>

      {/* Si l'utilisateur choisit "complet", afficher le switch */}
      {selectedOption === "complete" && (
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Naviguer par étape</Text>
          <Switch
            value={stepEnabled}
            onValueChange={setStepEnabled}
            thumbColor={stepEnabled ? "#2196F3" : "#f4f3f4"}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
          />
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Pressable
          style={[
            styles.confirmButton,
            { backgroundColor: selectedOption ? "#4CAF50" : "#9E9E9E" },
          ]}
          onPress={handleConfirm}
          disabled={!selectedOption}
        >
          <Text style={styles.buttonText}>Valider</Text>
        </Pressable>

        <Pressable
          style={[styles.confirmButton, { backgroundColor: "#f44336" }]}
          onPress={toggleSheet}
        >
          <Text style={styles.buttonText}>Annuler</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  radioContainer: {
    marginBottom: 20,
    gap: 10,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  radioCircle: {
    height: 22,
    width: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#2196F3",
  },
  selectedCircle: {
    backgroundColor: "#2196F3",
  },
  radioText: {
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  buttonContainer: {
    gap: 10,
  },
  confirmButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "500",
  },
});
