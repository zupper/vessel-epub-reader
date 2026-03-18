import React, { useState } from "react";
import {
  CircularProgress,
  Box,
  Slider,
  Button,
  TextField,
  Typography,
} from "@mui/material";

type GenericONNXSettingsViewProps = {
  modelUrl?: string;
  speed?: string;
  onChange: (pairs: { key: string; value: string }[]) => boolean;
};

export const GenericONNXSettingsView = ({
  modelUrl = "",
  speed = "1.0",
  onChange,
}: GenericONNXSettingsViewProps) => {
  const [downloading, setDownloading] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [localModelUrl, setLocalModelUrl] = useState(modelUrl);
  const [localSpeed, setLocalSpeed] = useState(parseFloat(speed));
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!localModelUrl.trim()) {
      setError("Please enter a model URL");
      return;
    }

    setDownloading(true);
    setError(null);
    try {
      const { pipeline } = await import("@huggingface/transformers");
      await pipeline("text-to-speech", localModelUrl);
      setModelReady(true);
    } catch (err) {
      console.error("Failed to download model:", err);
      setError("Failed to download model. Check the URL and try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleModelUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = event.target.value;
    setLocalModelUrl(newUrl);
    setModelReady(false);
    setError(null);
    onChange([{ key: "modelUrl", value: newUrl }]);
  };

  const handleSpeedChange = (_event: any, newValue: number | number[]) => {
    const speedValue = Array.isArray(newValue) ? newValue[0] : newValue;
    setLocalSpeed(speedValue);
    onChange([{ key: "speed", value: speedValue.toString() }]);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}>
      <TextField
        label="Model URL"
        placeholder="username/model-name"
        value={localModelUrl}
        onChange={handleModelUrlChange}
        fullWidth
        helperText="HuggingFace model path (e.g., onnx-community/piper-en_US-lessac-medium)"
        error={!!error}
      />

      <Box>
        <Button
          variant="contained"
          onClick={handleDownload}
          disabled={downloading || modelReady || !localModelUrl.trim()}
          fullWidth
        >
          {downloading && <CircularProgress size={20} sx={{ mr: 1 }} />}
          {modelReady ? "Model Downloaded" : "Download Model"}
        </Button>
        {error && (
          <Typography
            variant="caption"
            color="error"
            sx={{ mt: 1, display: "block" }}
          >
            {error}
          </Typography>
        )}
        {!modelReady && !downloading && !error && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            Download the ONNX TTS model before using
          </Typography>
        )}
      </Box>

      <Box>
        <Typography id="speed-slider" gutterBottom>
          Speed: {localSpeed.toFixed(1)}x
        </Typography>
        <Slider
          aria-labelledby="speed-slider"
          value={localSpeed}
          onChange={handleSpeedChange}
          min={0.5}
          max={2.0}
          step={0.1}
          marks={[
            { value: 0.5, label: "0.5x" },
            { value: 1.0, label: "1.0x" },
            { value: 1.5, label: "1.5x" },
            { value: 2.0, label: "2.0x" },
          ]}
          disabled={!modelReady}
        />
      </Box>
    </Box>
  );
};
