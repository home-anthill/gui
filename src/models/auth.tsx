export interface Auth {
  tokenState: string | null;
  isLogged: () => boolean;
  login: (token: string) => void;
  logout: () => void;
}

// *****************************************************************
// ********** requests, responses and utility interfaces ***********
// *****************************************************************
export interface LoginResponse {
  loginURL: string;
}
