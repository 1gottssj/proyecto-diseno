document.addEventListener('DOMContentLoaded', () => {
    const dataDisplay = document.getElementById('data-display');
    const addDataForm = document.getElementById('add-data-form');
    const filterButton = document.getElementById('filter-button'); 
    const languageSelect = document.getElementById('language-select');

    // Guardar datos del usuario en localStorage en el registro
    if (window.location.pathname === '/register') {
        document.querySelector('form').addEventListener('submit', event => {
            // Guardar datos de registro en localStorage
            const username = document.getElementById('username').value;
            const language = document.getElementById('language').value;
            const email = document.getElementById('email').value;
            const age = document.getElementById('age').value;

            localStorage.setItem('username', username);
            localStorage.setItem('language', language);
            localStorage.setItem('email', email);
            localStorage.setItem('age', age);
        });
    }
    // Obtener idioma preferido del usuario o 'en' como valor predeterminado
    const userLang = localStorage.getItem('language') || 'en';
    setLanguage(userLang);

    function setLanguage(language) {
        localStorage.setItem('language', language);
        const translations = {
            en: {
                addData: 'Add New Data',
                filterData: 'Filter Data',
                data: 'Data',
                name: 'Name',
                age: 'Age',
                sex: 'Sex',
                male: 'Male',
                female: 'Female',
                disability: 'Disability',
                yes: 'Yes',
                no: 'No',
                region: 'Region',
                country: 'Country',
                income: 'Income',
                addDataBtn: 'Add Data'
            },
            es: {
                addData: 'Agregar Datos',
                filterData: 'Filtrar Datos',
                data: 'Datos',
                name: 'Nombre',
                age: 'Edad',
                sex: 'Sexo',
                male: 'Masculino',
                female: 'Femenino',
                disability: 'Discapacidad',
                yes: 'Sí',
                no: 'No',
                region: 'Región',
                country: 'País',
                income: 'Ingresos',
                addDataBtn: 'Agregar Datos'
            }
        };

        // Actualiza los textos según el idioma seleccionado
        document.querySelector('.add-data h2').textContent = translations[language].addData;
        document.querySelector('.filter-data button').textContent = translations[language].filterData;
        document.querySelector('.data-display h2').textContent = translations[language].data;

        document.querySelector('label[for="name"]').textContent = translations[language].name + ':';
        document.querySelector('label[for="age"]').textContent = translations[language].age + ':';
        document.querySelector('label[for="sex"]').textContent = translations[language].sex + ':';
        document.querySelector('#sex option[value="Male"]').textContent = translations[language].male;
        document.querySelector('#sex option[value="Female"]').textContent = translations[language].female;
        document.querySelector('label[for="disability"]').textContent = translations[language].disability + ':';
        document.querySelector('#disability option[value="true"]').textContent = translations[language].yes;
        document.querySelector('#disability option[value="false"]').textContent = translations[language].no;
        document.querySelector('label[for="region"]').textContent = translations[language].region + ':';
        document.querySelector('label[for="country"]').textContent = translations[language].country + ':';
        document.querySelector('label[for="income"]').textContent = translations[language].income + ':';
        document.querySelector('#add-data-form button').textContent = translations[language].addDataBtn;
    }

    // Cambiar idioma cuando se selecciona uno diferente en el selector
    if (languageSelect) {
        languageSelect.addEventListener('change', (event) => {
            setLanguage(event.target.value);
        });
    }

    // Función para realizar fetch y manejar errores
    function fetchData(url, callback) {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => callback(data))
            .catch(error => console.error('Error fetching data:', error));
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
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jsonData)
            })
            .then(response => response.json())
            .then(data => {
                alert('Data added: ' + JSON.stringify(data));
                fetchData('/api/data', (data) => displayData(data, 'data-display')); // Actualizar visualización de datos
            })
            .catch(error => console.error('Error adding data:', error));
        });
    }

    // Manejo del botón de filtrado de datos
    if (filterButton) {
        filterButton.addEventListener('click', () => {
            // Redirige a la página de resultados o realiza otra acción al hacer clic en "Filtrar Data"
            window.location.href = '/filter_results';
        });
    }

    // Mostrar datos filtrados en la página de resultados
    if (window.location.pathname === '/filter_results') {
        const filteredData = JSON.parse(localStorage.getItem('filteredData'));
        const filteredCount = localStorage.getItem('filteredCount');
        document.getElementById('result-count').textContent = `${filteredCount} results found.`;
        displayData(filteredData, 'filtered-data-display');
    }

    // Fetch inicial para mostrar todos los datos
    if (dataDisplay) {
        fetchData('/api/data', (data) => {
            console.log('Datos obtenidos:', data); // Verificar que los datos se obtienen correctamente
            displayData(data, 'data-display');
        });
    }

    function displayData(data, elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = ''; // Limpiar contenido previo
    
            data.forEach(item => {
                const card = document.createElement('div');
                card.classList.add('data-card');
    
                card.innerHTML = `
                    <h3>${item.name}</h3>
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
});
