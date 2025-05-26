import React, { useState } from "react";
import {
  Container, Typography, TextField, Checkbox, FormControlLabel,
  Select, MenuItem, Radio, RadioGroup, FormControl, FormLabel,
  Button, Grid, Paper, Box, CircularProgress
} from "@mui/material";
import { predictDiabetes } from "./api";
import { FEATURE_META, FEATURE_NAMES, buildPayload } from "./utils/payLoad";
import ShapChart from "./components/ShapChart";

export default function DiabetesPrediction() {
  /* --- state ------------------------------------------------- */
  const [form, setForm] = useState(
    Object.fromEntries(FEATURE_NAMES.map((k) => [k, ""]))
  );
  const [result,  setResult ] = useState(null);
  const [loading, setLoading] = useState(false);

  /* --- handlers --------------------------------------------- */
  const handleChange = (key) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = buildPayload(form);
      const { data } = await predictDiabetes(payload);

      const shapArr = Object.entries(data.shap)
        .map(([feature, impact]) => ({ feature, impact }))
        .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
        .slice(0, 10);

      setResult({
        risk : +(data.prob * 100).toFixed(1),
        interpretation: data.prob > 0.5 ? "High" : "Low",
        shap : shapArr,
      });
    } catch (err) {
      console.error(err);
      alert("예측 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  /* --- render field ----------------------------------------- */
  const renderField = (m) => {
    switch (m.type) {
      case "checkbox":
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={!!form[m.key]}
                onChange={handleChange(m.key)}
              />
            }
            label={m.label}
          />
        );
      case "select":
        return (
          <FormControl fullWidth>
            <FormLabel>{m.label}</FormLabel>
            <Select
              value={form[m.key]}
              onChange={handleChange(m.key)}
              required
            >
              {m.opts.map(([v, lab]) => (
                <MenuItem key={v} value={v}>{lab}</MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case "radio":
        return (
          <FormControl>
            <FormLabel>{m.label}</FormLabel>
            <RadioGroup
              row
              value={form[m.key]}
              onChange={handleChange(m.key)}
            >
              {m.opts.map(([v, lab]) => (
                <FormControlLabel
                  key={v}
                  value={v}
                  control={<Radio />}
                  label={lab}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );
      default: // number
        return (
          <TextField
            type="number"
            label={m.label}
            value={form[m.key]}
            onChange={handleChange(m.key)}
            helperText={m.helper}
            fullWidth
            required
          />
        );
    }
  };

  /* --- UI ---------------------------------------------------- */
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        XAI 당뇨병 예측 플랫폼
      </Typography>

      {/* 입력 폼 */}
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {FEATURE_META.map((m) => (
            <Grid item xs={12} sm={6} md={4} key={m.key}>
              {renderField(m)}
            </Grid>
          ))}

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "예측하기"}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* 결과 카드 */}
      {result && (
        <Paper elevation={3} sx={{ mt: 4, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            당뇨병 위험도: {result.risk}% ({result.interpretation})
          </Typography>
          <ShapChart
            shap={Object.fromEntries(
              result.shap.map(({ feature, impact }) => [feature, impact])
            )}
          />
        </Paper>
      )}
    </Container>
  );
}
