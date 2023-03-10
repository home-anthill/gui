export interface Github {
  login: string;
  name: string;
  email: string;
  avatarURL: string
}

export interface Profile {
  id: string;
  github: Github;
}

// *****************************************************************
// ********** requests, responses and utility interfaces ***********
// *****************************************************************
export interface ProfileTokenResponse {
  apiToken: string;
}
