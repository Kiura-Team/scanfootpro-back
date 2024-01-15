export const randomNumber = (len: number): number => {
  return Math.floor(Math.random() * (Math.pow(10, len) - 1 + 1)) + 1;
};
