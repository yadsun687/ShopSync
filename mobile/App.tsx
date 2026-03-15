import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./src/context/AuthContext";
import { SyncQueueProvider } from "./src/context/SyncQueueContext";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { AppNavigator } from "./src/navigation/AppNavigator";

const AppContent = () => {
  const { config } = useTheme();
  return (
    <>
      <StatusBar style={config.theme === "dark" ? "light" : "dark"} />
      <AppNavigator />
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SyncQueueProvider>
          <AppContent />
        </SyncQueueProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
