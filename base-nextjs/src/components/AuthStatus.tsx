import React, { useEffect, useState } from "react";
import { loginSSO, getUser } from "../utils/auth";

const AuthStatus = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getUser().then(setUser);
  }, []);

  if (!user) {
    return (
      <button
        onClick={loginSSO}
        style={{
          padding: 8,
          borderRadius: 4,
          background: "#2563eb",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        Login dengan Microsoft SSO
      </button>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <img
        src={user.picture}
        alt="profile"
        width={40}
        style={{ borderRadius: "50%" }}
      />
      <div>
        <div style={{ fontWeight: "bold" }}>{user.name}</div>
        <div style={{ fontSize: 12, color: "#666" }}>{user.email}</div>
      </div>
    </div>
  );
};

export default AuthStatus;
