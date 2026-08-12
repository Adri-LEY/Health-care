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
        features_array = np.array([[
            data.age, data.gender, data.height, data.weight,
            data.ap_hi, data.ap_lo, data.cholesterol, data.gluc,
            data.smoke, data.alco, data.active
        ]])

        scaled_features = scaler.transform(features_array)
        prediction = model.predict(scaled_features)[0]

        # Récupération de la probabilité du risque (classe 1)
        risk_percentage = 0.0
        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba(scaled_features)[0]
            # probabilities[1] correspond au risque cardiovasculaire
            risk_percentage = round(float(probabilities[1]) * 100, 2)

        # Détermination de la classe et du message selon le pourcentage
        if risk_percentage < 30:
            risk_class = "Low"
            message = "Le profil présente un risque cardiovasculaire faible. Conservez vos bonnes habitudes de vie."
        elif risk_percentage < 70:
            risk_class = "Moderate"
            message = "Le profil présente un risque cardiovasculaire modéré. Une surveillance régulière et une amélioration de l'hygiène de vie sont recommandées."
        else:
            risk_class = "High"
            message = "Le profil présente un risque cardiovasculaire élevé. Une consultation médicale approfondie est conseillée."

        return {
            "status": "success",
            "riskScore": risk_percentage, # ex: 49.14
            "riskClass": risk_class,       # ex: "MODÉRÉ"
            "message": message,
            "raw_prediction": int(prediction)
        }
    
    except Exception as e:
       raise HTTPException(status_code=500, detail=f"Erreur lors du calcul : {str(e)}")