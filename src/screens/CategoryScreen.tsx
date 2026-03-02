import { View, StyleSheet } from "react-native";
import AppText from "../components/ui/AppText";
import { theme } from "../theme/theme";
import AppHeader from "../components/ui/AppHeader";
import { useNavigation } from "@react-navigation/native";

export default function CategoryScreen({ route }: any) {
  const { categoryId } = route.params;

  const navigation = useNavigation();

  return (
    <>
      <AppHeader
        title="Category"
        onBack={() => navigation.goBack()}
      />
    <View style={styles.container}>
      <AppText style={styles.title}>
        {categoryId.toUpperCase()}
      </AppText>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    ...theme.typography.title,
  },
});
