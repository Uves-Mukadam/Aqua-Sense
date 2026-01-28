
def get_forecasted_temp(city, date):
    # In a real app, this would call OpenWeatherMap or similar
    # For now, we return a realistic seasonal temp for Mumbai/Andheri
    # March-May: 32-38, June-Sept: 28-32, Oct-Feb: 25-30
    return 31.5 # Placeholder average
