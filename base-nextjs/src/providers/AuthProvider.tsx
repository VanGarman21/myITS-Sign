import { getAuthService } from "@/services/GetAuth";
import { AuthContextType, AuthStatus } from "@/types/auth";
import { ReactNode, createContext, useEffect, useState } from "react";
import useSWRImmutable from "swr/immutable";

const authContextDefault: AuthContextType = {
  status: "validating",
  hasAccess: false,
};

const AuthContext = createContext<AuthContextType>(authContextDefault);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: auth } = useSWRImmutable("auth", getAuthService, {
    refreshInterval: 60000,
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const [status, setStatus] = useState<AuthStatus>("validating");
  const [hasAccess, setHasAccess] = useState<boolean>(false);

  useEffect(() => {
    if (auth?.status != null) {
      setStatus(auth?.status);
      setHasAccess(true);

      // if (
      //     (
      //         auth?.group?.length
      //         && auth?.group?.length > 0
      //         && auth?.group?.some((item: string) => authorizedGroup.includes(item))
      //     ) || (
      //         auth?.role?.length
      //         && auth?.role?.length > 0
      //     )
      // ) {
      //     setHasAccess(true)
      // } else {
      //     setHasAccess(false)
      // }
    }
  }, [auth]);

  return (
    <AuthContext.Provider
      value={{
        status,
        hasAccess,
        user: auth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
