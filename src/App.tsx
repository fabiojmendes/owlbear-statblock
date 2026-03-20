import { Box, Divider, Typography } from "@mui/material";
import Actions from "./components/Actions.tsx";
import StatBlock from "./components/StatBlock.tsx";

function App({ isGM = false }) {
  if (window.location.pathname === "/statblock") {
    return <StatBlock />;
  }

  return (
    <Box
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        textAlign: "center",
      }}
    >
      <Typography variant="h5" component="h2">
        StatBlock
      </Typography>
      <Divider />
      {isGM ? (
        <Actions />
      ) : (
        <Typography variant="body1">
          Only GMs have access to stat blocks
        </Typography>
      )}
    </Box>
  );
}

export default App;
