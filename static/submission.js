document.addEventListener('DOMContentLoaded', () => {
        //logout button
        const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', function() {
                    window.location.href = '/logout';  // Redirect to /logout to clear the session
                });
            } else {
                console.log("Logout button not found!"); // This will log if the button isn't found
            }
        
        //profile button
        const profileBtn = document.getElementById('my-profile');
            if (profileBtn) {
                profileBtn.addEventListener('click', function() {
                    window.location.href = '/myprofile';  
                });
            } else {
                console.log("Profile button not found!"); 
            }
        // Topic menu 

        const topicsTextarea = document.getElementById('topics-textarea');
        const topicsHiddenInput = document.getElementById('topics-hidden-input'); // Hidden field to store IDs
        const clearButton = document.getElementById('topic-menu-clear-btn'); // Clear button

        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'topicSelected') {
                const { subject_topics_id, topic_name } = event.data;

                // Get existing topic names and IDs
                const existingTopics = topicsTextarea.value ? topicsTextarea.value.split(', ') : [];
                const existingTopicIds = topicsHiddenInput.value ? topicsHiddenInput.value.split(',') : [];

                // Check if topic is already selected
                if (!existingTopicIds.includes(String(subject_topics_id))) {
                    // Append the new topic name and ID
                    existingTopics.push(topic_name);
                    existingTopicIds.push(subject_topics_id);

                    // Update the text area and hidden input
                    topicsTextarea.value = existingTopics.join(', ');
                    topicsHiddenInput.value = existingTopicIds.join(',');
                }
            }
        });

        clearButton.addEventListener('click', () => {
            topicsTextarea.value = ''; // Clear the visible textarea
            topicsHiddenInput.value = ''; // Clear the hidden input storing topic IDs
        });

        //language menu
        const languageTextarea = document.getElementById('language-textarea');
        const languageHiddenInput = document.getElementById('language-hidden-input'); // Hidden field to store ID
        const clearLanguageButton = document.getElementById('language-menu-clear-btn'); // Clear button

        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'languageSelected') {
                const { language_id, language } = event.data;

                // Update the text area and hidden input, allowing only one selection
                languageTextarea.value = language; // Display the selected language
                languageHiddenInput.value = language_id; // Store the selected language ID
            }
        });

        clearLanguageButton.addEventListener('click', () => {
            languageTextarea.value = ''; // Clear the visible textarea
            languageHiddenInput.value = ''; // Clear the hidden input storing the language ID
        });
        //keyword menu
        const keywordTextarea = document.getElementById('keyword-textarea');
        const keywordHiddenInput = document.getElementById('keyword-hidden-input'); // Hidden field to store IDs
        const clearkeywordButton = document.getElementById('keyword-menu-clear-btn'); // Clear button

        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'keywordSelected') {
                const { keyword_id, keyword } = event.data;

                const existingKeywords = keywordTextarea.value ? keywordTextarea.value.split(', ') : [];
                const existingKeywordIds = keywordHiddenInput.value ? keywordHiddenInput.value.split(',') : [];

                if (!existingKeywordIds.includes(String(keyword_id))) {
                    existingKeywords.push(keyword);
                    existingKeywordIds.push(keyword_id);


                    keywordTextarea.value = existingKeywords.join(', ');
                    keywordHiddenInput.value = existingKeywordIds.join(',');
                }
            }
        });

        clearkeywordButton.addEventListener('click', () => {
            keywordTextarea.value = ''; // Clear the visible textarea
            keywordHiddenInput.value = ''; // Clear the hidden input storing the keyword IDs
        });
        
        //type dropdown
        const typeDropdown = document.getElementById('submission-type');  // The select element

        // Fetch types data and populate the dropdown
        fetch('/retrieve_types')
            .then(response => response.json())
            .then(types => {
                types.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type.type_id;  // Use type_id as the option value
                    option.textContent = type.type;  // Display the type name
                    typeDropdown.appendChild(option);
                });
            })
            .catch(error => console.error('Error fetching types:', error));

        //university menu
        const universityTextarea = document.getElementById('university-textarea');
        const universityHiddenInput = document.getElementById('university-hidden-input'); // Hidden field to store ID
        const clearUniversityButton = document.getElementById('university-menu-clear-btn'); // Clear button

        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'universitySelected') {
                const { university_id, uni_name } = event.data;

                // Update the text area and hidden input, allowing only one selection
                universityTextarea.value = uni_name; // Display the selected university
                universityHiddenInput.value = university_id; // Store the selected university ID
            }
        });

        clearUniversityButton.addEventListener('click', () => {
            universityTextarea.value = ''; // Clear the visible textarea
            universityHiddenInput.value = ''; // Clear the hidden input storing the university ID
        });
        // Institute menu
        const instituteTextarea = document.getElementById('institute-textarea');
        const instituteHiddenInput = document.getElementById('institute-hidden-input'); // Hidden field to store ID
        const clearInstituteButton = document.getElementById('institute-menu-clear-btn'); // Clear button

        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'instituteSelected') {
                const { institute_id, institute_name } = event.data;

                // Update the text area and hidden input, allowing only one selection
                instituteTextarea.value = institute_name; // Display the selected institute
                instituteHiddenInput.value = institute_id; // Store the selected institute ID
            }
        });

        clearInstituteButton.addEventListener('click', () => {
            instituteTextarea.value = ''; // Clear the visible textarea
            instituteHiddenInput.value = ''; // Clear the hidden input storing the institute ID
        });
        //Supervisor menu
        const supervisorTextarea = document.getElementById('supervisor-textarea');
        const supervisorHiddenInput = document.getElementById('supervisor-hidden-input');
        const cosupervisorTextarea = document.getElementById('cosupervisor-textarea');
        const cosupervisorHiddenInput = document.getElementById('cosupervisor-hidden-input');
        const clearSupervisorBtn = document.getElementById('supervisor-menu-clear-btn');
    
        window.setSupervisor = (supervisorId, supervisorName) => {
            if (supervisorTextarea.value) {
                alert("Only one supervisor is allowed. Please clear the current selection first.");
                return;
            }
    
            supervisorTextarea.value = supervisorName;
            supervisorHiddenInput.value = supervisorId;
        };
    
        window.setCosupervisor = (cosupervisorId, cosupervisorName) => {
            if (!supervisorTextarea.value) {
                alert("You must select a supervisor first before adding cosupervisors.");
                return;
            }
    
            if (!cosupervisorTextarea.value.includes(cosupervisorName)) {
                const cosupervisors = cosupervisorTextarea.value ? cosupervisorTextarea.value.split('\n') : [];
                cosupervisors.push(cosupervisorName);
                cosupervisorTextarea.value = cosupervisors.join('\n');
    
                const cosupervisorIds = cosupervisorHiddenInput.value ? cosupervisorHiddenInput.value.split(',') : [];
                cosupervisorIds.push(cosupervisorId);
                cosupervisorHiddenInput.value = cosupervisorIds.join(',');
            } else {
                alert("This cosupervisor is already added.");
            }
        };
    
        clearSupervisorBtn.addEventListener('click', () => {
            supervisorTextarea.value = '';
            supervisorHiddenInput.value = '';
            cosupervisorTextarea.value = '';
            cosupervisorHiddenInput.value = '';
        });
});

