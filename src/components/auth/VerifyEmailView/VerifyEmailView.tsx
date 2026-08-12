"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link } from "@/i18n/navigation";
import { ApiError } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { validateEmail, type ValidationKey } from "@/lib/validation";
import cardStyles from "@/components/auth/AuthCard/AuthCard.module.css";
import formStyles from "@/components/auth/AuthForm.module.css";

type Status = "verifying" | "success" | "error";

export default function VerifyEmailView({ token }: { token: string }) {
  const t = useTranslations("VerifyEmail");
  const tAuth = useTranslations("Auth");
  const tValidation = useTranslations("Validation");
  const tErrors = useTranslations("Errors");
  const { verifyEmail, resendVerification } = useAuth();

  const [status, setStatus] = useState<Status>("verifying");
  const [verifyError, setVerifyError] = useState<ApiError | null>(null);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<ValidationKey | undefined>();
  const [resendError, setResendError] = useState<ApiError | null>(null);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");

  useEffect(() => {
    let cancelled = false;

    verifyEmail(token)
      .then(() => {
        if (!cancelled) setStatus("success");
      })
      .catch((error) => {
        if (cancelled) return;
        setStatus("error");
        if (error instanceof ApiError) setVerifyError(error);
      });

    return () => {
      cancelled = true;
    };
    // Runs once per token; verifyEmail is a stable context callback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleResend(event: FormEvent) {
    event.preventDefault();
    const error = validateEmail(email);
    setEmailError(error);
    setResendError(null);
    if (error) return;

    setResendState("sending");
    try {
      await resendVerification(email);
      setResendState("sent");
    } catch (err) {
      setResendState("idle");
      if (err instanceof ApiError) setResendError(err);
    }
  }

  if (status === "verifying") {
    return <p>{t("verifying")}</p>;
  }

  if (status === "success") {
    return (
      <div className={formStyles.successBox}>
        <h1 className={cardStyles.title}>{t("successTitle")}</h1>
        <p>{t("successDescription")}</p>
        <Link href="/login" className={formStyles.submit}>
          {t("loginButton")}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className={cardStyles.title}>{t("errorTitle")}</h1>
      <p className={formStyles.fieldError}>
        {verifyError ? getErrorMessage(tErrors, verifyError) : t("errorTitle")}
      </p>

      {resendState === "sent" ? (
        <p>{t("resendSuccessTitle")} — {t("resendSuccessDescription")}</p>
      ) : (
        <form onSubmit={handleResend} noValidate className={formStyles.form}>
          <p>{t("resendDescription")}</p>
          <div className={formStyles.field}>
            <label htmlFor="resend-email">{tAuth("emailLabel")}</label>
            <input
              id="resend-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={emailError ? formStyles.fieldInvalid : undefined}
            />
            {emailError && <p className={formStyles.fieldError}>{tValidation(emailError)}</p>}
          </div>

          {resendError && (
            <div className={formStyles.formError}>
              <p>{getErrorMessage(tErrors, resendError)}</p>
            </div>
          )}

          <button type="submit" disabled={resendState === "sending"} className={formStyles.submit}>
            {resendState === "sending" ? t("resendSubmitting") : t("resendButton")}
          </button>
        </form>
      )}
    </div>
  );
}
