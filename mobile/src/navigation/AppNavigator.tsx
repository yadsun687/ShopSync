import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ActivityIndicator, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { InventoryScreen } from "../screens/InventoryScreen";
import { UsersScreen } from "../screens/UsersScreen";
import { OrdersScreen } from "../screens/OrdersScreen";
import { SellersScreen } from "../screens/SellersScreen";
import { TaskQueueScreen } from "../screens/TaskQueueScreen";
import { AddProductScreen } from "../screens/AddProductScreen";
import { ProductReviewsScreen } from "../screens/ProductReviewsScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { RoleGate } from "../components/RoleGate";
import type { AppTabParamList, RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<AppTabParamList>();

const AppTabs = () => {
  const { colors } = useTheme();
  return (
    <Tabs.Navigator screenOptions={{
      headerStyle: { backgroundColor: colors.card },
      headerTintColor: colors.text,
      tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.muted,
    }}>
      <Tabs.Screen name="Dashboard" component={DashboardScreen} />
      <Tabs.Screen name="Inventory" children={() => (
        <RoleGate allow={["admin", "editor"]}><InventoryScreen /></RoleGate>
      )} />
      <Tabs.Screen name="Users" children={() => (
        <RoleGate allow={["admin"]}><UsersScreen /></RoleGate>
      )} />
      <Tabs.Screen name="Orders" component={OrdersScreen} />
      <Tabs.Screen name="Sellers" component={SellersScreen} />
      <Tabs.Screen name="Tasks" children={() => (
        <RoleGate allow={["admin"]}><TaskQueueScreen /></RoleGate>
      )} />
      <Tabs.Screen name="AddProduct" children={() => (
        <RoleGate allow={["admin", "editor"]}><AddProductScreen /></RoleGate>
      )} />
      <Tabs.Screen name="Settings" component={SettingsScreen} />
    </Tabs.Navigator>
  );
};

export const AppNavigator = () => {
  const { user, isLoading } = useAuth();
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={{
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: colors.background,
        card: colors.card,
        text: colors.text,
        primary: colors.primary,
        border: colors.border,
      },
    }}>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.text }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Register" }} />
          </>
        ) : (
          <>
            <Stack.Screen name="AppTabs" component={AppTabs} options={{ headerShown: false }} />
            <Stack.Screen
              name="ProductReviews"
              component={ProductReviewsScreen}
              options={({ route }) => ({ title: route.params.productName || "Product Reviews" })}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
