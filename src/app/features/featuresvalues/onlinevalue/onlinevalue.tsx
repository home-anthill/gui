import { Typography } from '@mui/material';

import { useOnline } from '../../../../hooks/useOnline';
import { getPrettyDateFromUnixEpoch } from '../../../../utils/dateUtils';

import styles from './onlinevalue.module.scss';

interface OnlineProps {
  id: string;
}

export default function OnlineValue(props: OnlineProps) {
  const { online, loading, onlineError } = useOnline(props.id);

  function isOffline(modifiedAtISO: string, currentTimeISO: string): boolean {
    const modDate = new Date(modifiedAtISO);
    const currentDate = new Date(currentTimeISO);
    return modDate.getTime() < currentDate.getTime() - 60 * 1000;
  }

  return (
    <div className={styles['online-value-container']}>
      {onlineError ? (
        <div className="error">Cannot check if online</div>
      ) : loading ? (
        <div className="loading">Loading...</div>
      ) : isOffline(online.modifiedAt, online.currentTime) ? (
        <div className={styles['online-value']}>
          <div className={styles['offline']}></div>
          <Typography
            sx={{ fontSize: 24, margin: 0 }}
            color="text.secondary"
            gutterBottom
          >
            &nbsp;Offline
          </Typography>
        </div>
      ) : (
        <div className={styles['online-value']}>
          <div className={styles['online']}></div>
          <Typography
            sx={{ fontSize: 24, margin: 0 }}
            color="text.secondary"
            gutterBottom
          >
            &nbsp;Online
          </Typography>
        </div>
      )}
      {online.modifiedAt && (
        <div className={styles['last-seen-online']}>
          <Typography sx={{ fontSize: 12 }} color="text.secondary" gutterBottom>
            {getPrettyDateFromUnixEpoch(new Date(online.modifiedAt).getTime())}
          </Typography>
        </div>
      )}
    </div>
  );
}
