import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const USER_KEY = "shopsync_user";
const THEME_KEY = "shopsync_theme";
const TOKEN_KEY = "shopsync_token";

const safeParse = (raw: string | null) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const saveUser = async (user: unknown) => {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = async () => {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return safeParse(raw);
};

export const clearUser = async () => {
  await AsyncStorage.removeItem(USER_KEY);
};

export const saveTheme = async (theme: unknown) => {
  await AsyncStorage.setItem(THEME_KEY, JSON.stringify(theme));
};

export const getTheme = async () => {
  const raw = await AsyncStorage.getItem(THEME_KEY);
  return safeParse(raw);
};

export const saveCache = async (key: string, value: unknown) => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
};

export const getCache = async <T = unknown>(key: string): Promise<T | null> => {
  const raw = await AsyncStorage.getItem(key);
  return safeParse(raw) as T | null;
};

export const saveToken = async (token: string) => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

export const getToken = async () => {
  return SecureStore.getItemAsync(TOKEN_KEY);
};

export const clearToken = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};
