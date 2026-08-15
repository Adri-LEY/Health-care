# Utilisation d'une image officielle Python 3.12 légère (slim)
FROM python:3.12-slim

WORKDIR /app

# Copie du fichier de dépendances
COPY requirements.txt .

# Installation des dépendances sans conserver le cache pour alléger l'image
RUN pip install --no-cache-dir -r requirements.txt

# Copie de tout le reste du code (main.py, mon_modele.joblib, scaler.joblib)
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]