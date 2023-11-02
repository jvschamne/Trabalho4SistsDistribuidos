from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import json
from time import sleep
import datetime

app = Flask(__name__)
CORS(app)

users = {}  # Dicionário de usuários (nome do usuário -> objeto do usuário)
products = {}  # Dicionário de produtos (código do produto -> objeto do produto)
clients = {}  # Dicionário de clientes (nome do cliente -> objeto do cliente)"""

# Lista de notificações
notifications = []

# Representa o produto
class Product:
    def __init__(self, code, name, description, quantity, price, min_stock):
            self.code = code
            self.name = name
            self.description = description
            self.quantity = quantity
            self.price = price
            self.min_stock = min_stock
            self.movements = []

    def add_entry(self, quantity):
            self.quantity += quantity
            self.movements.append((datetime.datetime.now(), "entrada", quantity))

    def add_exit(self, quantity):
            if self.quantity >= quantity:
                self.quantity -= quantity
                self.movements.append((datetime.datetime.now(), "saída", quantity))

    def get_stock_status(self):
            return {
                "code": self.code,
                "name": self.name,
                "description": self.description,
                "quantity": self.quantity,
                "price": self.price,
                "min_stock": self.min_stock,
            }

# Classe que representa um usuário do sistema
class User:
    def __init__(self, name):
        self.name = name


@app.route('/', methods=['GET'])
def stock_system():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Stock System</title>
    </head>
    <body>
        <h1>Bem-vindo ao Sistema de Estoque</h1>
        <p>Este é um exemplo de página HTML retornada diretamente pelo Flask.</p>
    </body>
    </html>
    """

@app.route('/api/notify', methods=['POST'])
def notify_clients():
    data = request.json
    message = data.get('message')
    notifications.append(message)
    for client in clients:
        client.put(json.dumps({'type': 'notification', 'message': message}))

    return jsonify({"message": "Notificação enviada com sucesso"})


# Funcoes do Sistema de gestão de estoque
@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.json
    name = data.get('name')
    response = ""
    if name not in users:
        user = User(name)
        users[name] = user
        response = f"Usuário {name} registrado com sucesso."
    else:
        response = f"Usuário {name} já está registrado."
    
    return jsonify({"message": response})

    
@app.route('/api/products/register', methods=['POST'])
def register_product():
    data = request.json
    data = data["data"]
    code = data.get('code')
    name = data.get('name')
    description = data.get('description')
    price = data.get('price')
    min_stock = data.get('min_stock')

    # Crie um objeto Product com as informações e adicione-o ao dicionário de produtos
    product = Product(code, name, description, 0, price, min_stock)
    products[code] = product

    response = "Produto registrado com sucesso"

    return jsonify({"message": response})



@app.route('/api/products/entry', methods=['POST'])
def record_entry():
    data = request.json
    code = data.get('code')
    quantity = data.get('quantity')
        
    response = ""
    if code in products:
        response = "Produto adicionado ao estoque."
        product = products[code]
        product.add_entry(quantity)
    else:
        response = "Não há nenhum produto com esse código"
       
    return jsonify({"message": response})


@app.route('/api/products', methods=['GET'])
def get_products():
    product_list = []
    for code, product in products.items():
        product_list.append(product.get_stock_status())
    return jsonify(product_list)


@app.route('/api/clients', methods=['GET'])
def get_users():
    print(users)
    username_list = []
    for user in users:
        username_list.append(user)

    return jsonify(username_list)




if __name__ == '__main__':
    app.run(debug=True)
    sleep(3000)
    notifications.append("quarquercoisa")
