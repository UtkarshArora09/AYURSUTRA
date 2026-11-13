const strengthLabels = ["Very Weak", "Very Weak", "Weak", "Fair", "Good", "Strong"];

export function getPasswordStrength(password) {
  if (!password) return "";

  const checks = [
    password.length >= 8,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  return strengthLabels[checks.filter(Boolean).length];
}
