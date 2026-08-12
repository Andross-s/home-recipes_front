"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import styles from "./VerificationBanner.module.css";

export default function VerificationBanner() {
  const t = useTranslations("VerificationBanner");
  const { user, resendVerification } = useAuth();
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  if (!user || user.isVerified) {
    return null;
  }

  const email = user.email;

  async function handleResend() {
    setState("sending");
    try {
      await resendVerification(email);
      setState("sent");
    } catch {
      setState("idle");
    }
  }

  return (
    <div className={styles.banner} role="status">
      <p className={styles.message}>{t("message")}</p>
      {state === "sent" ? (
        <span className={styles.sent}>{t("resendSuccess")}</span>
      ) : (
        <button
          type="button"
          onClick={handleResend}
          disabled={state === "sending"}
          className={styles.button}
        >
          {t("resendButton")}
        </button>
      )}
    </div>
  );
}
