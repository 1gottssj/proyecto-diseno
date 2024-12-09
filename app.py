from flask import Flask, jsonify, request, render_template, redirect, url_for, session
import json
import uuid
import os
from werkzeug.security import generate_password_hash, check_password_hash
import re

# Inicialización de la aplicación
app = Flask(__name__)
app.secret_key = 'clave_secreta_para_sesion'

# Funciones de carga y guardado de datos
def load_data():
    """Cargar datos desde el archivo JSON."""
    if os.path.exists('data.json'):
        with open('data.json') as f:
            return json.load(f)
    return []

def save_data(data):
    """Guardar datos en el archivo JSON."""
    with open('data.json', 'w') as f:
        json.dump(data, f, indent=4)

def load_users():
    """Cargar usuarios desde el archivo JSON."""
    if os.path.exists('users.json'):
        with open('users.json') as f:
            return json.load(f)
    return []

def save_users(users):
    """Guardar usuarios en el archivo JSON."""
    with open('users.json', 'w') as f:
        json.dump(users, f, indent=4)

# Función para validar el formato del correo electrónico
def es_correo_valido(correo):
    """Validar formato de correo electrónico."""
    regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    return re.match(regex, correo)

# Rutas de la aplicación
@app.route('/')
def index():
    """Página principal (login)."""
    if 'username' in session:
        return redirect(url_for('data_monitoring'))
    return render_template('login.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Autenticación de usuario."""
    if request.method == 'POST':
        users = load_users()
        username = request.form['username']
        password = request.form['password']
        
        user = next((u for u in users if u["username"] == username), None)
        if user and check_password_hash(user["password"], password):
            session['username'] = username
            return redirect(url_for('data_monitoring'))
        return 'Login failed. Please check your username and password.'
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    """Registro de nuevo usuario."""
    if request.method == 'POST':
        users = load_users()
        username = request.form['username']
        password = request.form['password']
        email = request.form['email']
        age = request.form['age']
        language = request.form['language']

        if any(u['username'] == username for u in users):
            return 'Username already exists.'
        
        hashed_password = generate_password_hash(password)
        users.append({
            'username': username,
            'password': hashed_password,
            'email': email,
            'age': age,
            'language': language
        })
        save_users(users)
        return redirect(url_for('index'))
    
    return render_template('register.html')

@app.route('/logout', methods=['POST'])
def logout():
    """Cerrar sesión del usuario."""
    session.pop('username', None)
    return redirect(url_for('index'))

@app.route('/data_monitoring')
def data_monitoring():
    """Página de monitoreo de datos (requiere autenticación)."""
    if 'username' not in session:
        return redirect(url_for('index'))
    return render_template('index.html')

@app.route('/filter_results')
def filter_results():
    """Página de filtro de resultados (requiere autenticación)."""
    if 'username' not in session:
        return redirect(url_for('index'))
    return render_template('filter_results.html')

# API Endpoints
@app.route('/api/data', methods=['GET'])
def get_data():
    """Obtener todos los datos."""
    data = load_data()
    return jsonify(data)

@app.route('/api/data', methods=['POST'])
def add_data():
    """Agregar un nuevo dato."""
    new_entry = request.json
    new_entry['id'] = str(uuid.uuid4())
    data = load_data()
    data.append(new_entry)
    save_data(data)
    return jsonify(new_entry), 201

@app.route('/api/data/filter', methods=['GET'])
def filter_data():
    """Filtrar datos con parámetros específicos."""
    data = load_data()
    age = request.args.get('age', type=int)
    sex = request.args.get('sex')
    region = request.args.get('region')
    country = request.args.get('country')
    
    if age is not None:
        data = [d for d in data if d['age'] >= age]
    if sex:
        data = [d for d in data if d['sex'] == sex]
    if region:
        data = [d for d in data if d['region'] == region]
    if country:
        data = [d for d in data if d['country'] == country]
    
    filtered_data = {
        'count': len(data),
        'data': data
    }
    
    with open('filtered_data.json', 'w') as f:
        json.dump(filtered_data, f, indent=4)
    
    return jsonify(filtered_data)

if __name__ == '__main__':
    app.run(debug=True)
