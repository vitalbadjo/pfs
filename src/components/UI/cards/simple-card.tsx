import { Grid, Paper, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { FunctionComponent, PropsWithChildren } from "react";
import { APP_CONSTANTS } from "../../../config/constants";

const CardStyled = styled(Paper)(({ theme }) => {
  return {
    backgroundColor: APP_CONSTANTS.styles.colors.cardBackgrounds.gray,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.getContrastText(theme.palette.mode === 'dark' ? '#1A2027' : '#000000'),
    minHeight: "74px",
    maxHeight: "74px",
    minWidth: "180px",
    maxWidth: "240px",
    cursor: "pointer",
    ...theme.typography.body2,
  }
});

type ISimpleCardProps = {
  title?: string
  desc?: string
  background?: keyof typeof APP_CONSTANTS.styles.colors.cardBackgrounds
  key: string
  onClick?: () => void
}

export const SimpleCard: FunctionComponent<PropsWithChildren & ISimpleCardProps> = ({ children, key, title, desc, background, onClick }) => {
  return <Grid item key={key}>
    <CardStyled variant="outlined" onClick={onClick} style={{ backgroundColor: APP_CONSTANTS.styles.colors.cardBackgrounds[background || "violet"] }}>
      <Typography variant="h6">{title}</Typography>
      <Typography >{desc}</Typography>
      {children || null}
    </CardStyled>
  </Grid>
}