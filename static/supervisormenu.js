document.addEventListener('DOMContentLoaded', () => {
    const supervisorsTableBody = document.getElementById('supervisors-body');
    const supervisorsNameFilter = document.getElementById('supervisors-name-filter');
    const supervisorsPhoneFilter = document.getElementById('supervisors-phone-filter');
    const addSupervisorNameInput = document.getElementById('supervisor-name-adder');
    const addSupervisorSurnameInput = document.getElementById('supervisor-surname-adder');
    const addSupervisorPhoneInput = document.getElementById('supervisor-phone-adder');
    const addSupervisorEmailInput = document.getElementById('supervisor-mail-adder');
    const addSupervisorButton = document.getElementById('addsupervisorbutton');

    let supervisorsData = [];

    // Fetch supervisors data from the server
    fetch('/retrieve_supervisors_for_supervisor_menu')
        .then(response => response.json())
        .then(supervisors => {
            supervisorsData = supervisors;
            populateSupervisorsTable(supervisors);
        })
        .catch(error => console.error('Error while fetching supervisors:', error));

    // Filter supervisors based on name or phone
    supervisorsNameFilter.addEventListener('input', filterSupervisors);
    supervisorsPhoneFilter.addEventListener('input', filterSupervisors);

    // Add a new supervisor
    addSupervisorButton.addEventListener('click', () => {
        const name = addSupervisorNameInput.value.trim();
        const surname = addSupervisorSurnameInput.value.trim();
        const phone = addSupervisorPhoneInput.value.trim();
        const email = addSupervisorEmailInput.value.trim();

        if (name && surname) {
            fetch('/add_supervisor_to_supervisor_menu', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name_surname: `${name} ${surname}`, phone, supervisor_email: email })
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    supervisorsData.push(result.supervisor);
                    populateSupervisorsTable(supervisorsData);
                    // Clear input fields
                    addSupervisorNameInput.value = '';
                    addSupervisorSurnameInput.value = '';
                    addSupervisorPhoneInput.value = '';
                    addSupervisorEmailInput.value = '';
                } else {
                    alert('Error adding supervisor:' + result.error);
                }
            })
            .catch(error => console.error('Error while adding supervisor:', error));
        }
    });

    // Populate the supervisors table
    function populateSupervisorsTable(supervisors) {
        supervisorsTableBody.innerHTML = '';
        supervisors.forEach(supervisor => {
            const row = document.createElement('tr');
            
            // Remove button cell
            const removeButtonCell = document.createElement('td');
            const removebuttoncellDiv = document.createElement('div');
            removebuttoncellDiv.setAttribute("style", "width:100%; display: flex; flex-direction:column; gap:5px; justify-content: space-between;");
            removeButtonCell.appendChild(removebuttoncellDiv);
            const removeButton = document.createElement('button');
            removeButton.setAttribute("id", "delete-button");
            removeButton.textContent = 'Delete Forever';
            removeButton.addEventListener('click', () => removeSupervisor(supervisor.supervisor_id));
            removebuttoncellDiv.appendChild(removeButton);
            row.appendChild(removeButtonCell);

            // Supervisor cell
            const supervisorCell = document.createElement('td');
            supervisorCell.textContent = supervisor.name_surname;
            row.appendChild(supervisorCell);

            // Phone cell
            const phoneCell = document.createElement('td');
            phoneCell.textContent = supervisor.phone || 'N/A';
            row.appendChild(phoneCell);

            // Email cell
            const emailCell = document.createElement('td');
            emailCell.textContent = supervisor.supervisor_email;
            row.appendChild(emailCell);

            // Add supervisor cell
            const addbuttoncell = document.createElement('td');
            const addbuttoncellDiv = document.createElement('div');
            addbuttoncellDiv.setAttribute("style", "width:100%; display: flex; flex-direction:column; gap:5px; justify-content: space-between;");
            addbuttoncell.appendChild(addbuttoncellDiv);
            const addsupervisorbutton = document.createElement('button');
            const addcosupervisorbutton = document.createElement('button');
            addsupervisorbutton.setAttribute("id", "addsupervisor-button");
            addcosupervisorbutton.setAttribute("id", "addcosupervisor-button");
            addbuttoncellDiv.appendChild(addsupervisorbutton);
            addbuttoncellDiv.appendChild(addcosupervisorbutton);
            addsupervisorbutton.textContent = 'S';
            addcosupervisorbutton.textContent = 'C';
            addsupervisorbutton.addEventListener('click', () => setSupervisor(supervisor.supervisor_id));
            addcosupervisorbutton.addEventListener('click', () => setCosupervisor(supervisor.supervisor_id));
            row.appendChild(addbuttoncell);

            supervisorsTableBody.appendChild(row);
        });
    }

    function setSupervisor(supervisorId) {
        const supervisor = supervisorsData.find(s => s.supervisor_id === supervisorId);
        if (supervisor) {
            window.opener.setSupervisor(supervisorId, supervisor.name_surname);
        }
    }
    
    function setCosupervisor(cosupervisorId) {
        const cosupervisor = supervisorsData.find(s => s.supervisor_id === cosupervisorId);
        if (cosupervisor) {
            window.opener.setCosupervisor(cosupervisorId, cosupervisor.name_surname);
        }
    }
    

    // Filter supervisors
    function filterSupervisors() {
        const nameFilterText = supervisorsNameFilter.value.toLowerCase();
        const phoneFilterText = supervisorsPhoneFilter.value.toLowerCase();
        const filteredSupervisors = supervisorsData.filter(supervisor => {
            return supervisor.name_surname.toLowerCase().includes(nameFilterText) && 
                   (supervisor.phone ? supervisor.phone.toLowerCase().includes(phoneFilterText) : true);
        });
        populateSupervisorsTable(filteredSupervisors);
    }

    // Remove supervisor
    function removeSupervisor(supervisorId) {
        fetch(`/remove_supervisor/${supervisorId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                supervisorsData = supervisorsData.filter(supervisor => supervisor.supervisor_id !== supervisorId);
                populateSupervisorsTable(supervisorsData);
            } else {
                console.error('Error removing supervisor:', result.error);
            }
        })
        .catch(error => console.error('Error while removing supervisor:', error));
    }
});
