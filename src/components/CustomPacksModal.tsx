import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import UploadIcon from "@mui/icons-material/Upload";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import OBR from "@owlbear-rodeo/sdk";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ID } from "../constants.ts";
import {
  addPack,
  getPackMonsters,
  getPacks,
  type Pack,
  removePack,
} from "../utils/idb.ts";

export default function CustomPacksModal() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [packMonsters, setPackMonsters] = useState<Record<string, string[]>>(
    {},
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    OBR.modal.close(`${ID}/packs`);
  };

  const loadPacks = useCallback(async () => {
    const loadedPacks = await getPacks();
    setPacks(loadedPacks);
  }, []);

  const loadMonsters = async (packId: string) => {
    if (packMonsters[packId]) return;
    const monsters = await getPackMonsters(packId);
    setPackMonsters((prev) => ({ ...prev, [packId]: monsters }));
  };

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
      <Box sx={{ flexGrow: 1, overflowY: "auto", p: 1 }}>
        {packs.length === 0 ? (
          <Typography
            sx={{ p: 2, textAlign: "center", color: "text.secondary" }}
          >
            No custom packs uploaded.
          </Typography>
        ) : (
          packs.map((pack) => (
            <Accordion
              key={pack.id}
              onChange={(_, expanded) => expanded && loadMonsters(pack.id)}
              variant="outlined"
              sx={{ mb: 1 }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`pack-${pack.id}-content`}
                id={`pack-${pack.id}-header`}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    pr: 1,
                  }}
                >
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {pack.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(pack.importedAt).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={`${pack.monsterCount || 0} monsters`}
                      size="small"
                      variant="outlined"
                    />
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(pack.id);
                      }}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <Divider />
                <List dense sx={{ maxHeight: 200, overflowY: "auto" }}>
                  {packMonsters[pack.id] ? (
                    packMonsters[pack.id].map((name) => (
                      <ListItem key={name}>
                        <ListItemText primary={name} />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText primary="Loading monsters..." />
                    </ListItem>
                  )}
                </List>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Button variant="outlined" fullWidth onClick={handleClose}>
          Close
        </Button>
      </Box>
    </Paper>
  );
}
