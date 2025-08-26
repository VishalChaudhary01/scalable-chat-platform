import express from 'express';
import { config } from './configs/env.config';

const app = express();

app.get('/health', (_req, res) => {
  res.status(200).json({ message: 'Healthy server!' });
});

const PORT = parseInt(config.PORT);

app.listen(PORT, () =>
  console.log(`Server started on http://localhost:${PORT}`)
);
