export function generateUniqueSavingsId(): string {
  const min = 100000;
  const max = 999999;
  
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

export function generateUniqueAccountNumber(): string {
  const min = 1000000000;
  const max = 9999999999;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}