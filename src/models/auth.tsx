export interface Auth {
  tokenState: string | null;
  isLogged: () => boolean;
  login: (token: string) => void;
  logout: () => void;
}