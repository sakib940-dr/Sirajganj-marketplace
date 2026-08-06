export const ROLES = {
  VISITOR: "visitor",
  SELLER: "seller",
  SUPER_ADMIN: "super_admin",
};

export const SELLER_STATUS = {
  NONE: "none",
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const SELLER_STATUS_LABEL_BN = {
  [SELLER_STATUS.NONE]: "সেলার নন",
  [SELLER_STATUS.PENDING]: "অনুমোদনের অপেক্ষায়",
  [SELLER_STATUS.APPROVED]: "অনুমোদিত",
  [SELLER_STATUS.REJECTED]: "প্রত্যাখ্যাত",
};
