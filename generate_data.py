import json
import random
import uuid

def generate_data(num_entries=10):  # Cambiado de 100000 a 100
    regions = ["North", "South", "East", "West"]
    countries = ["Chile", "USA"]
    data = []

    for _ in range(num_entries):
        entry = {
            "id": str(uuid.uuid4()),
            "name": f"Name{random.randint(1, 1000)}",
            "age": random.randint(0, 100),
            "sex": random.choice(["Male", "Female"]),
            "disability": random.choice([True, False]),
            "region": random.choice(regions),
            "country": random.choice(countries),
            "income": random.randint(0, 100000)
        }
        data.append(entry)

    with open('data.json', 'w') as f:
        json.dump(data, f, indent=4)

if __name__ == "__main__":
    generate_data()  # Ahora generará 100 entradas

