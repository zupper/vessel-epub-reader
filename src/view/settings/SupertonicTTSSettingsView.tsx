import React, { useState, useEffect } from "react";
import {
  CircularProgress,
  Box,
  Select,
  Slider,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
} from "@mui/material";
import VoiceManager from "infra/tts/supertonic/VoiceManager";

type SupertonicTTSSettingsViewProps = {
  voice?: string;
  speed?: string;
  onChange: (pairs: { key: string; value: string }[]) => boolean;
};

export const SupertonicTTSSettingsView = ({
  voice = "F1",
  speed = "1.0",
  onChange,
}: SupertonicTTSSettingsViewProps) => {
  const [voices, setVoices] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [localVoice, setLocalVoice] = useState(voice);
  const [localSpeed, setLocalSpeed] = useState(parseFloat(speed));

  useEffect(() => {
    const voiceManager = new VoiceManager();
    voiceManager.getVoiceList().then(setVoices);
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { pipeline } = await import("@xenova/transformers");
      await pipeline("text-to-speech", "onnx-community/Supertonic-TTS-ONNX");
      setModelReady(true);
    } catch (error) {
      console.error("Failed to download model:", error);
    } finally {
      setDownloading(false);
    }
  };

  const handleVoiceChange = (event: any) => {
    const newVoice = event.target.value;
    setLocalVoice(newVoice);
    onChange([{ key: "voice", value: newVoice }]);
  };

  const handleSpeedChange = (_event: any, newValue: number | number[]) => {
    const speedValue = Array.isArray(newValue) ? newValue[0] : newValue;
    setLocalSpeed(speedValue);
    onChange([{ key: "speed", value: speedValue.toString() }]);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}>
      <Box>
        <Button
          variant="contained"
          onClick={handleDownload}
          disabled={downloading || modelReady}
          fullWidth
        >
          {downloading && <CircularProgress size={20} sx={{ mr: 1 }} />}
          {modelReady ? "Model Downloaded" : "Download Model"}
        </Button>
        {!modelReady && !downloading && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            Download the Supertonic TTS model (~50-100MB) before using
          </Typography>
        )}
      </Box>

      <FormControl fullWidth disabled={!modelReady}>
        <InputLabel id="voice-select-label">Voice</InputLabel>
        <Select
          labelId="voice-select-label"
          id="voice-select"
          value={localVoice}
          label="Voice"
          onChange={handleVoiceChange}
        >
          {voices.map((v) => (
            <MenuItem key={v} value={v}>
              {v}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

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
