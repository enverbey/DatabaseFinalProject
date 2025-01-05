document.addEventListener('DOMContentLoaded', () => {
    const universitiesTableBody = document.getElementById('universities-body');
    const universitiesFilter = document.getElementById('universities-filter');
    const addUniversityInput = document.getElementById('universities-adder');
    const addUniversityButton = document.getElementById('adduniversitybutton');

    let universitiesData = [];

    
    fetch('/retrieve_universities_for_university_menu')
        .then(response => response.json())
        .then(universities => {
            universitiesData = universities;
            populateUniversitiesTable(universities);
        })
        .catch(error => console.error('Error while fetching universities:', error));

    
    universitiesFilter.addEventListener('input', () => {
        const filterText = universitiesFilter.value.toLowerCase();
        const filteredUniversities = universitiesData.filter(university => university.uni_name.toLowerCase().includes(filterText));
        populateUniversitiesTable(filteredUniversities);
    });

    
    addUniversityButton.addEventListener('click', () => {
        const newUniversity = addUniversityInput.value.trim();
        if (newUniversity) {
            fetch('/add_university_to_university_menu', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ uni_name: newUniversity })
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    universitiesData.push(result.university);
                    populateUniversitiesTable(universitiesData);
                    addUniversityInput.value = '';
                } else {
                    alert('Error adding university:' + result.error);
                }
            })
            .catch(error => console.error('Error while adding university:', error));
        }
    });

    
    function populateUniversitiesTable(universities) {
        universitiesTableBody.innerHTML = '';
        universities.forEach(university => {
            const row = document.createElement('tr');
            
            
            const removeButtonCell = document.createElement('td');
            const removeButton = document.createElement('button');
            removeButton.setAttribute("id", "delete-button");
            removeButton.textContent = 'Delete Forever';
            removeButton.addEventListener('click', () => removeUniversity(university.university_id));
            removeButtonCell.appendChild(removeButton);
            row.appendChild(removeButtonCell);

            
            const universityCell = document.createElement('td');
            universityCell.textContent = university.uni_name;
            row.appendChild(universityCell);

            
            universityCell.addEventListener('click', () => {
                window.opener.postMessage({
                    type: 'universitySelected',
                    university_id: university.university_id,
                    uni_name: university.uni_name,
                }, '*');
            });

            universitiesTableBody.appendChild(row);
        });
    }

    
    function removeUniversity(universityId) {
        fetch(`/remove_university/${universityId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                universitiesData = universitiesData.filter(university => university.university_id !== universityId);
                populateUniversitiesTable(universitiesData);
            } else {
                console.error('Error removing university:', result.error);
            }
        })
        .catch(error => console.error('Error while removing university:', error));
    }
});
