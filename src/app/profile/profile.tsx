import { useState } from 'react';
import { Avatar, Button, Typography } from '@mui/material';

import Navbar from '../../shared/navbar/navbar';
import { useProfile } from '../../hooks/useProfile';

import styles from './profile.module.scss';

interface ProfileTokenResponse {
  apiToken: string;
}

export function Profile() {
  const [apiToken, setApiToken] = useState('********-****-****-****-************');
  const {profile, newProfileToken} = useProfile();

  async function regenerateApiToken() {
    if (!profile) {
      console.error('Cannot regenerate API Token, Profile not found!');
      return;
    }
    try {
      const response: ProfileTokenResponse = await newProfileToken(profile.id).unwrap();
      setApiToken(response?.apiToken);
    } catch (err) {
      console.error('Cannot re-generate API Token');
    }
  }

  return (
    <>
      <Navbar/>
      <div className={styles['profile']}>
        <Typography variant="h2" component="h1" textAlign={'center'}>
          Profile
        </Typography>
        <div className={styles['profile-container']}>
          <Typography variant="h5" component="div" gutterBottom>
            {profile?.github.login}
          </Typography>
          <Typography variant="h5" component="div" gutterBottom>
            {profile?.github.name}
          </Typography>
          <Typography sx={{fontSize: 12}} variant="h5" component="div" gutterBottom>
            {profile?.github.email}
          </Typography>
          <br/>
          <Avatar
            alt="profile"
            src={profile?.github.avatarURL}
            sx={{width: 256, height: 256}}
          />
          <br/>
          <p>{apiToken}</p>
          <Button onClick={regenerateApiToken}>Regenerate APIToken</Button>
        </div>
      </div>
    </>
  );
}

export default Profile;
