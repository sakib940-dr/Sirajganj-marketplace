import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * সাধারণ পাসওয়ার্ড ইনপুট, কিন্তু চোখ (eye) আইকনে ক্লিক করে পাসওয়ার্ড
 * show/hide করা যায় — আগে সব জায়গায় সবসময় hide করা থাকতো, টাইপো চেক
 * করার কোনো উপায় ছিল না। Register/Login/Password-change — সব রোলের সব
 * পাসওয়ার্ড ফর্মেই এটা ব্যবহার করা হচ্ছে।
 */
const PasswordInput = forwardRef(({ className, ...props }, ref) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input ref={ref} type={visible ? "text" : "password"} className={cn("pr-10", className)} {...props} />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        aria-label={visible ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
