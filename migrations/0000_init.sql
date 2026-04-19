DROP TABLE IF EXISTS monitor_results;
DROP TABLE IF EXISTS visibility_scores;
DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS campaigns;

CREATE TABLE campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  goal TEXT,
  status TEXT DEFAULT 'draft',
  strategy_data TEXT, -- Stored as JSON string
  keyword_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE articles (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  title TEXT NOT NULL,
  meta_description TEXT,
  word_count INTEGER DEFAULT 0,
  entity_mentions INTEGER DEFAULT 0,
  citable_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

CREATE TABLE visibility_scores (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  mention_rate INTEGER DEFAULT 0,
  avg_position INTEGER DEFAULT 0,
  positive_ratio INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

CREATE TABLE monitor_results (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  query_text TEXT NOT NULL,
  platform TEXT NOT NULL,
  brand_mentioned INTEGER DEFAULT 0, -- BOOLEAN is 0 or 1 in SQLite
  mention_position INTEGER DEFAULT 0,
  sentiment TEXT,
  checked_at TEXT NOT NULL,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);
