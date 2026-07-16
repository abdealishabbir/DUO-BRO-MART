param([string]$Output = "backup.sql")
docker compose exec -T postgres pg_dump -U duobromart duobromart > $Output
