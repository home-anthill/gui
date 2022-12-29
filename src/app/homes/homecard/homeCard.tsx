import { PropsWithChildren, useState } from 'react';
import { Card, CardActions, CardContent, Typography, IconButton, Collapse, styled, IconButtonProps } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { Home, Room } from '../../../models/home';

export interface HomeProps {
  home: Home;
  onEdit: (home: Home) => void;
  onDelete: (home: Home) => Promise<void>;
}

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

export function HomeCard(props: PropsWithChildren<HomeProps>) {
  const [expanded, setExpanded] = useState<boolean>(false);

  const ExpandMore = styled((props: ExpandMoreProps) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
  })(({ theme, expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  }));

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card variant="outlined"
          sx={{
            margin: "12px",
            minWidth: "250px"
          }}>
      <CardContent>
        <Typography variant="h5" component="div">
          {props.home.name}
        </Typography>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {props.home.location}
        </Typography>
      </CardContent>
      <CardActions>
        <IconButton aria-label="edit" onClick={() => props.onEdit(props.home)}>
          <EditIcon />
        </IconButton>
        <IconButton aria-label="delete" onClick={() => props.onDelete(props.home)}>
          <DeleteIcon />
        </IconButton>
        {props.home.rooms && props.home.rooms.length > 0 &&
          <ExpandMore
            expand={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show rooms"><ExpandMoreIcon/>
          </ExpandMore>
        }
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          {props.home.rooms && props.home.rooms.map((room: Room) => (
            <Typography paragraph key={room.id}>{room.name} @ {room.floor}</Typography>
          ))}
        </CardContent>
      </Collapse>
    </Card>
  );
}

export default HomeCard;
