FROM python:3.11-slim

# 1) Install Poetry at a known version
RUN pip install poetry==1.8.0

# 2) Configure Poetry not to create a virtual environment
RUN poetry config virtualenvs.create false

WORKDIR /code

# 3) Copy only pyproject + lockfile (and README if needed) for dependency installation
COPY ./pyproject.toml ./poetry.lock* ./README.md ./

# 4) If you truly have a local packages directory, ensure the path matches
#    (If you only have “packages/”, don’t use the bracket wildcard “package[s]”.)
COPY ./packages ./packages

# 5) Install dependencies without installing the *current* project code as a package
#    (that’s what “--no-root” does)
RUN poetry install --no-interaction --no-ansi --no-root

# 6) Copy the main application code
COPY ./app ./app

# 7) (Re-)install including the local project, if you actually need it as an importable module
#    or if you need to run “poetry install” again to pick up anything in `app/`.
#    If your project is not meant to be installed as a package, you may not need this second step.
RUN poetry install --no-interaction --no-ansi

EXPOSE 8080

# 8) Run Uvicorn (no real need for 'exec' here, but it’s not harmful)
CMD ["uvicorn", "app.server:app", "--host", "0.0.0.0", "--port", "8080"]