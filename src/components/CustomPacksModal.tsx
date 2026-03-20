import DeleteIcon from "@mui/icons-material/Delete";
import UploadIcon from "@mui/icons-material/Upload";
import {
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { addPack, getPacks, type Pack, removePack } from "../utils/idb.ts";

export default function CustomPacksModal() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPacks = useCallback(async () => {
    const loadedPacks = await getPacks();
    setPacks(loadedPacks);
  }, []);

  useEffect(() => {
    loadPacks();
  }, [loadPacks]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await addPack(file);
        await loadPacks();
      } catch (error) {
        console.error("Failed to upload pack:", error);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (packId: string) => {
    try {
      await removePack(packId);
      await loadPacks();
    } catch (error) {
      console.error("Failed to remove pack:", error);
    }
  };

  return (
    <Paper
      sx={{
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Custom Packs</Typography>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => fileInputRef.current?.click()}
          size="small"
        >
          Upload
        </Button>
        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1, overflowY: "auto" }}>
        {packs.length === 0 ? (
          <ListItem>
            <ListItemText primary="No custom packs uploaded." />
          </ListItem>
        ) : (
          packs.map((pack) => (
            <ListItem
              key={pack.id}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(pack.id)}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={pack.name}
                secondary={new Date(pack.importedAt).toLocaleString()}
              />
            </ListItem>
          ))
        )}
      </List>
    </Paper>
  );
}
