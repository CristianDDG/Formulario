export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const digitsOnly = phone.replace(/\D/g, "");
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
}
