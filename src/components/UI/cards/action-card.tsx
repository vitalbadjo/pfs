import { Grid, IconButton, Paper, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { FunctionComponent } from "react";
import { APP_CONSTANTS } from "../../../config/constants";
import { Add } from "@mui/icons-material";

const CardStyled = styled(Paper)(({ theme }) => {
  return {
    backgroundColor: APP_CONSTANTS.styles.colors.cardBackgrounds.gray,
    padding: theme.spacing(1),
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: theme.palette.getContrastText(theme.palette.mode === 'dark' ? '#1A2027' : '#000000'),
    minHeight: "74px",
    maxHeight: "74px",
    minWidth: "180px",
    maxWidth: "240px",
    cursor: "pointer",
    ...theme.typography.body2,
  }
});

type IActionardProps = {
  title?: string
  onClick?: () => void
}

export const ActionCard: FunctionComponent<IActionardProps> = ({ title, onClick }) => {
  return <Grid item>
    <CardStyled variant="outlined" onClick={onClick}>
      <Typography variant="body1">{title}</Typography>
      <Add />
    </CardStyled>
  </Grid>
}