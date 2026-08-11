from http.client import HTTPException

from fastapi import FastAPI
import joblib
from pydantic import BaseModel
import numpy as np

# On initialise l'application
app = FastAPI()

# 2. Chargement du modèle au démarrage de l'application
try:
    model = joblib.load("health-care-ai-model.joblib")
    scaler = joblib.load("health-care-ai-scaler.joblib")
    print("Modèle chargé avec succès !")
except Exception as e:
    model = None
    scaler = None
    print(f"Attention : impossible de charger le modèle ({e})")

# Définition de la structure des données entrantes (Schéma Pydantic)
class CardiovascularFeatures(BaseModel):
    age: int
    gender: int
    height: int
    weight: float
    ap_hi: int
    ap_lo: int
    cholesterol: int
    gluc: int
    smoke: int
    alco: int
    active: int



# Une route GET de test à la racine
@app.get("/")
def home():
    return {"message": "L'API Python fonctionne !"}

# Une route POST de test (qui simule une future prédiction)
@app.post("/test-predict")
def test_predict(data: dict):
    return {
        "status": "recu",
        "donnees_recues": data,
        "prediction_factice": 42
    }


@app.post("/predict")
def predict(data: CardiovascularFeatures):
    if model is None:
        return {"error": "Le modèle n'est pas chargé. Impossible de faire une prédiction."}

    try:
        # L'ordre des éléments dans la liste DOIT être identique à celui du DataFrame
        features_array = np.array([[
            data.age,
            data.gender,
            data.height,
            data.weight,
            data.ap_hi,
            data.ap_lo,
            data.cholesterol,
            data.gluc,
            data.smoke,
            data.alco,
            data.active
        ]])

        # 2. Normalisation automatique entre 0 et 1 via le Scaler
        scaled_features = scaler.transform(features_array)

        # Prédiction (ex: 0 pour sain, 1 pour risque cardiovasculaire)
        prediction = model.predict(scaled_features)[0]

        # Probabilité (si votre modèle le gère)
        probabilities = None
        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba(scaled_features)[0].tolist()

        return {
            "status": "success",
            "cardio_prediction": int(prediction),
            "probabilities": probabilities
        }
    
    except Exception as e:
       raise HTTPException(status_code=500, detail=f"Erreur lors du calcul : {str(e)}")