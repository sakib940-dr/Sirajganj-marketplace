export const ROLES = {
  VISITOR: "visitor",
  SELLER: "seller",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
};

export const ROLE_LABEL_BN = {
  [ROLES.VISITOR]: "ভিজিটর",
  [ROLES.SELLER]: "সেলার",
  [ROLES.ADMIN]: "অ্যাডমিন",
  [ROLES.SUPER_ADMIN]: "সুপার অ্যাডমিন",
};

export const ACCOUNT_STATUS = {
  ACTIVE: "active",
  BANNED: "banned",
};

export const ACCOUNT_STATUS_LABEL_BN = {
  [ACCOUNT_STATUS.ACTIVE]: "সক্রিয়",
  [ACCOUNT_STATUS.BANNED]: "ব্যান করা হয়েছে",
};

// role hierarchy — Admin Panel অ্যাক্সেসের জন্য ব্যবহৃত হয়
export function isAdminOrAbove(role) {
  return role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;
}

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

export const VERIFICATION_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const VERIFICATION_STATUS_LABEL_BN = {
  [VERIFICATION_STATUS.PENDING]: "পর্যালোচনাধীন",
  [VERIFICATION_STATUS.APPROVED]: "ভেরিফাইড",
  [VERIFICATION_STATUS.REJECTED]: "প্রত্যাখ্যাত",
};
