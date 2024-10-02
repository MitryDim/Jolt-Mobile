import React from "react";
import { Modal, StyleSheet, Text, Pressable, View } from "react-native";

const ConfirmModal = (props) => {
  return (
    <View style={styles.centeredView}>
      <Modal animationType="slide" transparent={true} visible={props.visible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{props.text}</Text>
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <Pressable
                style={[styles.button, styles.buttonConfirm]}
                onPress={props.onConfirm}
              >
                <Text style={styles.textStyle}>Oui</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={props.onNotConfirm}
              >
                <Text style={styles.textStyle}>Non</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.buttonCancel]}
                onPress={props.onCancel}
              >
                <Text style={styles.textStyle}>Annuler</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 0,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    flex: 1, // Set flex to 1 to distribute equal space
    height: 30,
    margin: 5, // Add margin to create space between buttons
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 40,
  },
  buttonConfirm: {
    backgroundColor: "#1FB900",
  },
  buttonCancel: {
    backgroundColor: "#d61e02",
  },
  buttonClose: {
    backgroundColor: "#d61e02",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});

export default ConfirmModal;
