import axios, { isAxiosError, CanceledError } from "axios";
import { useRouter } from "next/router";
import Cookies from "js-cookie";

const SIGN_IN_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_URL + "/auth/login";
const CSRF_COOKIE_ENDPOINT =
  process.env.NEXT_PUBLIC_BACKEND_URL + "/csrf-cookie";

const useSignInAction = () => {
  const router = useRouter();

  // Helper: fetch CSRF cookie dan ambil token
  const getCsrfToken = async () => {
    await axios.get(CSRF_COOKIE_ENDPOINT, { withCredentials: true });
    // dapatkan nilai dari cookie CSRF-TOKEN
    return Cookies.get("CSRF-TOKEN");
  };

  const signIn = async () => {
    try {
      // 1. Ambil CSRF token
      const csrfToken = await getCsrfToken();
      if (!csrfToken) throw new Error("CSRF token tidak ditemukan");
      // 2. POST login
      const res = await axios.post(
        SIGN_IN_ENDPOINT,
        {},
        {
          withCredentials: true,
          headers: {
            "X-CSRF-TOKEN": csrfToken,
          },
        }
      );
      // 3. Redirect ke URL login SSO
      if (res.data && res.data.data) {
        router.push(res.data.data);
      } else {
        throw new Error("Login URL tidak ditemukan pada response");
      }
    } catch (e) {
      if (!isAxiosError(e) && !(e instanceof CanceledError)) throw e;
      alert("Gagal login SSO");
    }
  };

  return { getCsrfToken, signIn };
};

export { useSignInAction };
