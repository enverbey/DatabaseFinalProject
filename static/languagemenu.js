document.addEventListener('DOMContentLoaded', () => {
    const languagesTableBody = document.getElementById('languages-body');
    const languagesFilter = document.getElementById('languages-filter');
    const addLanguageInput = document.getElementById('languages-adder');
    const addLanguageButton = document.getElementById('describelanguagebutton');

    let languagesData = [];

    
    fetch('/retrieve_languages_for_language_menu')
        .then(response => response.json())
        .then(languages => {
            languagesData = languages;
            populateLanguagesTable(languages);
        })
        .catch(error => console.error('Error while fetching languages:', error));

    
    languagesFilter.addEventListener('input', () => {
        const filterText = languagesFilter.value.toLowerCase();
        const filteredLanguages = languagesData.filter(language => language.language.toLowerCase().includes(filterText));
        populateLanguagesTable(filteredLanguages);
    });

    
    addLanguageButton.addEventListener('click', () => {
        const newLanguage = addLanguageInput.value.trim();
        if (newLanguage) {
            fetch('/add_language_to_language_menu', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ language: newLanguage })
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    languagesData.push(result.language);
                    populateLanguagesTable(languagesData);
                    addLanguageInput.value = '';
                } else {
                    alert('Error adding language:' + result.error);
                }
            })
            .catch(error => console.error('Error while adding language:', error));
        }
    });

    
    function populateLanguagesTable(languages) {
        languagesTableBody.innerHTML = '';
        languages.forEach(language => {
            const row = document.createElement('tr');
            
            
            const removeButtonCell = document.createElement('td');
            const removeButton = document.createElement('button');
            removeButton.setAttribute("id", "delete-button");
            removeButton.textContent = 'Delete Forever';
            removeButton.addEventListener('click', () => removeLanguage(language.language_id));
            removeButtonCell.appendChild(removeButton);
            row.appendChild(removeButtonCell);
            
            const languageCell = document.createElement('td');
            languageCell.textContent = language.language;
            row.appendChild(languageCell);


            
            languageCell.addEventListener('click', () => {
                window.opener.postMessage({
                    type: 'languageSelected',
                    language_id: language.language_id,
                    language: language.language,
                }, '*');
            });

            languagesTableBody.appendChild(row);
        });
    }

    
    function removeLanguage(languageId) {
        fetch(`/remove_language/${languageId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                languagesData = languagesData.filter(language => language.language_id !== languageId);
                populateLanguagesTable(languagesData);
            } else {
                console.error('Error removing language:' + result.error);
            }
        })
        .catch(error => console.error('Error while removing language:', error));
    }
});
