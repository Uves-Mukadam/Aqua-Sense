import requests

WEATHER_API_KEY = "39c571848d8d3e268988e891518cfe02"

def get_forecasted_temp(city, date):
    url = (
        f"https://api.openweathermap.org/data/2.5/weather"
        f"?q={city,date},IN&appid={WEATHER_API_KEY}&units=metric"
    )
    res = requests.get(url, timeout=5).json()

    temp = res["main"]["temp"]
 
    return temp 
