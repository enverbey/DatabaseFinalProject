document.addEventListener('DOMContentLoaded', () => {

    
    function populateThesisTable(theses) {
        const tableBody = document.querySelector('#thesis-table tbody');

        
        tableBody.innerHTML = '';

        if (theses.length === 0) {
            
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 6;
            cell.textContent = 'No results found.';
            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }

        
        theses.forEach((thesis) => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td><p class="thesis-no">${thesis.thesis_id}</p></td>
                <td>${thesis.title || 'N/A'}</td>
                <td>${thesis.author_name || 'N/A'}</td>
                <td>${thesis.year || 'N/A'}</td>
                <td>${thesis.type || 'N/A'}</td>
                <td>${thesis.topic_name || 'N/A'}</td>
            `;

            
            row.querySelector('.thesis-no').addEventListener('click', () => {
                displayThesisDetails(thesis);
            });

            tableBody.appendChild(row);
        });
    }

    const popup = document.getElementById('thesis-details-popup');

    
    function displayThesisDetails(thesis) {
        const detailsTable = document.getElementById('thesis-details-table');

        
        detailsTable.innerHTML = '';

        
        const details = [
            ['Title', thesis.title],
            ['Abstract', thesis.abstract],
            ['Author', thesis.author_name],
            ['Supervisors', thesis.supervisor_name],
            ['Co-Supervisors', thesis.cosupervisor_name],
            ['Institute', thesis.institute_name],
            ['University', thesis.university_name],
            ['Topic', thesis.topic_name],
            ['Keyword', thesis.keyword],
            ['Type', thesis.type],
            ['Number of Pages', thesis.number_of_pages],
            ['Language', thesis.language],
            ['Year', thesis.year],
            ['Submission Date', thesis.submission_date],
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

    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            window.location.href = '/logout';  
        });
    }

    
    const profileBtn = document.getElementById('my-profile');
    if (profileBtn) {
        profileBtn.addEventListener('click', function() {
            window.location.href = '/myprofile';  
        });
    }

    
    const searchBtn = document.getElementById('search-theses');
    if (searchBtn) {
        searchBtn.addEventListener('click', function () {
            const sList = window.open("/searchmenu", "list", "top=50,left=100,width=300px,height=632px,resizable=yes,scrollbars=yes");
        });
    }

});
