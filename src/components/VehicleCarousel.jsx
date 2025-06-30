import React, { useEffect, useRef, useState } from "react";
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
  showAddCard = false,
  onFavoriteChange, // callback optionnel pour refresh la liste
  scrollToIndex = 0,
}) => {
  const scrollRef = useRef(null);
  const [currentScrollIndex, setCurrentScrollIndex] = useState(0);
  const fetchWithAuth = useFetchWithAuth();

  // Filtrer la card d'ajout si showAddCard est false
  let filteredItems = showAddCard ? items : items.filter((item) => !item.add);
  // Ajoute la card "Ajouter" si showAddCard est true et qu'elle n'est pas déjà présente
  if (showAddCard && !filteredItems.some((item) => item.add)) {
    filteredItems = [
      ...filteredItems,
      {
        id: `add-card-${Date.now()}`,
        add: true,
        img: "",
        title: "",
        mileage: "",
        maintains: "",
        firstPurchaseDate: "",
      },
    ];
  }

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(
      offsetX / (CARD_WIDTH + 2 * SPACING_FOR_CARD_INSET)
    );
    setCurrentScrollIndex(index);
  };

  // Fonction pour mettre en favoris
  const handleFavorite = async (vehicleId) => {
    try {
      const { data, error, success, status } = await fetchWithAuth(
        `${EXPO_GATEWAY_SERVICE_URL}/vehicle/${vehicleId}/favorite`,
        { method: "POST", body: {} },
        { protected: true }
      );

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
  useEffect(() => {
    if (
      scrollRef.current &&
      scrollToIndex >= 0 &&
      scrollToIndex !== currentScrollIndex
    ) {
      scrollRef.current.scrollTo({
        x: scrollToIndex * (CARD_WIDTH + 2 * SPACING_FOR_CARD_INSET),
        animated: true,
      });
      setCurrentScrollIndex(scrollToIndex); // Mets à jour l'index courant pour éviter la boucle
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollToIndex]);

  const renderCard = (item, index = 0) => (
    <Card
      key={index}
      cardWidth={CARD_WIDTH}
      add={item.add}
      onPress={() => {
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
          className="top-4 w-[90%] flex flex-row justify-between space-x-4"
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
              Entretien à faire
            </Text>
            <Text className="text-center">{item.maintains}</Text>
          </View>
        </View>
      </View>
    </Card>
  );

  const renderContent = () => {
    if (filteredItems.length === 1) {
      return (
        <View
          style={{
            height: CARD_HEIGHT,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {renderCard(filteredItems[0])}
        </View>
      );
    }

    return (
      <ScrollView
        ref={scrollRef}
        height={CARD_HEIGHT}
        horizontal
        nestedScrollEnabled={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 2 * SPACING_FOR_CARD_INSET}
        decelerationRate={"fast"}
        snapToAlignment="center"
        pagingEnabled={true}
        contentContainerStyle={{
          height: CARD_HEIGHT,
        }}
        style={{ marginHorizontal: SPACING_FOR_CARD_INSET }}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {filteredItems.map((item, index) => renderCard(item, index))}
      </ScrollView>
    );
  };
  return renderContent();
};

export default VehicleCarousel;
