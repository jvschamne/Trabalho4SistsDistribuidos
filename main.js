const eventSource = new EventSource('http://127.0.0.1:5000/');

eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'notification') {
        // Notificação do servidor
        const notification = data.message;
        console.log('Notificação do servidor:', notification);
        const notificationList = document.getElementById('notification-list');
        const listItem = document.createElement('li');
        listItem.textContent = notification;
        notificationList.appendChild(listItem);

    } else if (data.type === 'clientsUpdate') {
        // Atualização da lista de clientes
        const clients = data.clients;
        const clientList = document.getElementById('client-list');
        clientList.innerHTML = ''; // Limpar a lista existente
        clients.forEach((client) => {
            const listItem = document.createElement('li');
            listItem.textContent = client;
            clientList.appendChild(listItem);
        });
    }
};

const userRegistrationForm = document.getElementById('user-registration-form');

userRegistrationForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const userNameInput = document.getElementById('user-name');
    const userName = userNameInput.value;

    // Enviar solicitação de registro de usuário para o servidor
    fetch('http://127.0.0.1:5000/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: userName }),
    })
    .then((response) => response.json())
    .then((data) => {
        console.log(data.message);
        userNameInput.value = ''; // Limpar o campo de entrada após o registro
        userRegistrationForm.style.display = "none";
    })
    .catch((error) => {
        console.error('Erro no registro de usuário:', error);
    });
});

// Função para buscar a lista de clientes do servidor
function fetchClientList() {
    fetch('http://127.0.0.1:5000/api/clients', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then((response) => response.json())
    .then((data) => {
        const clientList = document.getElementById('client-list');
        clientList.innerHTML = ''; // Limpar a lista existente

        data.forEach((client) => {
            const listItem = document.createElement('li');
            listItem.textContent = client;
            clientList.appendChild(listItem);
        });
    })
    .catch((error) => {
        console.error('Erro ao buscar a lista de clientes:', error);
    });
}

// Chame a função para buscar a lista de clientes assim que a página for carregada
fetchClientList();

const productRegistrationForm = document.getElementById('product-registration-form');

productRegistrationForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const codeInput = document.getElementById('product-code');
    const nameInput = document.getElementById('product-name');
    const descriptionInput = document.getElementById('product-description');  // Adicionado para receber a descrição
    const priceInput = document.getElementById('price');
    const minStockInput = document.getElementById('product-minstock');  // Adicionado para receber o estoque mínimo

    const code = codeInput.value;
    const name = nameInput.value;
    const description = descriptionInput.value;  // Recebe a descrição
    const price = parseFloat(priceInput.value);
    const minStock = parseFloat(minStockInput.value);  // Recebe o estoque mínimo

    // Verifique se os campos não estão vazios
    if (code.trim() !== '' && name.trim() !== '' && !isNaN(price) && price >= 0 && !isNaN(minStock) && minStock >= 0) {
        // Crie um objeto de produto com as informações inseridas
        const product = {
            code,
            name,
            description,
            minStock, // Você pode ajustar isso conforme necessário
            price,
        };

        // Adicione o produto à tabela
        addProductToTable(product);

        // Enviar solicitação de registro de usuário para o servidor
        fetch('http://127.0.0.1:5000/api/products/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: product }),
        })
        .then((response) => response.json())
        .then((data) => {
            console.log(data.message);
        })
        .catch((error) => {
            console.error('Erro no registro de produto:', error);
        });

        // Limpe os campos de entrada
        codeInput.value = '';
        nameInput.value = '';
        priceInput.value = '';
    } else {
        // Exiba uma mensagem de erro se algum campo estiver vazio ou o preço for inválido
        alert('Por favor, preencha todos os campos corretamente.');
    }
});

// Função para adicionar um produto à tabela
function addProductToTable(product) {
    const productList = document.getElementById('product-list');
    const newRow = productList.insertRow();
    // Coluna do Código
    const codeCell = newRow.insertCell(0);
    codeCell.textContent = product.code;
    // Coluna do Produto
    const productCell = newRow.insertCell(1);
    productCell.textContent = product.name;
    // Coluna do Estoque Mínimo (definido como 0 neste exemplo)

    const descriptionCell = newRow.insertCell(2);
    descriptionCell.textContent = product.description;

    const minStockCell = newRow.insertCell(3);
    minStockCell.textContent = product.minStock;
    // Coluna do Preço
    const priceCell = newRow.insertCell(4);
    priceCell.textContent = product.price;
    // Coluna da Quantidade
    const quantityCell = newRow.insertCell(5);
    const quantityInput = document.createElement('input');
    quantityInput.type = 'number';
    quantityInput.min = 0;
    quantityCell.appendChild(quantityInput);
    // Coluna das Ações
    const actionsCellIncrease = newRow.insertCell(6);
    const increaseButton = document.createElement('button');
    increaseButton.textContent = 'Aumentar';
    actionsCellIncrease.appendChild(increaseButton);
    const actionsCellDecrease = newRow.insertCell(7);
    const decreaseButton = document.createElement('button');
    decreaseButton.textContent = 'Diminuir';
    actionsCellDecrease.appendChild(decreaseButton);
    // Manipuladores de eventos para os botões de aumento e diminuição
    increaseButton.addEventListener('click', () => {
        // Implemente a lógica para aumentar a quantidade do produto aqui
        // Você pode usar quantityInput.value para obter a quantidade
    });
    decreaseButton.addEventListener('click', () => {
        // Implemente a lógica para diminuir a quantidade do produto aqui
        // Você pode usar quantityInput.value para obter a quantidade
    });
}

// Função para buscar a lista de produtos do servidor
function fetchProductList() {
    fetch('http://127.0.0.1:5000/api/products', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then((response) => response.json())
    .then((data) => {
        // Limpa a lista existente
        const productList = document.getElementById('product-list');
        productList.innerHTML = '';

        // Itera sobre os produtos recebidos e adiciona à tabela
        data.forEach((product) => {
            addProductToTable(product);
        });
    })
    .catch((error) => {
        console.error('Erro ao buscar a lista de produtos:', error);
    });
}


// Chama a função para buscar a lista de produtos assim que a página for carregada
fetchProductList();
