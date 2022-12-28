// token name used in local storage
export const TOKEN_NAME = 'token';

export function isLoggedIn(tokenName: string = TOKEN_NAME): boolean {
  return !!localStorage.getItem(tokenName);
}

export function getToken(tokenName: string = TOKEN_NAME): string | null {
  return localStorage.getItem(tokenName);
}

export function setToken(token: string, tokenName: string = TOKEN_NAME): void {
  localStorage.setItem(tokenName, token);
}

export function removeToken(tokenName: string = TOKEN_NAME): void {
  localStorage.removeItem(tokenName);
}
