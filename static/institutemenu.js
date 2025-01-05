document.addEventListener('DOMContentLoaded', () => {
    const institutesTableBody = document.getElementById('institutes-body');
    const institutesFilter = document.getElementById('institutes-filter');
    const addInstituteInput = document.getElementById('institutes-adder');
    const addInstituteButton = document.getElementById('addinstitutebutton');
    const universityDropdown = document.getElementById('requiredUniversity');

    let universitiesData = [];
    let institutesData = [];

    
    fetch('/retrieve_universities_for_university_menu')
        .then(response => response.json())
        .then(universities => {
            universitiesData = universities;
            universities.forEach(university => {
                const option = document.createElement('option');
                option.value = university.university_id;
                option.textContent = university.uni_name;
                universityDropdown.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching universities:', error));

    
    fetch('/retrieve_institutes')
        .then(response => response.json())
        .then(institutes => {
            institutesData = institutes;
            updateInstitutesTable();
        })
        .catch(error => console.error('Error fetching institutes:', error));

    
    institutesFilter.addEventListener('input', () => {
        updateInstitutesTable();
    });

    
    universityDropdown.addEventListener('change', () => {
        updateInstitutesTable();
    });

    
    addInstituteButton.addEventListener('click', () => {
        const newInstitute = addInstituteInput.value.trim();
        const selectedUniversityId = universityDropdown.value;

        if (newInstitute && selectedUniversityId) {
            fetch('/add_institute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ institute_name: newInstitute, university_id: selectedUniversityId })
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    institutesData.push(result.institute);
                    updateInstitutesTable();
                    addInstituteInput.value = '';
                } else {
                    alert('Error adding institute: ' + result.error);
                }
            })
            .catch(error => console.error('Error while adding institute:', error));
        }
    });

    
    function updateInstitutesTable() {
        const selectedUniversityId = universityDropdown.value;
        const filterText = institutesFilter.value.toLowerCase();

        const filteredInstitutes = institutesData.filter(institute => {
            return (
                institute.university_id == selectedUniversityId && 
                institute.institute_name.toLowerCase().includes(filterText)
            );
        });

        populateInstitutesTable(filteredInstitutes);
    }

    
    function populateInstitutesTable(institutes) {
        institutesTableBody.innerHTML = '';
        institutes.forEach(institute => {
            const row = document.createElement('tr');

            
            const removeButtonCell = document.createElement('td');
            const removeButton = document.createElement('button');
            removeButton.setAttribute("id", "delete-button");
            removeButton.textContent = 'Delete Forever';
            removeButton.addEventListener('click', () => removeInstitute(institute.institutes_id));
            removeButtonCell.appendChild(removeButton);
            row.appendChild(removeButtonCell);

            
            const instituteCell = document.createElement('td');
            instituteCell.textContent = institute.institute_name;
            row.appendChild(instituteCell);
            
            
            instituteCell.addEventListener('click', () => {
                window.opener.postMessage({
                    type: 'instituteSelected',
                    institute_id: institute.institutes_id,
                    institute_name: institute.institute_name,
                }, '*');
            });

            institutesTableBody.appendChild(row);
        });
    }

    
    function removeInstitute(instituteId) {
        fetch(`/remove_institute/${instituteId}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    institutesData = institutesData.filter(institute => institute.institutes_id !== instituteId);
                    updateInstitutesTable();
                } else {
                    console.error('Error removing institute:', result.error);
                }
            })
            .catch(error => console.error('Error while removing institute:', error));
    }
});