//pop up window child menus
function showTopicMenu(){
    const sList = window.open("/topicmenu", "list", "top=50,left=100,width=300px,height=600px,resizable=yes,scrollbars=yes");
    }
function showLanguageMenu(){
    const sList = window.open("/languagemenu", "list", "top=50,left=100,width=300px,height=600px,resizable=yes,scrollbars=yes");
    }
function showKeywordMenu(){
    const sList = window.open("/keywordmenu", "list", "top=50,left=100,width=300px,height=600px,resizable=yes,scrollbars=yes");
    }
function showUniversityMenu(){
    const sList = window.open("/universitymenu", "list", "top=50,left=100,width=300px,height=600px,resizable=yes,scrollbars=yes");
    }
function showInstituteMenu(){
    const sList = window.open("/institutemenu", "list", "top=50,left=100,width=300px,height=600px,resizable=yes,scrollbars=yes");
    }
function showSupervisorMenu(){
    const sList = window.open("/supervisormenu", "list", "top=50,left=100,width=300px,height=600px,resizable=yes,scrollbars=yes");
    }

//thesis submission
document.getElementById('submit-thesis-btn').addEventListener('click', async () => {
    const title = document.getElementById('submission-title').value;
    const abstract = document.getElementById('submission-abstract').value;
    const year = document.getElementById('submission-year').value;
    const type_id = document.getElementById('submission-type').value;
    const institute_id = document.getElementById('institute-hidden-input').value;
    const university_id = document.getElementById('university-hidden-input').value;
    const number_of_pages = document.getElementById('number-of-pages-submission').value;
    const language_id = document.getElementById('language-hidden-input').value;
    const submission_date = new Date().toISOString().slice(0, 10); // Current date in YYYY-MM-DD
    
    const keywords = document.getElementById('keyword-hidden-input').value.split(',').filter(Boolean);
    const topics = document.getElementById('topics-hidden-input').value.split(',').filter(Boolean);
    const supervisor_ids = document.getElementById('supervisor-hidden-input').value.split(',').filter(Boolean);
    const cosupervisor_ids = document.getElementById('cosupervisor-hidden-input').value.split(',').filter(Boolean);
    
    // Perform validation for mandatory fields
    if (!title) {
        alert('Error: Thesis title is required');
        return;
    }
    if (!number_of_pages) {
        alert('Error: Number of pages is required.');
        return;
    }
    if (!year) {
        alert('Error: Thesis year is required.');
        return;
    }
    if (!abstract) {
        alert('Error: Thesis abstract is required.');
        return;
    }
    if (!type_id) {
        alert('Error: Thesis type is required.');
        return;
    }
    if (!topics) {
        alert('Error: At least one topic is required.');
        return;
    }
    if (!language_id) {
        alert('Error: Thesis language is required.');
        return;
    }
    if (!university_id) {
        alert('Error: University is required.');
        return;
    }
    if (!institute_id) {
        alert('Error: Institute is required.');
        return;
    }
    if (!supervisor_ids || supervisor_ids.length === 0) {
        alert('At least one supervisor is required.');
        return;
    }
    if (supervisor_ids.some(id => !id)) {
        alert('Error: Invalid supervisor ID format.');
        return;
    }
    
    if (cosupervisor_ids.some(id => !id)) {
        alert('Error: Invalid co-supervisor ID format.');
        return;
    }
    
    const payload = {
        title,
        abstract,
        year,
        type_id,
        institute_id,
        university_id,
        number_of_pages,
        language_id,
        submission_date,
        keywords,
        topics,
        supervisor_ids,
        cosupervisor_ids
    };

    try {
        const response = await fetch('/submit_thesis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        // Handle server response
        if (result.status === 'success') {
            alert(`Thesis submitted successfully! Thesis ID: ${result.thesis_id}`);

        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Submission failed', error);
        alert('An error occurred. Please try again.');
    }
});
