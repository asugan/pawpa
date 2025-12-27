const Purchases = {
  isConfigured: async () => true,
  getOfferings: async () => null,
  getCustomerInfo: async () => null,
  purchasePackage: async () => ({ customerInfo: null }),
  PURCHASES_ERROR_CODE: {
    PURCHASE_CANCELLED_ERROR: 'PURCHASE_CANCELLED_ERROR',
    PRODUCT_ALREADY_PURCHASED_ERROR: 'PRODUCT_ALREADY_PURCHASED_ERROR',
  },
};

export default Purchases;
