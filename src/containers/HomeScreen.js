import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native";
import scootersData from "../Data/myScooters";
import Card from "../components/Cards";
import Separator from "../components/Separator";
import { useNotification } from "../context/NotificationContext";
import { useFetchWithAuth } from "../hooks/useFetchWithAuth";
import { EXPO_GATEWAY_SERVICE_URL } from "@env";
const CARD_WIDTH = Dimensions.get("window").width * 0.7;
const CARD_HEIGHT = Dimensions.get("window").height * 0.3;
const SPACING_FOR_CARD_INSET = 5;

const HomeScreen = () => {
  const fetchWithAuth = useFetchWithAuth();

  const [scooters, setScooters] = useState([]);
  const { expoPushToken, notification, error } = useNotification();

  useEffect(() => {
    const fetchScooters = async () => {
      try {
        const response = await fetchWithAuth(
          `${EXPO_GATEWAY_SERVICE_URL}/vehicle`, // Remplacez par l'URL de votre API
          {
            method: "GET",
          },
          { protected: true }
        );

        if (!response.ok) {
          setScooters([
            {
              id: new Date().getTime().toString(),
              add: true,
              img: "",
              title: "",
              counter: "",
              maintains: "",
            },
          ]);
          return;
        }

        const data = await response.json();
        console.log("Scooters data:", data);
        const formatted = data?.data.map((item) => ({
          id: item._id,
          add: false,
          img: item.image,
          title: `${item.brand} ${item.model} (${item.year})`,
          counter: item.mileage,
          maintains: "", // À adapter selon tes besoins
        }));
        formatted.push({
          id: new Date().getTime().toString(),
          add: true,
          img: "",
          title: "",
          counter: "",
          maintains: "",
        });
        setScooters(formatted);
      } catch (error) {
        console.error("Erreur lors de la récupération des scooters:", error);
      }
    };
    fetchScooters();
    // const updatedScooters = [
    //   ...scootersData,
    //   {
    //     id: new Date().getTime().toString(),
    //     add: true,
    //     img: "",
    //     title: "",
    //     counter: "",
    //     maintains: "",
    //   },
    // ];
    // setScooters(updatedScooters);
  }, []);

  return (
    <SafeAreaView className="flex mb-[60px]">
      <Text className="mt-4 text-xl text-center font-bold">Ton équipement</Text>
      <Separator />
      <ScrollView
        height={CARD_HEIGHT}
        horizontal
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
      >
        {scooters.map((item, index) => (
          <Card
            key={index}
            cardWidth={CARD_WIDTH}
            add={item.add}
            onClick={() => {}}
          >
            <View
              style={{
                width: "100%",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "5",
                borderRadius: 15,
              }}
            >
              <Image
                source={{ uri: item.img }}
                resizeMode="contain"
                style={[styles.image, { backgroundColor: "transparent" }]}
              />
              <Text style={{ fontSize: 16, fontWeight: "700", top: 3 }}>
                {item.title}
              </Text>
              <View
                style={[styles.row]}
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
                  <Text className="text-center">{item.counter} km</Text>
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
      <Text className="mt-4 text-xl text-center font-bold">
        T'es dernier trajets
      </Text>
      <Separator />
      <View style={{ margin: 16 }}>
        <Text style={{ fontWeight: "bold" }}>Expo Push Token :</Text>
        <Text selectable numberOfLines={1} style={{ fontSize: 12 }}>
          {expoPushToken || "Aucun token"}
        </Text>
        <Text style={{ fontWeight: "bold", marginTop: 8 }}>
          Dernière notification :
        </Text>
        <Text style={{ fontSize: 12 }}>
          {notification
            ? JSON.stringify(notification.request.content, null, 2)
            : "Aucune notification reçue"}
        </Text>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  image: {
    flex: 0.6,
    width: "100%",
  },
  column: {
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default HomeScreen;
