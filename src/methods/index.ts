export function generateVerificationCode(length = 6) {
  return Math.random()
    .toString()
    .replace('0.', '')
    .slice(0, length)
}