document.addEventListener('DOMContentLoaded', () => {
    const myThesesButton = document.getElementById('my-theses');
    const supervisedThesesButton = document.getElementById('supervised-theses');
    
    function populateThesisTable(theses) {
        const tableBody = document.querySelector('#thesis-table tbody');

        
        tableBody.innerHTML = '';

        if (theses.length === 0) {
            
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 6;
            cell.textContent = 'No theses found.';
            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }

        
        theses.forEach((thesis) => {
            const row = document.createElement('tr');
        
            row.innerHTML = `
                <td><p class="thesis-no">${thesis.thesisId || 'N/A'}</p></td>
                <td>${thesis.title || 'N/A'}</td>
                <td>${thesis.author || 'N/A'}</td>
                <td>${thesis.year || 'N/A'}</td>
                <td>${thesis.type || 'N/A'}</td>
                <td>${thesis.topics?.join(', ') || 'N/A'}</td>
            `;
        
            
            row.querySelector('.thesis-no').addEventListener('click', () => {
                displayThesisDetails(thesis);
            });
        
            tableBody.appendChild(row);
        });
        
    }

    
    function fetchAndRender(endpoint) {
        fetch(endpoint)
            .then(response => response.json())
            .then(theses => populateThesisTable(theses))
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }

    fetch('/get_user_roles') 
        .then(response => response.json())
        .then(data => {
            if (data.roles.includes('supervisor')) {
                
                myThesesButton.classList.remove('hidden');
                supervisedThesesButton.classList.remove('hidden');
                fetch('myprofiletheses')
                    .then(response => response.json())
                    .then(theses => populateThesisTable(theses))
                    .catch(error => {
                        console.error('Error fetching data:', error);
                });
                
                myThesesButton.addEventListener('click', () => {
                    fetchAndRender('/myprofiletheses');
                    toggleActiveButton(myThesesButton); 
                    removeActiveClass(supervisedThesesButton); 
                });
                supervisedThesesButton.addEventListener('click', () => {
                    fetchAndRender('/myprofilesupervisor');
                    toggleActiveButton(supervisedThesesButton); 
                    removeActiveClass(myThesesButton); 
                });
            } else {
                fetchAndRender('/myprofiletheses');
            }
        })
        .catch(error => {
            console.error('Error fetching roles:', error);
        });

    const popup = document.getElementById('thesis-details-popup');

    
    function displayThesisDetails(thesis) {
        const detailsTable = document.getElementById('thesis-details-table');

        
        detailsTable.innerHTML = '';

        
        const details = [
            ['Title', thesis.title],
            ['Abstract', thesis.abstract],
            ['Author', thesis.author],
            ['Supervisors', thesis.supervisor?.join(', ')],
            ['Co-Supervisors', thesis.coSupervisors?.join(', ')],
            ['Institute', thesis.institute],
            ['University', thesis.university],
            ['Topics', thesis.topics?.join(', ')],
            ['Keywords', thesis.keywords?.join(', ')],
            ['Type', thesis.type],
            ['Number of Pages', thesis.numPages],
            ['Language', thesis.lang],
            ['Year', thesis.year],
            ['Submission Date', thesis.submissionDate],
        ];
        

        details.forEach(([key, value]) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="text-align: right; font-weight: 450;">${key}</td>
                <td id="thesis-details-doubledot">:</td>
                <td style="text-align: left;">${value || 'N/A'}</td>
            `;
            detailsTable.appendChild(row);
        });

        
        popup.classList.remove('hidden');
    }

    
    window.addEventListener('message', event => {
        if (event.data.type === 'thesisResults') {
            populateThesisTable(event.data.returnedThesis);
        }
    });

    
    window.addEventListener('click', (event) => {
        if (event.target === popup) {
            popup.classList.add('hidden');
        }
    });

    
    document.getElementById('close-popup').addEventListener('click', closePopup);
    function closePopup() {
        popup.classList.add('hidden');
    }

    
    const submissionBtn = document.getElementById('add-theses');
    if (submissionBtn) {
        submissionBtn.addEventListener('click', function () {
            window.location.href = '/submissionpage';
        });
    }

    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            window.location.href = '/logout'; 
        });
    }

    
    const indexBtn = document.getElementById('index');
    if (indexBtn) {
        indexBtn.addEventListener('click', function () {
            window.location.href = '/index';
        });
    }
    
    function toggleActiveButton(button) {
        button.classList.add('active'); 
        button.style.backgroundColor = '#548b05'; 
    }

    
    function removeActiveClass(button) {
        button.classList.remove('active'); 
        button.style.backgroundColor = ''; 
    }
});
