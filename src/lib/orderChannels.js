// Order System — WhatsApp / Facebook Page / Facebook Messenger এর জন্য চ্যানেল-লিংক তৈরি করে
//
// এখানে ইচ্ছাকৃতভাবে wa.me / m.me / facebook.com এর মতো ক্যানোনিক্যাল https লিংক ব্যবহার
// করা হয়েছে, কোনো কাস্টম URL scheme (whatsapp://, fb://) বা টাইমার-ভিত্তিক "app নাকি browser"
// hack ব্যবহার করা হয়নি। কারণ:
//   - wa.me, m.me, এবং facebook.com — এই তিনটা ডোমেইনই WhatsApp/Meta নিজেরাই iOS Universal
//     Links ও Android App Links হিসেবে রেজিস্টার করে রেখেছে।
//   - তাই মোবাইলে এই লিংকে ক্লিক করলে OS নিজে থেকেই ইনস্টল করা অ্যাপ থাকলে সেটা খুলে দেয়,
//     না থাকলে স্বাভাবিকভাবে ব্রাউজারে (বা ডেস্কটপ ওয়েব ভার্সনে) খুলে যায় — অর্থাৎ ঠিক যা
//     দরকার ("Open installed app if available, otherwise open browser link") এটাই বিল্ট-ইন
//     আচরণ, আলাদা কোনো কোড ছাড়াই।
//   - কাস্টম scheme + setTimeout fallback পদ্ধতি (অনেক পুরনো টিউটোরিয়ালে দেখা যায়) iOS Safari,
//     পপআপ ব্লকার এবং ইন-অ্যাপ ব্রাউজারে (Facebook/Instagram in-app browser) প্রায়ই ব্যর্থ হয় —
//     তাই production-এ এটা এড়ানো হয়েছে।

// ফেসবুক পেজ লিংক থেকে username/ID বের করে (m.me লিংক বানানোর জন্য দরকার)
export function parseFacebookIdentifier(facebookLink) {
  if (!facebookLink) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(facebookLink) ? facebookLink : `https://${facebookLink}`);
    if (!/(^|\.)facebook\.com$|(^|\.)fb\.com$/i.test(url.hostname)) return null;

    const idParam = url.searchParams.get("id");
    if (idParam) return idParam;

    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length === 0) return null;

    const first = segments[0].toLowerCase();
    // এই পাথগুলো কোনো পেজ/প্রোফাইল আইডেন্টিফায়ার না, তাই বাদ দেওয়া হচ্ছে
    const nonPagePaths = ["pages", "groups", "events", "watch", "marketplace", "profile.php", "people"];
    if (nonPagePaths.includes(first)) return null;

    if (first === "pg" && segments[1]) return segments[1];

    return segments[0];
  } catch {
    return null;
  }
}

function buildWhatsappUrl(whatsappNumber, message) {
  const digits = whatsappNumber.replace(/\D/g, "");
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${query}`;
}

function buildMessengerUrl(facebookLink) {
  const id = parseFacebookIdentifier(facebookLink);
  return id ? `https://m.me/${id}` : null;
}

/**
 * দোকানের তথ্য থেকে উপলব্ধ অর্ডার-চ্যানেলগুলোর তালিকা তৈরি করে।
 * কোনো তথ্য না থাকলে (যেমন whatsapp_number খালি) সেই চ্যানেলটা তালিকায় থাকবে না।
 */
export function getOrderChannels(shop, whatsappMessage) {
  const channels = [];

  if (shop?.whatsapp_number) {
    channels.push({
      id: "whatsapp",
      label: "হোয়াটসঅ্যাপে অর্ডার করুন",
      shortLabel: "অর্ডার করুন",
      url: buildWhatsappUrl(shop.whatsapp_number, whatsappMessage),
      colorClass: "bg-[#25D366]",
    });
  }

  if (shop?.facebook_link) {
    channels.push({
      id: "facebook_page",
      label: "ফেসবুক পেজে যোগাযোগ করুন",
      shortLabel: "অর্ডার করুন",
      url: shop.facebook_link,
      colorClass: "bg-[#1877F2]",
    });

    const messengerUrl = buildMessengerUrl(shop.facebook_link);
    if (messengerUrl) {
      channels.push({
        id: "messenger",
        label: "ম্যাসেঞ্জারে অর্ডার করুন",
        shortLabel: "অর্ডার করুন",
        url: messengerUrl,
        colorClass: "bg-[#0084FF]",
      });
    }
  }

  return channels;
}
