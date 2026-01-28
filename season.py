
def get_season(date_str):
    # Logic to return monsoon, summer, or winter for Mumbai context
    month = int(date_str.split('-')[1])
    if 3 <= month <= 5: return "Summer"
    if 6 <= month <= 9: return "Monsoon"
    return "Winter"
