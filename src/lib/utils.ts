export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  // Normalize to digits only and validate length (7-15 digits)
  const digitsOnly = phone.replace(/\D/g, "");
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
}
