import path from 'path';

// NOTE: this would be the place to add seed data...
export default function app(_, res) {
  res.sendFile(path.join(__dirname, '../../static/index.html'));
}
