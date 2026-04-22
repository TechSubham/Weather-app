import os

import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("OPENWEATHER_API_KEY", "9ea08a9892905905d69203b7ae04756c")


def predict_rain(temp: float, humidity: int) -> str:
    if humidity > 70:
        return "High chance of rain"
    if humidity > 50:
        return "Moderate chance"
    return "Low chance"


@app.get("/weather")
def get_weather(city: str):
    if not city.strip():
        raise HTTPException(status_code=400, detail="City is required")

    url = (
        "https://api.openweathermap.org/data/2.5/weather"
        f"?q={city}&appid={API_KEY}&units=metric"
    )

    response = requests.get(url, timeout=10)
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="City not found")

    weather_response = response.json()
    temp = weather_response["main"]["temp"]
    humidity = weather_response["main"]["humidity"]
    prediction = predict_rain(temp, humidity)

    return {"weather": weather_response, "prediction": prediction}
