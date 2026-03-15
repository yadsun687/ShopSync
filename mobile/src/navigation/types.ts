export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  AppTabs: undefined;
  ProductReviews: { productId: string; productName?: string };
};

export type AppTabParamList = {
  Dashboard: undefined;
  Inventory: undefined;
  Users: undefined;
  Orders: undefined;
  Sellers: undefined;
  Tasks: undefined;
  AddProduct: undefined;
  Settings: undefined;
};
