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

        productRegistrationForm.style.display = "flex";
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
            // Adicione o produto à tabela
            if(data.message === "Produto registrado com sucesso") addProductToTable(product);
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
    console.log(product)

    const productList = document.getElementById('product-list');
    const newRow = productList.insertRow();
    newRow.id = product.code; //  ID da linha igual ao código do produto

    // Coluna do Código
    const codeCell = newRow.insertCell(0);
    codeCell.textContent = product.code;
    // Coluna do Produto
    const productCell = newRow.insertCell(1);
    productCell.textContent = product.name;
    // Coluna da Descrição
    const descriptionCell = newRow.insertCell(2);
    descriptionCell.textContent = product.description;
    // Coluna do Estoque Mínimo
    const minStockCell = newRow.insertCell(3);
    minStockCell.textContent = product.minStock;
    // Coluna do Preço
    const priceCell = newRow.insertCell(4);
    priceCell.textContent = product.price;
    // Coluna da Quantidade
    const quantityCell = newRow.insertCell(5);
    quantityCell.textContent = product.quantity

    // Coluna das Ações
    const actionsCell = newRow.insertCell(6);
    const addButton = document.createElement('button');
    addButton.textContent = 'Adicionar';
    const subtractButton = document.createElement('button');
    subtractButton.textContent = 'Subtrair';


    const quantityInput = document.createElement('input');
    quantityInput.type = 'number';
    quantityInput.min = 0;
    quantityInput.value = product.quantity || 0; // Define o valor inicial como a quantidade do produto ou 0

    actionsCell.appendChild(quantityInput);
    actionsCell.appendChild(addButton);
    actionsCell.appendChild(subtractButton);

    // Manipuladores de eventos para os botões de adicionar e subtrair
    addButton.addEventListener('click', () => {
        const quantityToAdd = parseInt(quantityInput.value, 10);
        
        // Obtém o ID da linha atual
        const productId = newRow.id; // newRow é a linha atual que foi definida com o ID
        
        // Verifique se o productId não está vazio
        if (productId) {
            // Enviar solicitação de adicionar produto para o servidor com o ID e a quantidade
            fetch(`http://127.0.0.1:5000/api/products/entry/${productId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quantityToAdd }),
            })
            .then((response) => response.json())
            .then((data) => {
                console.log(data.message);
            })
            .catch((error) => {
                console.error('Erro ao adicionar produto:', error);
            });
        } else {
            console.error('ID da linha não encontrado.');
        }
    });

    subtractButton.addEventListener('click', () => {
        const quantityToSubtract = parseInt(quantityInput.value, 10);
        
        // Obtém o ID da linha atual
        const productId = newRow.id; // newRow é a linha atual que foi definida com o ID
        
        // Verifique se o productId não está vazio
        if (productId) {
            // Enviar solicitação de subtrair produto do servidor com o ID e a quantidade
            fetch(`http://127.0.0.1:5000/api/products/exit/${productId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quantityToSubtract }), // Use um valor negativo para subtrair
            })
            .then((response) => response.json())
            .then((data) => {
                console.log(data.message);
            })
            .catch((error) => {
                console.error('Erro ao subtrair produto:', error);
            });
        } else {
            console.error('ID da linha não encontrado.');
        }
    });
    
    
}


const registerProductButton = document.getElementById('add_product_button');
registerProductButton.addEventListener('click', () => {
    if (productRegistrationForm.style.display === 'none') {
        productRegistrationForm.style.display = 'flex';
    } else {
        productRegistrationForm.style.display = 'none';
    }
})


const relatorio_popup = document.getElementById('relatorio');
const relatorioButton = document.getElementById('relatorio_button');

relatorioButton.addEventListener('click', () => {
    if (relatorio_popup.style.display === 'none') {
        relatorio_popup.style.display = 'flex';
    } else {
        relatorio_popup.style.display = 'none';
    }
})


const tabelaProdutos = document.getElementById('tabela-produtos')
const tabelaButton = document.getElementById('table_button')

tabelaButton.addEventListener('click', () => {
    if (tabelaProdutos.style.display === 'none') {
        tabelaProdutos.style.removeProperty('display');
    } else {
        tabelaProdutos.style.display = 'none';
    }
})



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
