document.addEventListener('DOMContentLoaded', () => {
    const dataDisplay = document.getElementById('data-display');
    const addDataForm = document.getElementById('add-data-form');
    const filterDataForm = document.getElementById('filter-data-form');
    const languageSelect = document.getElementById('language-select');

    // Guardar datos del usuario en localStorage en el registro
    if (window.location.pathname === '/register') {
        document.querySelector('form').addEventListener('submit', event => {
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
                addDataBtn: 'Add Data',
                filterAny: 'Any',
                filterAge: 'Age:',
                filterSex: 'Sex:',
                filterRegion: 'Region:',
                filterCountry: 'Country:'
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
                addDataBtn: 'Agregar Datos',
                filterAny: 'Cualquiera',
                filterAge: 'Edad:',
                filterSex: 'Sexo:',
                filterRegion: 'Región:',
                filterCountry: 'País:'
            }
        };

        document.querySelector('.add-data h2').textContent = translations[language].addData;
        document.querySelector('.filter-data h2').textContent = translations[language].filterData;
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

        document.querySelector('label[for="filter-age"]').textContent = translations[language].filterAge;
        document.querySelector('label[for="filter-sex"]').textContent = translations[language].filterSex;
        document.querySelector('#filter-sex option[value=""]').textContent = translations[language].filterAny;
        document.querySelector('#filter-sex option[value="Male"]').textContent = translations[language].male;
        document.querySelector('#filter-sex option[value="Female"]').textContent = translations[language].female;
        document.querySelector('label[for="filter-region"]').textContent = translations[language].filterRegion;
        document.querySelector('label[for="filter-country"]').textContent = translations[language].filterCountry;
    }

    // Cambiar idioma cuando se selecciona uno diferente en el selector
    if (languageSelect) {
        languageSelect.addEventListener('change', (event) => {
            setLanguage(event.target.value);
        });
    }

    // Guardar nombre del usuario en localStorage
    const nameInput = document.getElementById('name');
    if (nameInput) {
        nameInput.addEventListener('input', () => {
            localStorage.setItem('username', nameInput.value);
        });
    }

    // Función para realizar fetch y manejar errores
    function fetchData(url, callback) {
        fetch(url)
            .then(response => response.json())
            .then(data => callback(data))
            .catch(error => console.error('Error fetching data:', error));
    }

    // Mostrar datos en el elemento especificado
    function displayData(data, elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = JSON.stringify(data, null, 2);
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

    // Manejo del formulario de filtro de datos
    if (filterDataForm) {
        filterDataForm.addEventListener('submit', event => {
            event.preventDefault();
            const formData = new FormData(filterDataForm);
            const queryParams = new URLSearchParams();
            
            if (formData.get('filter-age')) {
                queryParams.append('age', formData.get('filter-age'));
            }
            if (formData.get('filter-sex')) {
                queryParams.append('sex', formData.get('filter-sex'));
            }
            if (formData.get('filter-region')) {
                queryParams.append('region', formData.get('filter-region'));
            }
            if (formData.get('filter-country')) {
                queryParams.append('country', formData.get('filter-country'));
            }

            const url = `/api/data/filter?${queryParams.toString()}`;
            
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    localStorage.setItem('filteredData', JSON.stringify(data.data));
                    localStorage.setItem('filteredCount', data.count);
                    window.location.href = '/filter_results';
                })
                .catch(error => console.error('Error filtering data:', error));
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
        fetchData('/api/data', (data) => displayData(data, 'data-display'));
    }
});
