import axios, { isAxiosError, CanceledError } from "axios"
import { useRouter } from "next/router"

const SIGN_OUT_ENDPOINT = (process.env.NEXT_PUBLIC_BACKEND_URL) + "/auth/logout"

const useSignOutAction = () => {
    const router = useRouter()

    const signOut = async () => {
        const signOutUrl = await axios
            .delete(SIGN_OUT_ENDPOINT, {
                withCredentials: true,
                xsrfCookieName: 'CSRF-TOKEN',
                xsrfHeaderName: 'X-CSRF-TOKEN',
                withXSRFToken: true,
            })
            .then((res) => res.data)
            .catch((e) => {
                if (!isAxiosError(e) && !(e instanceof CanceledError)) throw e
            })

        signOutUrl && router.push(signOutUrl.data)
    }

    return { signOut }
}

export { useSignOutAction }