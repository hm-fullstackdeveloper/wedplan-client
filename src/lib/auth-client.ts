// এই ফাইলটা আগে একটা fake stub ছিল (সবসময় data: null return করত)।
// এখন আসল Better Auth client-টাই এখান থেকে re-export করা হচ্ছে, যাতে
// Navbar আর Profile page দুটোই একই session দেখতে পায়।
export {
  authClient,
  signIn,
  signUp,
  signOut,
  useSession,
} from "@/app/lib/auth-client";
