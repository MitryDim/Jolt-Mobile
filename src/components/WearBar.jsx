import { Text, View } from "react-native";

 function WearBar({ percent }) {
    const colors = ["#00cc44", "#ffaa00", "#ff3333"];
    const rectWidth = 30;
    const totalWidth = rectWidth * colors.length;

    const clampedPercent = Math.max(0, Math.min(100, percent));

    // pourcentage couvert par un rectangle
    const percentPerRect = 100 / colors.length;

    return (
      <View
        style={{ alignItems: "center", marginVertical: 8, width: totalWidth }}
      >
        {/* Flèche */}
        <View style={{ height: 22, width: "100%", position: "relative" }}>
          <Text
            style={{
              position: "absolute",
              left: (clampedPercent / 100) * totalWidth - 10,
              fontSize: 20,
              zIndex: 1,
              width: 20,
              textAlign: "center",
            }}
          >
            ▼
          </Text>
        </View>

        {/* Rectangles avec remplissage */}
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          {colors.map((color, i) => {
            // Pourcentage atteint dans ce rectangle
            const minPercent = i * percentPerRect;
            const maxPercent = (i + 1) * percentPerRect;

            let fillPercent = 0;
            if (clampedPercent >= maxPercent) {
              fillPercent = 100;
            } else if (clampedPercent > minPercent) {
              fillPercent =
                ((clampedPercent - minPercent) / percentPerRect) * 100;
            }

            return (
              <View
                key={i}
                style={{
                  width: rectWidth,
                  height: 18,
                  backgroundColor: "#ccc",
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: "#999",
                  overflow: "hidden",
                  marginHorizontal: 0,
                }}
              >
                <View
                  style={{
                    width: `${fillPercent}%`,
                    height: "100%",
                    backgroundColor: color,
                  }}
                />
              </View>
            );
          })}
        </View>

        {/* Texte du pourcentage */}
        <Text style={{ marginTop: 6, fontWeight: "bold" }}>
          {Math.round(clampedPercent)} %
        </Text>
      </View>
    );
  }
export default WearBar;