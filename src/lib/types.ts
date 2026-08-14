export type ProductKind = "physical" | "script" | "music" | "software";

export type Money = {
  amount: string;
  currencyCode: string;
};

export type ProductImage = {
  url: string;
  altText: string;
  width: number;
  height: number;
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  requiresShipping: boolean;
  price: Money;
  compareAtPrice?: Money;
  selectedOptions: Array<{ name: string; value: string }>;
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  shortDescription: string;
  kind: ProductKind;
  vendor: string;
  tags: string[];
  image?: ProductImage;
  variants: ProductVariant[];
  deliveryNote: string;
  unitPrice?: string;
  lowestPrice30Days?: string;
  highlights: string[];
  license?: string;
  fileDetails?: string;
  systemRequirements?: string;
  manufacturer?: {
    name: string;
    address: string;
    email: string;
  };
  safetyInformation?: string;
};

export type CartLine = {
  variantId: string;
  handle: string;
  title: string;
  variantTitle: string;
  kind: ProductKind;
  quantity: number;
  price: Money;
};

export type CheckoutConsent = {
  termsAccepted: boolean;
  digitalSupplyConsent: boolean;
  digitalWithdrawalAcknowledged: boolean;
};
