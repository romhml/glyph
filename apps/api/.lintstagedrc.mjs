export default {
  "*.py": ["poetry run ruff format", "poetry run ruff check --fix"],
};
