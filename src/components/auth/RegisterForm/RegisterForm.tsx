"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link } from "@/i18n/navigation";
import { ApiError } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { validateEmail, validateName, validateNewPassword, type ValidationKey } from "@/lib/validation";
import styles from "@/components/auth/AuthForm.module.css";

interface FieldErrors {
  name?: ValidationKey;
  email?: ValidationKey;
  password?: ValidationKey;
}

export default function RegisterForm() {
  const t = useTranslations("Auth");
  const tValidation = useTranslations("Validation");
  const tErrors = useTranslations("Errors");
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<ApiError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const errors: FieldErrors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validateNewPassword(password),
    };
    setFieldErrors(errors);
    setFormError(null);
    if (errors.name || errors.email || errors.password) return;

    setIsSubmitting(true);
    try {
      await register(name.trim(), email, password);
      setRegisteredEmail(email);
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (registeredEmail) {
    return (
      <div className={styles.successBox}>
        <p>{t("registerSuccessDescription", { email: registeredEmail })}</p>
        <Link href="/login" className={styles.submit}>
          {t("backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="register-name">{t("nameLabel")}</label>
        <input
          id="register-name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={fieldErrors.name ? styles.fieldInvalid : undefined}
        />
        {fieldErrors.name && <p className={styles.fieldError}>{tValidation(fieldErrors.name)}</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor="register-email">{t("emailLabel")}</label>
        <input
          id="register-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={fieldErrors.email ? styles.fieldInvalid : undefined}
        />
        {fieldErrors.email && <p className={styles.fieldError}>{tValidation(fieldErrors.email)}</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor="register-password">{t("passwordLabel")}</label>
        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
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
        </div>
      )}

      <button type="submit" disabled={isSubmitting} className={styles.submit}>
        {isSubmitting ? t("registerSubmitting") : t("registerSubmit")}
      </button>

      <p className={styles.switch}>
        {t("haveAccount")} <Link href="/login">{t("loginLink")}</Link>
      </p>
    </form>
  );
}
