import SettingsIcon from "@mui/icons-material/Settings";
import { Box, Divider, IconButton, Paper, Typography } from "@mui/material";
import OBR from "@owlbear-rodeo/sdk";
import Actions from "./components/Actions.tsx";
import { ID } from "./constants.ts";
import { OBRThemeProvider } from "./theme/OBRThemeProvider.tsx";

function App({ isGM = false }) {
  const openSettings = () => {
    OBR.modal.open({
      id: `${ID}/packs`,
      url: `/packs.html`,
      height: 600,
      width: 500,
    });
  };

  return (
    <OBRThemeProvider>
      <Paper
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          textAlign: "center",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          position="relative"
        >
          <Typography variant="h5" component="h2" sx={{ flexGrow: 1 }}>
            StatBlock
          </Typography>
          {isGM && (
            <IconButton
              size="small"
              onClick={openSettings}
              title="Manage Custom Packs"
              sx={{ position: "absolute", right: 0 }}
            >
              <SettingsIcon />
            </IconButton>
          )}
        </Box>
        <Divider />
        {isGM ? (
          <Actions />
        ) : (
          <Typography variant="body1">
            Only GMs have access to stat blocks
          </Typography>
        )}
      </Paper>
    </OBRThemeProvider>
  );
}

export default App;
