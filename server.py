from flask import Flask, jsonify, request
from flask_cors import CORS
import json
from time import sleep

app = Flask(__name__)
CORS(app)

# Lista de clientes conectados
clients = []

# Dados de exemplo
products = []

# Lista de notificações
notifications = []

@app.route('/api/notify', methods=['POST'])
def notify_clients():
    data = request.json
    message = data.get('message')
    notifications.append(message)

    for client in clients:
        client.put(json.dumps({'type': 'notification', 'message': message}))

    return jsonify({"message": "Notificação enviada com sucesso"})


@app.route('/api/clients', methods=['GET'])
def get_users():
    return jsonify(clients)


@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.json
    name = data.get('name')
    response = ""
    if name not in clients:
        clients.append(name)
        response = f"Usuário {name} registrado com sucesso."
    else:
        response = f"Usuário {name} já está registrado."
    
    return jsonify({"message": response})
    

@app.route('/api/products/entry', methods=['POST'])
def record_entry():
    data = request.json
    code = data.get('code')
    name = data.get('name')
    description = data.get('description')
    quantity = data.get('quantity')
    price = data.get('price')
    min_stock = data.get('min_stock')

    products[code] = {
        "name": name,
        "description": description,
        "quantity": quantity,
        "price": price,
        "min_stock": min_stock,
    }

    response = "Produto adicionado com sucesso"
    return jsonify({"message": response})


if __name__ == '__main__':
    app.run(debug=True)
    sleep(3000)
    notifications.append("putaria")
