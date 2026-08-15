import { Box, Grid, Card, Stack, Typography, Chip, alpha, LinearProgress, Button } from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import TipsAndUpdatesRoundedIcon from '@mui/icons-material/TipsAndUpdatesRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import { aiInsights } from '../data/mockData';

const kindMeta = {
  best: { icon: EmojiEventsRoundedIcon, color: 'success', group: 'Performance' },
  worst: { icon: TrendingDownRoundedIcon, color: 'error', group: 'Performance' },
  risk: { icon: ReportProblemRoundedIcon, color: 'warning', group: 'Risk & Recommendations' },
  recommendation: { icon: TipsAndUpdatesRoundedIcon, color: 'info', group: 'Risk & Recommendations' },
  trend: { icon: ShowChartRoundedIcon, color: 'primary', group: 'Trends & Predictions' },
  prediction: { icon: AutoAwesomeRoundedIcon, color: 'secondary', group: 'Trends & Predictions' },
};

const impactLabel = { high: 'High impact', medium: 'Medium impact', low: 'Low impact' };
const impactColor = { high: 'error', medium: 'warning', low: 'default' };

const groups = ['Performance', 'Risk & Recommendations', 'Trends & Predictions'];

function InsightCard({ insight }) {
  const meta = kindMeta[insight.kind];
  const Icon = meta.icon;
  return (
    <Card sx={{ p: 2.5, height: '100%' }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 40, height: 40, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: (t) => alpha(t.palette[meta.color].main, 0.14), color: `${meta.color}.main`,
            }}
          >
            <Icon fontSize="small" />
          </Box>
          <Chip size="small" label={insight.branch} variant="outlined" />
        </Stack>
        {insight.impact && (
          <Chip
            size="small"
            label={impactLabel[insight.impact]}
            color={impactColor[insight.impact] === 'default' ? undefined : impactColor[insight.impact]}
            variant={impactColor[insight.impact] === 'default' ? 'outlined' : 'filled'}
            sx={impactColor[insight.impact] !== 'default' ? { bgcolor: (t) => alpha(t.palette[impactColor[insight.impact]].main, 0.14), color: `${impactColor[insight.impact]}.main` } : undefined}
          />
        )}
      </Stack>
      <Typography variant="subtitle1" sx={{ mb: 0.75 }}>{insight.title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: insight.confidence ? 2 : 0 }}>{insight.detail}</Typography>
      {insight.confidence && (
        <Box>
          <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.4 }}>
            <Typography variant="caption" color="text.secondary">Model confidence</Typography>
            <Typography variant="caption" fontWeight={700}>{insight.confidence}%</Typography>
          </Stack>
          <LinearProgress variant="determinate" value={insight.confidence} sx={{ height: 5 }} />
        </Box>
      )}
    </Card>
  );
}

export default function AIInsights() {
  return (
    <Box>
      <PageHeader
        title="AI Insights"
        subtitle="Automated intelligence surfaced from network-wide operational data."
        actions={<Chip icon={<AutoAwesomeRoundedIcon sx={{ fontSize: '16px !important' }} />} label="Powered by ARRIVE Intelligence" color="secondary" sx={{ fontWeight: 700 }} />}
      />

      <Card
        sx={{
          p: 2.5,
          mb: 3,
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
          background: (t) => `linear-gradient(120deg, ${alpha(t.palette.secondary.main, 0.14)}, ${alpha(t.palette.primary.main, 0.1)})`,
        }}
      >
        <ForumRoundedIcon color="secondary" />
        <Box sx={{ flex: 1, minWidth: 220 }}>
          <Typography variant="subtitle2">AI Assistant is coming to the Control Tower</Typography>
          <Typography variant="body2" color="text.secondary">
            A conversational assistant will let you ask questions like "which branches are at risk this week?" directly. These insight cards are the preview of that intelligence layer — illustrative for now, not live-generated.
          </Typography>
        </Box>
        <Button variant="outlined" disabled sx={{ whiteSpace: 'nowrap' }}>Ask AI · Coming Soon</Button>
      </Card>

      {groups.map((group) => {
        const items = aiInsights.filter((i) => kindMeta[i.kind].group === group);
        if (items.length === 0) return null;
        return (
          <Box key={group} sx={{ mb: 3.5 }}>
            <Typography variant="overline" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>{group}</Typography>
            <Grid container spacing={2.5}>
              {items.map((insight) => (
                <Grid key={insight.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <InsightCard insight={insight} />
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      })}
    </Box>
  );
}
