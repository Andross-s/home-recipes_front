"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link, useRouter } from "@/i18n/navigation";
import { ApiError } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { useGoogleSignInBridge } from "@/hooks/useGoogleSignInBridge";
import { validateEmail, validateRequiredPassword, type ValidationKey } from "@/lib/validation";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton/GoogleSignInButton";
import styles from "@/components/auth/AuthForm.module.css";

interface FieldErrors {
  email?: ValidationKey;
  password?: ValidationKey;
}

export default function LoginForm() {
  const t = useTranslations("Auth");
  const tValidation = useTranslations("Validation");
  const tErrors = useTranslations("Errors");
  const router = useRouter();
  const { login, resendVerification } = useAuth();
  const { error: googleError, isExchanging } = useGoogleSignInBridge();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<ApiError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const errors: FieldErrors = {
      email: validateEmail(email),
      password: validateRequiredPassword(password),
    };
    setFieldErrors(errors);
    setFormError(null);
    setResendState("idle");
    if (errors.email || errors.password) return;

    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    setResendState("sending");
    try {
      await resendVerification(email);
      setResendState("sent");
    } catch {
      setResendState("idle");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="login-email">{t("emailLabel")}</label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={fieldErrors.email ? styles.fieldInvalid : undefined}
        />
        {fieldErrors.email && <p className={styles.fieldError}>{tValidation(fieldErrors.email)}</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor="login-password">{t("passwordLabel")}</label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={fieldErrors.password ? styles.fieldInvalid : undefined}
        />
        {fieldErrors.password && (
          <p className={styles.fieldError}>{tValidation(fieldErrors.password)}</p>
        )}
      </div>

      {formError && (
        <div className={styles.formError}>
          <p>{getErrorMessage(tErrors, formError)}</p>
          {formError.errorCode === "ACCOUNT_NOT_VERIFIED" &&
            (resendState === "sent" ? (
              <p>{t("resendVerificationSuccess")}</p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendState === "sending"}
                className={styles.inlineButton}
              >
                {t("resendVerificationLink")}
              </button>
            ))}
        </div>
      )}

      <button type="submit" disabled={isSubmitting} className={styles.submit}>
        {isSubmitting ? t("loginSubmitting") : t("loginSubmit")}
      </button>

      <div className={styles.divider}>{t("orDivider")}</div>

      {googleError && (
        <div className={styles.formError}>
          <p>{getErrorMessage(tErrors, googleError)}</p>
        </div>
      )}
      <GoogleSignInButton disabled={isExchanging} />

      <p className={styles.switch}>
        {t("noAccount")} <Link href="/register">{t("registerLink")}</Link>
      </p>
    </form>
  );
}
