import { Text, TextProps } from "react-native";
import { theme } from "../../theme/theme";

export default function AppText(props: TextProps) {
  return (
    <Text
      {...props}
      style={[
        { color: theme.colors.primary, ...theme.typography.body },
        props.style,
      ]}
    />
  );
}
