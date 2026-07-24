"use client";

import { Field, btnPrimary, inputClass } from "@/components/ui";
import { useSiteConfig } from "@/lib/site-config-provider";
import { useEffect, useState } from "react";

type Props = {
  /** Called after credentials are saved (for page-specific flash messages). */
  onSaved?: (message: string) => void;
  /** Extra note under the form (e.g. redeploy reminder). */
  note?: string;
  /** Require current password before allowing a change (headmaster portal). */
  requireCurrentPassword?: boolean;
};

export function HeadmasterCredentialsForm({
  onSaved,
  note,
  requireCurrentPassword = false,
}: Props) {
  const { config, setSiteConfig, savePreview } = useSiteConfig();
  const [username, setUsername] = useState(config.headmasterUser);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setUsername(config.headmasterUser);
  }, [config.headmasterUser]);

  function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const nextUser = username.trim();
    if (!nextUser) {
      setError("Username is required.");
      return;
    }

    if (requireCurrentPassword) {
      if (currentPassword !== config.headmasterPassword) {
        setError("Current password is incorrect.");
        return;
      }
    }

    const changingPassword = newPassword.length > 0 || confirmPassword.length > 0;
    if (changingPassword) {
      if (newPassword.length < 6) {
        setError("New password must be at least 6 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("New password and confirmation do not match.");
        return;
      }
    } else if (
      nextUser === config.headmasterUser &&
      !requireCurrentPassword
    ) {
      setError("Enter a new password, or change the username.");
      return;
    } else if (!changingPassword && nextUser === config.headmasterUser) {
      setError("Nothing to update. Change the username or set a new password.");
      return;
    }

    const next = {
      ...config,
      headmasterUser: nextUser,
      headmasterPassword: changingPassword
        ? newPassword
        : config.headmasterPassword,
    };
    setSiteConfig(next);
    savePreview(next);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    onSaved?.(
      changingPassword
        ? "Headmaster credentials updated for this browser. Download school.json and redeploy so it applies for everyone."
        : "Headmaster username updated for this browser. Download school.json and redeploy so it applies for everyone."
    );
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <Field label="Username">
        <input
          className={inputClass}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />
      </Field>
      {requireCurrentPassword ? (
        <Field label="Current password">
          <input
            type="password"
            className={inputClass}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </Field>
      ) : null}
      <Field label="New password">
        <input
          type="password"
          className={inputClass}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          placeholder="Leave blank to keep current password"
        />
      </Field>
      <Field label="Confirm new password">
        <input
          type="password"
          className={inputClass}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          placeholder="Leave blank to keep current password"
        />
      </Field>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {note ? <p className="text-sm text-clay">{note}</p> : null}
      <button type="submit" className={btnPrimary}>
        Save credentials
      </button>
    </form>
  );
}
