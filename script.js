document.addEventListener('DOMContentLoaded', () => {
    const dataDisplay = document.getElementById('data-display');
    const addDataForm = document.getElementById('add-data-form');
    const filterButton = document.getElementById('filter-button'); 
    const languageSelect = document.getElementById('language-select');

    // Inicializar idioma preferido
    const userLang = localStorage.getItem('language') || 'en';
    setLanguage(userLang);

    // Guardar datos de usuario en localStorage al registrarse
    if (window.location.pathname === '/register') {
        document.querySelector('form').addEventListener('submit', event => {
            saveRegistrationData();
        });
    }

    // Cambiar idioma cuando se selecciona otro en el selector
    if (languageSelect) {
        languageSelect.addEventListener('change', (event) => {
            setLanguage(event.target.value);
        });
    }

    // Fetch de datos y manejo de errores
    function fetchData(url, callback) {
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => callback(data))
            .catch(error => console.error('Error fetching data:', error));
    }

    // Guardar datos de registro en localStorage
    function saveRegistrationData() {
        const username = document.getElementById('username').value;
        const language = document.getElementById('language').value;
        const email = document.getElementById('email').value;
        const age = document.getElementById('age').value;

        localStorage.setItem('username', username);
        localStorage.setItem('language', language);
        localStorage.setItem('email', email);
        localStorage.setItem('age', age);
    }

    // Actualizar idioma en la página
    function setLanguage(language) {
        localStorage.setItem('language', language);
        const translations = {
            en: { addData: 'Add New Data', filterData: 'Filter Data', data: 'Data', name: 'Name', age: 'Age', sex: 'Sex', male: 'Male', female: 'Female', disability: 'Disability', yes: 'Yes', no: 'No', region: 'Region', country: 'Country', income: 'Income', addDataBtn: 'Add Data' },
            es: { addData: 'Agregar Datos', filterData: 'Filtrar Datos', data: 'Datos', name: 'Nombre', age: 'Edad', sex: 'Sexo', male: 'Masculino', female: 'Femenino', disability: 'Discapacidad', yes: 'Sí', no: 'No', region: 'Región', country: 'País', income: 'Ingresos', addDataBtn: 'Agregar Datos' }
        };

        updateTextContent(translations[language]);
    }

    // Actualizar los textos según el idioma seleccionado
    function updateTextContent(translations) {
        document.querySelector('.add-data h2').textContent = translations.addData;
        document.querySelector('.filter-data button').textContent = translations.filterData;
        document.querySelector('.data-display h2').textContent = translations.data;
        document.querySelector('label[for="name"]').textContent = translations.name + ':';
        document.querySelector('label[for="age"]').textContent = translations.age + ':';
        document.querySelector('label[for="sex"]').textContent = translations.sex + ':';
        document.querySelector('#sex option[value="Male"]').textContent = translations.male;
        document.querySelector('#sex option[value="Female"]').textContent = translations.female;
        document.querySelector('label[for="disability"]').textContent = translations.disability + ':';
        document.querySelector('#disability option[value="true"]').textContent = translations.yes;
        document.querySelector('#disability option[value="false"]').textContent = translations.no;
        document.querySelector('label[for="region"]').textContent = translations.region + ':';
        document.querySelector('label[for="country"]').textContent = translations.country + ':';
        document.querySelector('label[for="income"]').textContent = translations.income + ':';
        document.querySelector('#add-data-form button').textContent = translations.addDataBtn;
    }

    // Mostrar datos en el elemento especificado
    function displayData(data, elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = ''; // Limpiar contenido previo

            data.forEach(item => {
                const card = document.createElement('div');
                card.classList.add('data-card');
                card.innerHTML = `
                    <h2>${item.name}</h2>
                    <p>Edad: ${item.age}</p>
                    <p>Sexo: ${item.sex}</p>
                    <p>Región: ${item.region}</p>
                    <p>País: ${item.country}</p>
                    <p>Ingreso: $${item.income}</p>
                `;
                element.appendChild(card);
            });
        }
    }

    // Manejo del formulario de agregar datos
    if (addDataForm) {
        addDataForm.addEventListener('submit', event => {
            event.preventDefault();
            addNewData();
        });
    }

    // Función para agregar nuevos datos
    function addNewData() {
        const formData = new FormData(addDataForm);
        const jsonData = {
            name: formData.get('name'),
            age: parseInt(formData.get('age')),
            sex: formData.get('sex'),
            disability: formData.get('disability') === 'true',
            region: formData.get('region'),
            country: formData.get('country'),
            income: parseInt(formData.get('income'))
        };

        fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonData)
        })
        .then(response => response.json())
        .then(data => {
            alert('Data added: ' + JSON.stringify(data));
            fetchData('/api/data', (data) => displayData(data, 'data-display')); // Actualizar visualización de datos
        })
        .catch(error => console.error('Error adding data:', error));
    }

    // Mostrar datos filtrados en la página de resultados
    if (window.location.pathname === '/filter_results') {
        const filteredData = JSON.parse(localStorage.getItem('filteredData'));
        const filteredCount = localStorage.getItem('filteredCount');
        document.getElementById('result-count').textContent = `${filteredCount} results found.`;
        displayData(filteredData, 'filtered-data-display');
    }

    // Manejo del botón de filtrado de datos
    if (filterButton) {
        filterButton.addEventListener('click', () => {
            window.location.href = '/filter_results';
        });
    }

    // Fetch inicial para mostrar todos los datos y generar gráficos
    if (dataDisplay) {
        fetchData('/api/data', (data) => {
            displayData(data, 'data-display');
            generateIncomeChart(data);
            generateAgeChart(data);
        });
    }

    // Función para generar el gráfico de ingresos
    function generateIncomeChart(data) {
        const incomeData = data.map(item => item.income);
        const ctx = document.getElementById('incomeChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(item => item.name),
                datasets: [{
                    label: 'Ingresos ($)',
                    data: incomeData,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true } }
            }
        });
    }

    // Función para generar el gráfico de edad
    function generateAgeChart(data) {
        const ageData = data.map(item => item.age);
        const ctx = document.getElementById('ageChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(item => item.name),
                datasets: [{
                    label: 'Edad (años)',
                    data: ageData,
                    fill: false,
                    borderColor: 'rgba(153, 102, 255, 1)',
                    tension: 0.1
                }]
            },
            options: { responsive: true }
        });
    }
});
