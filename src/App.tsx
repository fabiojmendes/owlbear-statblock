import SettingsIcon from "@mui/icons-material/Settings";
import {
  CardHeader,
  Divider,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import OBR from "@owlbear-rodeo/sdk";
import { useEffect, useState } from "react";
import Actions from "./components/Actions.tsx";
import { ID } from "./constants.ts";
import { useMonsterSync } from "./hooks/useMonsterSync.ts";

function App() {
  const [isGM, setGM] = useState(false);
  useMonsterSync();

  useEffect(() => {
    const getRole = async () => {
      setGM((await OBR.player.getRole()) === "GM");
    };
    getRole();
  }, []);

  const openSettings = () => {
    OBR.modal.open({
      id: `${ID}/packs`,
      url: `/packs`,
      height: 600,
      width: 500,
    });
  };

  return (
    <Paper
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <CardHeader
        sx={{ p: 0 }}
        title="StatBlock"
        slotProps={{
          title: {
            variant: "h6",
            textAlign: "left",
            fontWeight: 600,
            letterSpacing: "0.02em",
          },
        }}
        action={
          isGM && (
            <IconButton
              size="medium"
              onClick={openSettings}
              title="Manage Custom Packs"
            >
              <SettingsIcon />
            </IconButton>
          )
        }
      />
      <Divider variant="fullWidth" sx={{ mb: 1 }} />
      {isGM ? (
        <Actions />
      ) : (
        <Typography variant="body1" textAlign="center">
          Only GMs have access to stat blocks
        </Typography>
      )}
    </Paper>
  );
}

export default App;
