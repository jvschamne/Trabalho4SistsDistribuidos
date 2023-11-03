from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import json
from time import sleep
import datetime
from time import sleep

app = Flask(__name__)
CORS(app)

users = {}  # Dicionário de usuários (nome do usuário -> objeto do usuário)
products = {}  # Dicionário de produtos (código do produto -> objeto do produto)

clients = []  # Dicionário de clientes conectados (nome do cliente -> objeto do cliente)

# Representa o produto
class Product:
    def __init__(self, code, name, description, quantity, price, minStock):
            self.code = code
            self.name = name
            self.description = description
            self.quantity = quantity
            self.price = price
            self.minStock = minStock
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
                "minStock": self.minStock,
            }

# Classe que representa um usuário do sistema
class User:
    def __init__(self, name):
        self.name = name
 

@app.route('/events')
def sse():
    def generate():
        client = request.environ['wsgi.websocket']
        clients.append(client)

        while client in clients:
            time.sleep(1)
            if client:
                # Gere eventos de notificação aqui (use a função notify_clients)
                for code, product in products.items():
                    if product.quantity <= product.minStock:
                        notify_replenishment(client, product)

    return Response(generate(), content_type="text/event-stream")

def notify_replenishment(client, product):
    message = f"Produto '{product.name}' atingiu o estoque mínimo de {product.minStock}."
    data = json.dumps({'type': 'notification', 'message': message})
    client.put(data)

@app.route('/api/products/exit/<string:productId>', methods=['POST'])
def record_exit(productId):
    data = request.json
    quantityToSubtract = data.get('quantityToSubtract')

    response = ""
    if productId in products:
        product = products[productId]

        if quantityToSubtract > 0 and quantityToSubtract <= product.quantity:
            product.add_exit(quantityToSubtract)
            response = "Produto removido do estoque."
        else:
            response = "Quantidade inválida para remoção."

        if product.quantity <= product.minStock:
            # Notify all clients that stock is low
            for client in clients:
                notify_replenishment(client, product)

    else:
        response = "Produto não encontrado."

    return jsonify({"message": response})


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

    # Verifique se já existe um produto com o mesmo código
    if code in products:
        response = "Já existe um produto com o código fornecido."
    else:
        name = data.get('name')
        description = data.get('description')
        price = data.get('price')
        minStock = data.get('minStock')

        # Crie um objeto Product com as informações e adicione-o ao dicionário de produtos
        product = Product(code, name, description, 0, price, minStock)
        products[code] = product

        response = "Produto registrado com sucesso"

    return jsonify({"message": response})


@app.route('/api/products/entry/<string:productId>', methods=['POST'])
def record_entry(productId):
    data = request.json
    quantity = data.get('quantityToAdd')
        
    response = ""
    if productId in products:
        response = "Produto adicionado ao estoque."
        product = products[productId]
        product.add_entry(quantity)
    else:
        response = "Não há nenhum produto com esse código"
       
    return jsonify({"message": response})


"""@app.route('/api/products/exit/<string:productId>', methods=['POST'])
def record_exit(productId):
    data = request.json
    quantityToSubtract = data.get('quantityToSubtract')
        
    response = ""
    if productId in products:
        product = products[productId]
        
        if quantityToSubtract > 0 and quantityToSubtract <= product.quantity:
            product.add_exit(quantityToSubtract)
            response = "Produto removido do estoque."
        else:
            response = "Quantidade inválida para remoção."
    else:
        response = "Produto não encontrado."


    if product.quantity <= product.minStock:
        notify_replenishment(product)

    return jsonify({"message": response})

 """
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


@app.route('/api/reports/movements/<int:date>', methods=['GET'])
def get_movement_reports(date):
    current_time = datetime.datetime.now()
    time = current_time - datetime.timedelta(minutes=date)

    fluxoMov = []
    for product in products.values():

        product_info = {
             "code": product.code,
             "name": product.name,
             "movements": []
        }

         # Filtrar os movimentos que ocorreram até 2 minutos atrás
        for movement_time, movement_type, movement_quantity in product.movements:
                 if movement_time >= time:
                    product_info["movements"].append({
                         "time": movement_time,
                         "type": movement_type,
                        "quantity": movement_quantity
                            })

        fluxoMov.append(product_info)


    print(fluxoMov)
    return jsonify(fluxoMov)


@app.route('/api/reports/not-sold-since/<int:date>', methods=['GET'])
def get_not_sold_reports(date):

    print(date)
    current_time = datetime.datetime.now()
    time_ago = current_time - datetime.timedelta(minutes=date)

    unsold_products = []

    for product in products.values():
        has_exit_movements = any(
            movement_time >= time_ago and movement_type == "saída"
            for movement_time, movement_type, _ in product.movements
        )


        if not has_exit_movements:
            unsold_products.append({
                 "code": product.code,
                 "name": product.name
                    })


    print(unsold_products)
    return jsonify(unsold_products)


if __name__ == '__main__':
    app.run(debug=True)
    sleep(3000)
