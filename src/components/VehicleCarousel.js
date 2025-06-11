import React, { useRef } from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  Alert,
} from "react-native";
import Card from "./Cards";
import { useFetchWithAuth } from "../hooks/useFetchWithAuth"; // Ajoute ce hook
import { EXPO_GATEWAY_SERVICE_URL } from "@env";
const CARD_WIDTH = Dimensions.get("window").width * 0.7;
const CARD_HEIGHT = Dimensions.get("window").height * 0.3;
const SPACING_FOR_CARD_INSET = 5;

const VehicleCarousel = ({
  items,
  onCardPress,
  onAddPress,
  onMomentumScrollEnd,
  styles,
  navigation,
  showAddCard = true,
  onFavoriteChange, // callback optionnel pour refresh la liste
}) => {
  const scrollRef = useRef(null);
  const fetchWithAuth = useFetchWithAuth();

  // Filtrer la card d'ajout si showAddCard est false
  const filteredItems = showAddCard ? items : items.filter((item) => !item.add);

  // Fonction pour mettre en favoris
  const handleFavorite = async (vehicleId) => {
    try {
      const { data, error, success } = await fetchWithAuth(
        `${EXPO_GATEWAY_SERVICE_URL}/vehicle/${vehicleId}/favorite`,
        { method: "POST" },
        { protected: true }
      );
      console.log("Mise en favoris réussie :", data, error);
      if (error) {
        console.error("Erreur lors de la mise en favoris :", error);
        Alert.alert(
          "Erreur",
          "Impossible de mettre ce véhicule en favoris. Veuillez réessayer plus tard."
        );
        return;
      }
      if (onFavoriteChange) onFavoriteChange(); // Pour rafraîchir la liste si besoin
    } catch (e) {
      console.error("Erreur lors de la mise en favoris :", e);
      // Gère l'erreur si besoin
    }
  };

  return (
    <ScrollView
      ref={scrollRef}
      height={CARD_HEIGHT}
      horizontal
      nestedScrollEnabled={true}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      snapToInterval={CARD_WIDTH}
      decelerationRate={"fast"}
      snapToAlignment="center"
      pagingEnabled={true}
      contentInset={{
        top: 0,
        left: SPACING_FOR_CARD_INSET,
        bottom: 0,
        right: SPACING_FOR_CARD_INSET,
      }}
      contentContainerStyle={{ height: CARD_HEIGHT }}
      onMomentumScrollEnd={onMomentumScrollEnd}
    >
      {filteredItems.map((item, index) => (
        <Card
          key={index}
          cardWidth={CARD_WIDTH}
          add={item.add}
          onClick={() => {
            if (item.add) {
              onAddPress ? onAddPress() : navigation?.navigate("AddVehicle");
            } else {
              onCardPress ? onCardPress(item) : null;
            }
          }}
        >
          <View
            style={{
              width: "100%",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 5,
              borderRadius: 15,
            }}
          >
            {/* Bouton favoris */}
            {!item.add && (
              <TouchableOpacity
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  zIndex: 2,
                }}
                onPress={() => handleFavorite(item.id)}
              >
                <Text style={{ fontSize: 26 }}>
                  {item.isFavorite ? "❤️" : "🤍"}
                </Text>
              </TouchableOpacity>
            )}
            <Image
              source={{ uri: item.img }}
              resizeMode="contain"
              style={[styles?.image, { backgroundColor: "transparent" }]}
            />
            <Text style={{ fontSize: 16, fontWeight: "700", top: 3 }}>
              {item.title}
            </Text>
            <View
              style={[styles?.row]}
              className="top-4 w-[90%] flex justify-between space-x-4"
            >
              <View>
                <Text
                  className="font-semibold text-start"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  Compteur
                </Text>
                <Text className="text-center">{item.mileage} km</Text>
              </View>
              <View>
                <Text
                  className="font-semibold text-end"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  Entretient à faire
                </Text>
                <Text className="text-center">{item.maintains}</Text>
              </View>
            </View>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
};

export default VehicleCarousel;
